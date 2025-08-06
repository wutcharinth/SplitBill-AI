import React from 'react';

const Logo = ({ showSubtitle = false }: { showSubtitle?: boolean }) => {
  return (
    <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8H28V26C28 27.1046 27.1046 28 26 28H6C4.89543 28 4 27.1046 4 26V8Z" fill="currentColor" fillOpacity="0.2"/>
                <path d="M4 8H28V10H4V8Z" fill="currentColor"/>
                <path d="M10 14H22V16H10V14Z" fill="currentColor" fillOpacity="0.5"/>
                <path d="M10 18H22V20H10V18Z" fill="currentColor" fillOpacity="0.5"/>
                <rect x="10" y="4" width="4" height="6" rx="2" fill="currentColor"/>
                <rect x="18" y="4" width="4" height="6" rx="2" fill="currentColor"/>
            </svg>
        </div>
        <div>
            <h1 className="text-xl font-bold font-headline text-primary tracking-tighter">
                SplitBill AI
            </h1>
            {showSubtitle && <p className="text-xs text-muted-foreground -mt-1">By Genkit</p>}
        </div>
    </div>
  );
};

export default Logo;
