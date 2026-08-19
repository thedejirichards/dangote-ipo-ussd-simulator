/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Dangote Refinery IPO USSD flow, driven by *901*33#.
// Implements: Self / 3rd Party / Minor purchase, direct-string shortcuts,
// Accept Shares, and the "no *901# PIN yet" gate — per the flow diagrams.

export type ScreenId =
  | 'no_pin_gate'
  | 'pin_cancelled'
  | 'create_pin_account'
  | 'create_pin_card'
  | 'create_pin_dob'
  | 'create_pin_new'
  | 'create_pin_next'
  | 'feature_soon'
  | 'main'
  | 'self_shares'
  | 'self_shares_retry'
  | 'tp_account'
  | 'tp_shares'
  | 'tp_shares_retry'
  | 'minor_nin'
  | 'minor_shares'
  | 'minor_shares_retry'
  | 'confirm'
  | 'select_account'
  | 'enter_pin'
  | 'card_pin'
  | 'success'
  | 'cancelled'
  | 'accept_list'
  | 'accept_confirm'
  | 'accept_pin'
  | 'accept_reject_confirm'
  | 'declined';

export type BuyerType = 'self' | 'third_party' | 'minor';

export interface Claim {
  shares: number;
  total: number;
  sender: string;
}

export interface FlowContext {
  hasPin: boolean;
  buyerType?: BuyerType;
  direct?: boolean; // reached via a direct-string dial (*901*33*...#) rather than the menu
  nin?: string;
  minorName?: string;
  tpAccount?: string;
  tpName?: string;
  shares?: number;
  total?: number;
  paymentAccount?: string;
  claim?: Claim;
  error?: string;
}

export interface FlowState {
  screen: ScreenId;
  context: FlowContext;
}

const SHARE_PRICE = 500;
const DAILY_LIMIT = 100000;
const CARD_PIN_THRESHOLD = 20000;

const ACCOUNTS = [
  { key: '1', label: '078****2345' },
  { key: '2', label: '123*****2345' },
];

// NUBAN account numbers are 10 digits, NINs are 11 — this length difference is
// what lets the direct-string shortcuts tell a 3rd-party account from a minor's NIN apart.
const KNOWN_THIRD_PARTIES: Record<string, string> = {
  '0808147797': 'David Okonkwo',
};
const KNOWN_MINORS: Record<string, string> = {
  '12345678901': 'Zainab Bello',
};

function lookupThirdPartyName(account: string): string {
  return KNOWN_THIRD_PARTIES[account] || 'Access Bank Customer';
}
function lookupMinorName(nin: string): string {
  return KNOWN_MINORS[nin] || 'the registered minor';
}

const PENDING_CLAIMS: Claim[] = [
  { shares: 50, total: 25000, sender: 'Praise Nwosu' },
  { shares: 110, total: 55000, sender: 'Abiodun Gabriel' },
];

const SUCCESS_SEC = 'Success! Your request has been received. NGX will inform you of the status of your subscription, subject to the Securities Exchange Commission (SEC) approval.';
const SUCCESS_THIRD_PARTY = 'Request submitted successfully. Your purchase will be processed once accepted by the beneficiary.';

function money(n: number): string {
  return n.toLocaleString();
}

export function initialState(): FlowState {
  return { screen: 'main', context: { hasPin: true } };
}

