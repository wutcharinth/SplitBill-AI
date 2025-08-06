import { PiggyBank } from 'lucide-react';
import React from 'react';

const Logo = ({ showSubtitle = false }: { showSubtitle?: boolean }) => {
  return (
    <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <PiggyBank className="w-8 h-8"/>
        </div>
        <div>
            <h1 className="text-2xl font-bold font-headline text-primary tracking-tighter">
                SplitBill AI
            </h1>
            {showSubtitle && <p className="text-xs text-muted-foreground -mt-1">Built with Genkit</p>}
        </div>
    </div>
  );
};

export default Logo;
