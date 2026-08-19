import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { USSDMenu } from '../types';
import { Delete } from 'lucide-react';

interface USSDDialogProps {
  menu: USSDMenu;
  onSend: (input: string) => void;
  onCancel: () => void;
}

export const USSDDialog: React.FC<USSDDialogProps> = ({ menu, onSend, onCancel }) => {
  const [input, setInput] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(input);
    setInput('');
    setShowKeyboard(false);
  };

  const handleKeyPress = (key: string) => {
    setInput(prev => prev + key);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <p className="text-neutral-800 text-lg leading-relaxed whitespace-pre-wrap">
              {menu.text}
            </p>
            
            {menu.isInput && (
              <div className="mt-4">
                <div 
                  onClick={() => setShowKeyboard(true)}
                  className="w-full border-b-2 border-green-500 py-2 min-h-[40px] text-xl tracking-wide cursor-pointer break-all"
                >
                  {input || <span className="text-neutral-300 text-base">Tap to enter...</span>}
                </div>
              </div>
            )}
          </div>

          <div className="flex border-t border-neutral-100 h-14">
            {!menu.isInput ? (
              <button 
                onClick={onCancel}
                className="flex-1 text-green-600 font-bold hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
            ) : (
              <>
                <button 
                  onClick={onCancel}
                  className="flex-1 text-neutral-500 font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <div className="w-[1px] bg-neutral-100 h-full" />
                <button
                  onClick={() => {
                    onSend(input);
                    setInput('');
                    setShowKeyboard(false);
                  }}
                  className="flex-1 text-green-600 font-bold hover:bg-neutral-50 transition-colors"
                >
                  Send
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showKeyboard && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-neutral-100 border-t border-neutral-200 p-4 pb-8"
          >
            <div className="grid grid-cols-3 gap-2">
              {keys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className="h-12 bg-white rounded-lg shadow-sm flex items-center justify-center active:bg-neutral-200 transition-colors"
                >
                  <span className="text-xl font-semibold text-neutral-800">{key}</span>
                </button>
              ))}
              <div />
              <div />
              <button
                onClick={handleDelete}
                className="h-12 bg-white rounded-lg shadow-sm flex items-center justify-center active:bg-neutral-200 transition-colors"
              >
                <Delete size={20} className="text-neutral-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
