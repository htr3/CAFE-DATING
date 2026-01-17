import React, { ReactNode } from 'react';

export const MobileWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background h-[850px] max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-neutral-900 relative flex flex-col">
        {/* Status Bar Simulation */}
        <div className="h-8 bg-background w-full flex items-center justify-between px-6 text-xs font-medium z-50 select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.5 2 4 4 2 6L12 18L22 6C20 4 16.5 2 12 2Z" /></svg>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7H7C5.9 7 5 7.9 5 9V17C5 18.1 5.9 19 7 19H17C18.1 19 19 18.1 19 17V9C19 7.9 18.1 7 17 7ZM16 17H8V9H16V17Z" /></svg>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="h-5 bg-background w-full flex justify-center items-center pb-2">
          <div className="w-32 h-1 bg-neutral-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