// Handles a fresh dial: *901*33#, and the direct-string shortcuts.
export function parseDial(fullNumber: string, hasPin: boolean): FlowState | null {
  if (!fullNumber.startsWith('*901*33') || !fullNumber.endsWith('#')) return null;
  const body = fullNumber.slice(1, -1); // "901*33..."
  const parts = body.split('*').slice(1); // drop "901" -> ["33", ...]

  if (parts.length === 1 && parts[0] === '33') {
    return hasPin
      ? { screen: 'main', context: { hasPin: true } }
      : { screen: 'no_pin_gate', context: { hasPin: false } };
  }

  // *901*33*4# — direct-string shortcut for "Accept Shares" (main-menu option 4).
  if (parts.length === 2 && parts[0] === '33' && parts[1] === '4') {
    return hasPin
      ? { screen: 'accept_list', context: { hasPin: true } }
      : { screen: 'no_pin_gate', context: { hasPin: false } };
  }

  if (!hasPin) {
    return { screen: 'no_pin_gate', context: { hasPin: false } };
  }

  // *901*33*<shares>#  or  *901*33*<shares>*<identifier>#
  const sharesStr = parts[1];
  const identifier = parts[2];
  const shares = parseInt(sharesStr, 10);
  if (isNaN(shares) || shares <= 0) return null;

  const total = shares * SHARE_PRICE;

  if (!identifier) {
    return checkDailyLimit('self_shares_retry', { hasPin: true, direct: true, buyerType: 'self', shares, total });
  }
  if (identifier.length === 10) {
    const tpName = lookupThirdPartyName(identifier);
    return checkDailyLimit('tp_shares_retry', { hasPin: true, direct: true, buyerType: 'third_party', tpAccount: identifier, tpName, shares, total });
  }
  if (identifier.length === 11) {
    const minorName = lookupMinorName(identifier);
    return checkDailyLimit('minor_shares_retry', { hasPin: true, direct: true, buyerType: 'minor', nin: identifier, minorName, shares, total });
  }
  return null;
}

function checkDailyLimit(retryScreen: ScreenId, context: FlowContext): FlowState {
  if ((context.total || 0) > DAILY_LIMIT) {
    return { screen: retryScreen, context: { ...context, error: `The units entered exceed the ₦${money(DAILY_LIMIT)} daily limit. Please enter fewer units (₦${SHARE_PRICE}/unit).` } };
  }
  return { screen: 'confirm', context };
}

function invalid(screen: ScreenId, context: FlowContext, message = 'Invalid selection. Please try again.'): FlowState {
  return { screen, context: { ...context, error: message } };
}

