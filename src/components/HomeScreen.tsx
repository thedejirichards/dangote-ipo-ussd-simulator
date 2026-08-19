import React from 'react';
import { motion } from 'motion/react';
import { Phone, MessageSquare, Globe, Camera, Music, Mail, Settings, Calendar, Map, Play, Radio, LayoutGrid } from 'lucide-react';

interface HomeScreenProps {
  onOpenDialer: () => void;
  onSearchClick: () => void;
  onMessagesClick: () => void;
}

const DUMMY_APPS = [
  { id: '1', name: 'Mail', icon: Mail, color: 'bg-gradient-to-b from-blue-400 to-blue-600' },
  { id: '2', name: 'Calendar', icon: Calendar, color: 'bg-white text-red-500' },
  { id: '3', name: 'Photos', icon: Camera, color: 'bg-white text-purple-500' },
  { id: '4', name: 'Camera', icon: Camera, color: 'bg-neutral-800 text-neutral-300' },
  { id: '5', name: 'Maps', icon: Map, color: 'bg-green-500' },
  { id: '6', name: 'Weather', icon: Radio, color: 'bg-sky-400' },
  { id: '7', name: 'Reminders', icon: Radio, color: 'bg-white text-blue-500' },
  { id: '8', name: 'Notes', icon: Radio, color: 'bg-yellow-400 text-neutral-800' },
  { id: '9', name: 'Music', icon: Music, color: 'bg-gradient-to-b from-pink-400 to-pink-600' },
  { id: '10', name: 'Podcasts', icon: Play, color: 'bg-purple-600' },
  { id: '11', name: 'App Store', icon: LayoutGrid, color: 'bg-gradient-to-b from-blue-300 to-blue-500' },
  { id: '12', name: 'Settings', icon: Settings, color: 'bg-neutral-400' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenDialer, onSearchClick, onMessagesClick }) => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6 flex flex-col justify-between relative">
      {/* Search pill */}
      <div 
        onClick={onSearchClick}
        className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 cursor-pointer active:scale-95 transition-all"
      >
        <span className="text-white/50 text-xs font-medium">Search</span>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-4 gap-y-7 gap-x-3 mt-4">
        {DUMMY_APPS.map((app) => (
          <div key={app.id} className="flex flex-col items-center gap-1.5 opacity-90 cursor-default">
            <div className={`w-[60px] h-[60px] ${app.color} rounded-[14px] flex items-center justify-center shadow-lg`}>
              <app.icon size={30} />
            </div>
            <span className="text-[11px] text-white/90 font-medium tracking-tight truncate w-full text-center">{app.name}</span>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div className="bg-white/20 backdrop-blur-xl rounded-[32px] p-4 flex justify-between items-center mb-4">
        <button 
          onClick={onOpenDialer}
          className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Phone size={32} fill="white" className="text-white" />
        </button>
        <div 
          onClick={onMessagesClick}
          className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform"
        >
          <MessageSquare size={32} fill="white" className="text-white" />
        </div>
        <div className="w-14 h-14 bg-sky-400 rounded-2xl flex items-center justify-center shadow-lg opacity-80 cursor-default">
          <Globe size={32} className="text-white" />
        </div>
        <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg opacity-80 cursor-default">
          <Music size={32} className="text-white" />
        </div>
      </div>
    </div>
  );
};
