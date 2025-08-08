
'use client';

import React, { useState, useEffect } from 'react';

interface LoaderProps {
  message?: string;
}

const loadingTexts = [
    "Analyzing your receipt...",
    "Extracting items and prices...",
    "Identifying taxes and service charges...",
    "Translating foreign text (if any)...",
    "Putting it all together for you...",
    "Almost there! Just polishing the details."
];

const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
  const [dynamicText, setDynamicText] = useState(loadingTexts[0]);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Cycle through the loading texts
    const textInterval = setInterval(() => {
      setDynamicText(prevText => {
        const currentIndex = loadingTexts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 2500);

    // Countdown timer
    const countdownInterval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Cleanup intervals on component unmount
    return () => {
        clearInterval(textInterval);
        clearInterval(countdownInterval);
    };
  }, []);
  
  const progress = Math.min(100, ((15 - countdown) / 15) * 100);

  return (
    <div className="fixed inset-0 bg-background flex flex-col justify-center items-center z-50 text-center p-4">
      <div className="relative h-24 w-24 flex items-center justify-center">
          <div className="loader absolute top-0 left-0 ease-linear rounded-full border-8 border-t-8 border-gray-200 h-full w-full"></div>
          <img src="https://i.postimg.cc/x1mkMHxS/image.png" alt="Analyzing" className="h-12" />
      </div>
      <p className="mt-6 text-xl font-semibold text-foreground font-headline">{dynamicText}</p>
      
      <div className="w-full max-w-xs mt-4">
        <div className="w-full bg-muted rounded-full h-2.5 mb-2">
            <div 
                className="bg-primary h-2.5 rounded-full transition-[width] duration-1000 ease-linear" 
                style={{ width: `${progress}%` }}>
            </div>
        </div>
        <p className="text-md text-muted-foreground">
            {countdown > 0 
              ? `This could take up to ${countdown} more second${countdown !== 1 ? 's' : ''}...`
              : "Still working, please be patient..."}
        </p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground max-w-md">
          Use it for lunch, dinner, groceries, or even just to translate a foreign receipt while traveling!
      </p>
    </div>
  );
};

export default Loader;

    