export function transition(screen: ScreenId, context: FlowContext, input: string): FlowState {
  const trimmed = input.trim();

  switch (screen) {
    case 'no_pin_gate':
      if (trimmed === '1') return { screen: 'create_pin_account', context };
      if (trimmed === '2') return { screen: 'pin_cancelled', context };
      return invalid(screen, context);

    case 'create_pin_account':
      if (trimmed === '1' || trimmed === '2') {
        const acct = ACCOUNTS.find(a => a.key === trimmed)!;
        return { screen: 'create_pin_card', context: { ...context, paymentAccount: acct.label } };
      }
      return invalid(screen, context);

    case 'create_pin_card':
      if (trimmed.length >= 4) return { screen: 'create_pin_dob', context };
      return invalid(screen, context, 'Enter a valid 4-digit Debit Card PIN.');

    case 'create_pin_dob':
      if (trimmed.length === 8 && /^\d+$/.test(trimmed)) return { screen: 'create_pin_new', context };
      return invalid(screen, context, 'Enter your DOB as DDMMYYYY, e.g. 26102000.');

    case 'create_pin_new':
      if (trimmed.length >= 4) return { screen: 'create_pin_next', context: { ...context, hasPin: true } };
      return invalid(screen, context, 'Enter a 4-digit PIN.');

    case 'create_pin_next':
      if (trimmed === '1') return { screen: 'main', context };
      if (trimmed === '2' || trimmed === '3') return { screen: 'feature_soon', context };
      return invalid(screen, context);

    case 'main':
      if (trimmed === '1') return { screen: 'self_shares', context: { ...context, buyerType: 'self' } };
      if (trimmed === '2') return { screen: 'tp_account', context: { ...context, buyerType: 'third_party' } };
      if (trimmed === '3') return { screen: 'minor_nin', context: { ...context, buyerType: 'minor' } };
      if (trimmed === '4') return { screen: 'accept_list', context };
      return invalid(screen, context);

    case 'self_shares':
    case 'self_shares_retry': {
      const shares = parseInt(trimmed, 10);
      if (isNaN(shares) || shares <= 0) return invalid(screen, context, 'Enter a valid number of shares.');
      const total = shares * SHARE_PRICE;
      return checkDailyLimit('self_shares_retry', { ...context, shares, total });
    }

    case 'tp_account':
      if (trimmed.length === 10 && /^\d+$/.test(trimmed)) {
        return { screen: 'tp_shares', context: { ...context, tpAccount: trimmed, tpName: lookupThirdPartyName(trimmed) } };
      }
      return invalid(screen, context, 'Enter a valid 10-digit Access Bank account number.');

    case 'tp_shares':
    case 'tp_shares_retry': {
      const shares = parseInt(trimmed, 10);
      if (isNaN(shares) || shares <= 0) return invalid(screen, context, 'Enter a valid number of shares.');
      const total = shares * SHARE_PRICE;
      return checkDailyLimit('tp_shares_retry', { ...context, shares, total });
    }

    case 'minor_nin':
      if (trimmed.length === 11 && /^\d+$/.test(trimmed)) {
        return { screen: 'minor_shares', context: { ...context, nin: trimmed, minorName: lookupMinorName(trimmed) } };
      }
      return invalid(screen, context, 'Enter a valid 11-digit NIN.');

    case 'minor_shares':
    case 'minor_shares_retry': {
      const shares = parseInt(trimmed, 10);
      if (isNaN(shares) || shares <= 0) return invalid(screen, context, 'Enter a valid number of shares.');
      const total = shares * SHARE_PRICE;
      return checkDailyLimit('minor_shares_retry', { ...context, shares, total });
    }

    case 'confirm':
      if (trimmed === '1') return { screen: 'select_account', context };
      if (trimmed === '2') return { screen: 'cancelled', context };
      return invalid(screen, context);

    case 'select_account':
      if (trimmed === '1' || trimmed === '2') {
        const acct = ACCOUNTS.find(a => a.key === trimmed)!;
        return { screen: 'enter_pin', context: { ...context, paymentAccount: acct.label } };
      }
      return invalid(screen, context);

    case 'enter_pin':
      if (trimmed.length >= 4) {
        if ((context.total || 0) > CARD_PIN_THRESHOLD) return { screen: 'card_pin', context };
        return { screen: 'success', context };
      }
      return invalid(screen, context, 'Enter your 4-digit PIN.');

    case 'card_pin':
      if (trimmed.length >= 4) return { screen: 'success', context };
      return invalid(screen, context, 'Enter your 4-digit Debit Card PIN.');

    case 'accept_list':
      if (trimmed === '1' || trimmed === '2') {
        const claim = PENDING_CLAIMS[trimmed === '1' ? 0 : 1];
        return { screen: 'accept_confirm', context: { ...context, claim } };
      }
      return invalid(screen, context);

    case 'accept_confirm':
      if (trimmed === '1') return { screen: 'accept_pin', context };
      if (trimmed === '2') return { screen: 'accept_reject_confirm', context };
      return invalid(screen, context);

    case 'accept_pin':
      if (trimmed.length >= 4) return { screen: 'success', context };
      return invalid(screen, context, 'Enter your 4-digit PIN.');

    case 'accept_reject_confirm':
      if (trimmed === '1') return { screen: 'declined', context };
      if (trimmed === '2') return { screen: 'accept_confirm', context };
      return invalid(screen, context);

    default:
      return { screen, context };
  }
}

export interface RenderedScreen {
  text: string;
  isInput: boolean;
  inputType: 'text' | 'number';
}

