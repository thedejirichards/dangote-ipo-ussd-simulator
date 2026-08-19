export interface USSDMenu {
  id: string;
  text: string;
  options?: USSDOption[];
  isInput?: boolean;
  inputType?: 'text' | 'number';
}

export interface USSDOption {
  key: string;
  label: string;
  nextMenuId?: string;
  action?: (input?: string) => void;
}

export type PhoneScreen = 'home' | 'dialer' | 'ussd';

export interface AppIcon {
  id: string;
  name: string;
  icon: string; // Lucide icon name or URL
  color: string;
}
