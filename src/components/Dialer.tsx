import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Delete, X } from 'lucide-react';

interface DialerProps {
  initialValue?: string;
  onCall: (number: string) => void;
  onClose: () => void;
}

export const Dialer: React.FC<DialerProps> = ({ initialValue = '', onCall, onClose }) => {
  const [number, setNumber] = useState(initialValue);

  useEffect(() => {
    setNumber(initialValue);
  }, [initialValue]);

  const handleKeyPress = (val: string) => {
    if (number.length < 32) {
      setNumber(prev => prev + val);
    }
  };

  const handleDelete = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-white z-30 flex flex-col pt-12"
    >
      <div className="flex justify-end px-6">
        <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="h-32 flex items-center justify-center mb-8 px-6 w-full">
          <span className="text-4xl font-light tracking-wider text-neutral-800 break-all text-center leading-tight">
            {number}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="w-20 h-20 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-full flex flex-col items-center justify-center transition-colors group"
            >
              <span className="text-3xl font-medium text-neutral-800">{key}</span>
              {key === '1' && <span className="text-[10px] text-neutral-400 font-semibold">&nbsp;</span>}
              {key === '2' && <span className="text-[10px] text-neutral-400 font-semibold">ABC</span>}
              {key === '3' && <span className="text-[10px] text-neutral-400 font-semibold">DEF</span>}
              {key === '4' && <span className="text-[10px] text-neutral-400 font-semibold">GHI</span>}
              {key === '5' && <span className="text-[10px] text-neutral-400 font-semibold">JKL</span>}
              {key === '6' && <span className="text-[10px] text-neutral-400 font-semibold">MNO</span>}
              {key === '7' && <span className="text-[10px] text-neutral-400 font-semibold">PQRS</span>}
              {key === '8' && <span className="text-[10px] text-neutral-400 font-semibold">TUV</span>}
              {key === '9' && <span className="text-[10px] text-neutral-400 font-semibold">WXYZ</span>}
            </button>
          ))}
          <div />
          <button 
            disabled={!number}
            onClick={() => onCall(number)}
            className="w-20 h-20 bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
          >
            <Phone size={32} fill="white" className="text-white" />
          </button>
          <button 
            onClick={handleDelete}
            className="w-20 h-20 flex items-center justify-center text-neutral-400 hover:text-neutral-600 active:text-neutral-800 transition-colors"
          >
            <Delete size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
