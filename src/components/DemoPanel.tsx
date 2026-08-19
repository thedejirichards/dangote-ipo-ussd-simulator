import React from 'react';

interface DemoPanelProps {
  onDial: (code: string) => void;
}

const DEMOS = [
  {
    label: 'Direct String — Self',
    code: '*901*33*112#',
    hint: '*901*33*[number of shares]#',
  },
  {
    label: 'Direct String — Third Party',
    code: '*901*33*110*0808147797#',
    hint: '*901*33*[no of shares]*[account number]#',
  },
  {
    label: 'Direct String — Minor',
    code: '*901*33*50*12345678901#',
    hint: '*901*33*[no of shares]*[NIN]#',
  },
  {
    label: 'Direct String — Acceptance',
    code: '*901*33*4#',
    hint: '*901*33*4#',
  },
];

export const DemoPanel: React.FC<DemoPanelProps> = ({ onDial }) => {
  return (
    <div className="w-72 flex flex-col gap-3">
      <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Direct-string demos</p>
      {DEMOS.map((demo) => (
        <button
          key={demo.code}
          onClick={() => onDial(demo.code)}
          className="text-left bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 hover:border-green-500 hover:shadow-md active:scale-[0.98] transition-all"
        >
          <p className="text-sm font-bold text-neutral-800">{demo.label}</p>
          <p className="text-xs text-neutral-500 font-mono mt-1">{demo.hint}</p>
        </button>
      ))}
    </div>
  );
};