export function render(screen: ScreenId, context: FlowContext): RenderedScreen {
  const errorPrefix = context.error ? `${context.error}\n\n` : '';
  const num = (t: string): RenderedScreen => ({ text: errorPrefix + t, isInput: true, inputType: 'number' });
  const done = (t: string): RenderedScreen => ({ text: t, isInput: false, inputType: 'text' });

  switch (screen) {
    case 'no_pin_gate':
      return num('You need to create a *901# PIN to use this service\n1. Continue\n2. Cancel');
    case 'pin_cancelled':
      return done('PIN setup cancelled. Dial *901*33# to try again.');
    case 'create_pin_account':
      return num(`Select account to link.\n${ACCOUNTS.map(a => `${a.key}>${a.label}`).join('\n')}`);
    case 'create_pin_card':
      return num('Enter your 4-digit Debit Card PIN');
    case 'create_pin_dob':
      return num('Confirm your DOB in the format DDMMYYYY, e.g. 26102000');
    case 'create_pin_new':
      return num('Create your 4-digit *901# PIN');
    case 'create_pin_next':
      return num('Success. What would you like to do next?\n1> Dangote IPO\n2> Airtime\n3> Transfer');
    case 'feature_soon':
      return done('Feature coming soon.');

    case 'main':
      return num('Welcome to Dangote Refinery IPO. Who would you like to buy shares for?\n1> Self\n2> 3rd Party (Access Bank customers)\n3> Minor (Below 18 years)\n4> Accept Shares');

    case 'self_shares':
    case 'self_shares_retry':
      return num(`Please enter the number of shares you want to buy (₦${SHARE_PRICE}/share)`);

    case 'tp_account':
      return num("Enter 3rd party's Access Bank account number");
    case 'tp_shares':
    case 'tp_shares_retry':
      return num(`Please enter the number of shares you want to buy (₦${SHARE_PRICE}/share)`);

    case 'minor_nin':
      return num('Enter NIN of beneficiary (Minor)');
    case 'minor_shares':
    case 'minor_shares_retry':
      return num(`Please enter the number of shares you want to buy (₦${SHARE_PRICE}/share)`);

    case 'confirm': {
      const { buyerType, shares, total, tpName, minorName, tpAccount, nin, direct } = context;

      if (direct) {
        if (buyerType === 'third_party') {
          return num(`Buy Dangote Refinery shares for ${tpName}\nAccount:${tpAccount}\nShares :${shares}\nPrice: N${SHARE_PRICE}/share\nTotal : ${money(total || 0)}\n1>Proceed\n2>Decline`);
        }
        if (buyerType === 'minor') {
          return num(`Buy Dangote IPO (DPRP) for ${minorName}\nNIN:${nin}\nShares :${shares}\nPrice: N${SHARE_PRICE}/share\nTotal : ${money(total || 0)}\n1>Proceed\n2>Decline`);
        }
        return num(`Buy Dangote Refinery Shares.\nShares :${shares}\nPrice: N${SHARE_PRICE}/share\nTotal :N${money(total || 0)}\n1>Proceed\n2>Decline`);
      }

      const forWhom = buyerType === 'third_party' ? ` for ${tpName}` : buyerType === 'minor' ? ` for ${minorName}` : '';
      return num(`You are about to buy ${shares} Dangote Refinery shares @₦${SHARE_PRICE}/share${forWhom}.\nTotal: ₦${money(total || 0)}\n1> Proceed\n2> Decline`);
    }

    case 'select_account':
      return num(`Select an account to make payment from.\n${ACCOUNTS.map(a => `${a.key}>${a.label}`).join('\n')}`);
    case 'enter_pin':
      return num('Enter your 4-digit PIN to proceed');
    case 'card_pin':
      return num(`Enter your Debit Card PIN. (This is required for transactions above ₦${money(CARD_PIN_THRESHOLD)}).`);

    case 'success':
      return done(context.buyerType === 'third_party' ? SUCCESS_THIRD_PARTY : SUCCESS_SEC);
    case 'cancelled':
      return done('Your Dangote Refinery share purchase has been cancelled.');

    case 'accept_list':
      return num(`You currently have the following Dangote Refinery shares to claim:\n${PENDING_CLAIMS.map((c, i) => `${i + 1}>${c.shares} shares`).join('\n')}`);
    case 'accept_confirm': {
      const c = context.claim!;
      return num(`Accept ${c.shares} units of Dangote Refinery shares sent to you by ${c.sender}?\nTotal: ₦${money(c.total)}\n1> Accept\n2> Decline`);
    }
    case 'accept_pin':
      return num('Enter your 4-digit PIN to proceed');
    case 'accept_reject_confirm':
      return num(`Are you sure you want to reject your ${context.claim!.shares} Dangote IPO shares?\n1> Yes\n2> No`);
    case 'declined':
      return done(`You have declined the ${context.claim!.shares} units of Dangote shares sent to you by ${context.claim!.sender}.`);

    default:
      return done('Session ended.');
  }
}
