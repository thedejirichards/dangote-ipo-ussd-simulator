/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { HomeScreen } from './components/HomeScreen';
import { Dialer } from './components/Dialer';
import { USSDDialog } from './components/USSDDialog';
import { DemoPanel } from './components/DemoPanel';
import { PhoneScreen, USSDMenu } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { FlowContext, ScreenId, parseDial, render, transition } from './ussdFlow';

export default function App() {
  const [screen, setScreen] = useState<PhoneScreen>('home');
  const [flow, setFlow] = useState<{ screen: ScreenId; context: FlowContext } | null>(null);
  const [hasUssdPin, setHasUssdPin] = useState(true);
  const [dialerInitialValue, setDialerInitialValue] = useState('');
  const [showNotification, setShowNotification] = useState(true);

  const toMenu = (screenId: ScreenId, context: FlowContext): USSDMenu => {
    const rendered = render(screenId, context);
    return { id: screenId, text: rendered.text, isInput: rendered.isInput, inputType: rendered.inputType };
  };

  const ussdMenu = flow ? toMenu(flow.screen, flow.context) : null;

  const dialDemo = (code: string) => {
    setDialerInitialValue(code);
    setScreen('dialer');
    setShowNotification(false);
  };

  const handleShortcut = (type: 'self' | 'minor' | 'third_party' | 'accept_gift') => {
    if (type === 'self') return dialDemo('*901*33*112#');
    if (type === 'minor') return dialDemo('*901*33*50*12345678901#');
    if (type === 'third_party') return dialDemo('*901*33*110*0808147797#');
    // accept_gift: demo a first-time customer who hasn't set up a *901# PIN yet.
    setHasUssdPin(false);
    dialDemo('*901*33#');
  };

  const handleCall = (number: string) => {
    const state = parseDial(number, hasUssdPin);
    if (state) {
      setFlow(state);
      setScreen('home');
      return;
    }
    alert(`Simulation: Standard call to ${number}.\nTry *901*33# for the Dangote Refinery IPO menu.`);
  };

  const handleUSSDInput = (input: string) => {
    if (!flow) return;
    const next = transition(flow.screen, flow.context, input);
    if (next.context.hasPin) setHasUssdPin(true);
    setFlow(next);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center gap-10 bg-neutral-100 p-4">
      <PhoneFrame
        onNotchClick={() => handleShortcut('self')}
        onTimeClick={() => handleShortcut('minor')}
        onIconsClick={() => setShowNotification(true)}
      >
        <HomeScreen
          onSearchClick={() => handleShortcut('third_party')}
          onMessagesClick={() => setShowNotification(true)}
          onOpenDialer={() => {
            setDialerInitialValue('');
            setScreen('dialer');
          }}
        />

        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-12 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl z-50 cursor-pointer border border-white/20"
              onClick={() => setShowNotification(false)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MSG</span>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-neutral-800">Messages</p>
                  <p className="text-[11px] text-neutral-500">Just now</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[13px] text-neutral-700 leading-snug">
                  You've been gifted Dangote Refinery shares from Abiodun Gabriel
                </p>
                <p className="text-[13px] text-neutral-700 leading-snug">
                  Shares: 110 | Total: N55,000
                </p>
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShortcut('accept_gift');
                  }}
                  className="text-[13px] text-blue-600 font-bold underline mt-1"
                >
                  Dial *901*33# and choose "Accept Shares" to claim it.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {screen === 'dialer' && (
            <Dialer
              initialValue={dialerInitialValue}
              onCall={handleCall}
              onClose={() => setScreen('home')}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {ussdMenu && (
            <USSDDialog
              menu={ussdMenu}
              onSend={handleUSSDInput}
              onCancel={() => setFlow(null)}
            />
          )}
        </AnimatePresence>
      </PhoneFrame>

      <DemoPanel onDial={dialDemo} />
    </div>
  );
}
