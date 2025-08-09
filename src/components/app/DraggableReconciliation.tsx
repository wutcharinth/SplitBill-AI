
'use client';

import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import Reconciliation from './Reconciliation';
import { GripVertical, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DraggableReconciliationProps {
  state: any;
  currencySymbol: string;
  fxRate: number;
  formatNumber: (num: number) => string;
  isVisible: boolean;
  onClose: () => void;
  wrapperClass: string;
}

const DraggableReconciliation: React.FC<DraggableReconciliationProps> = ({
  state,
  currencySymbol,
  fxRate,
  formatNumber,
  isVisible,
  onClose,
  wrapperClass,
}) => {
  const nodeRef = useRef(null);
  const isMobile = useIsMobile();
  
  if (!isVisible) {
    return null;
  }

  return (
    <Draggable
      axis="y"
      handle=".drag-handle"
      bounds="parent"
      nodeRef={nodeRef}
      defaultPosition={{x: 0, y: 0}}
    >
        <div 
          ref={nodeRef} 
          className={`fixed z-40 cursor-grab ${
            isMobile
              ? "top-40 left-4 w-[calc(100%-2rem)]"
              : "top-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl"
          }`}
        >
            <div className={wrapperClass}>
                <div className="flex items-start justify-between">
                    <div className="flex-grow">
                        <Reconciliation 
                            state={state} 
                            currencySymbol={currencySymbol} 
                            fxRate={fxRate} 
                            formatNumber={formatNumber}
                            isBalloon={true}
                        />
                    </div>
                    <div className="flex items-center pl-2">
                        <div className="drag-handle p-1 text-primary-foreground/80 hover:text-primary-foreground">
                            <GripVertical size={20} />
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-1 text-primary-foreground/80 hover:text-white transition-colors ml-1"
                            title="Close guide"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Draggable>
  );
};

export default DraggableReconciliation;
