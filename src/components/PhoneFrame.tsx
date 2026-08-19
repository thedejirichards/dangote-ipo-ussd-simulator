import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  onNotchClick?: () => void;
  onTimeClick?: () => void;
  onIconsClick?: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, onNotchClick, onTimeClick, onIconsClick }) => {
  return (
    <div className="relative w-[390px] h-[844px] bg-black rounded-[55px] shadow-2xl border-[8px] border-neutral-900 overflow-hidden flex flex-col">
      {/* Notch / Dynamic Island area */}
      <div
        onClick={onNotchClick}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-b-[20px] z-50 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
      >
        <div className="w-12 h-1 bg-neutral-800 rounded-full" />
      </div>

      {/* Status Bar */}
      <div className="h-12 w-full flex justify-between items-end px-8 pb-1 z-40">
        <div
          onClick={onTimeClick}
          className="cursor-pointer active:opacity-50 transition-opacity"
        >
          <span className="text-white text-[13px] font-semibold">9:41</span>
        </div>
        <div
          onClick={onIconsClick}
          className="flex gap-1.5 items-center cursor-pointer active:opacity-50 transition-opacity"
        >
          <div className="flex gap-0.5 items-end h-3">
            <div className="w-[3px] h-[40%] bg-white rounded-full" />
            <div className="w-[3px] h-[60%] bg-white rounded-full" />
            <div className="w-[3px] h-[80%] bg-white rounded-full" />
            <div className="w-[3px] h-[100%] bg-white rounded-full" />
          </div>
          <span className="text-white text-[10px] font-bold">5G</span>
          <div className="w-6 h-3 border border-white/50 rounded-[4px] relative flex items-center p-[1px]">
            <div className="h-full w-[80%] bg-white rounded-[2px]" />
            <div className="absolute -right-1 w-0.5 h-1 bg-white/50 rounded-r-full" />
          </div>
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 w-full relative bg-neutral-900 overflow-hidden">
        {children}
      </div>

      {/* Home Indicator */}
      <div className="h-8 w-full flex justify-center items-center pb-2 z-40">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
};
