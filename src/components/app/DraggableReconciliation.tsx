
'use client';

import React, { useMemo, useRef } from 'react';
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
}

const DraggableReconciliation: React.FC<DraggableReconciliationProps> = ({
  state,
  currencySymbol,
  fxRate,
  formatNumber,
  isVisible,
  onClose,
}) => {
  const nodeRef = useRef(null);
  const { items, billTotal, splitMode } = state;
  const isMobile = useIsMobile();

  const { totalShares } = useMemo(() => {
    let sharesTotal = 0;
    items.forEach((item: any) => {
        sharesTotal += item.shares.reduce((a: number, b: number) => a + b, 0);
    });
    return { totalShares: sharesTotal };
  }, [items]);

  const { adjustment } = useMemo(() => {
    const assignedSubtotal = items
        .filter((item: any) => item.shares.reduce((a: number, b: number) => a + b, 0) > 0)
        .reduce((sum: number, item: any) => sum + item.price, 0);

    const discountAmount = state.discount.type === 'percentage' ? assignedSubtotal * (state.discount.value / 100) : state.discount.value;
    const subtotalAfterDiscount = assignedSubtotal - discountAmount;
    const serviceChargeAmount = state.taxes.serviceCharge.isEnabled ? state.taxes.serviceCharge.amount : 0;
    const vatAmount = state.taxes.vat.isEnabled ? state.taxes.vat.amount : 0;
    const otherTaxAmount = state.taxes.otherTax.isEnabled ? state.taxes.otherTax.amount : 0;
    const calcTotal = subtotalAfterDiscount + serviceChargeAmount + vatAmount + otherTaxAmount;
    const adj = billTotal > 0 ? billTotal - calcTotal : 0;
    return { adjustment: adj };
  }, [items, state.discount, state.taxes, billTotal]);

  const absAdjustment = Math.abs(adjustment);

  const getWrapperClass = () => {
    const baseClass = "bg-primary text-primary-foreground rounded-xl shadow-lg p-3 sm:p-4 border-2";
    
    if (totalShares === 0 && splitMode === 'item') {
        return `${baseClass} border-primary-foreground/50`;
    }

    const isNearlyReconciled = absAdjustment > 0 && absAdjustment < 0.1;
    const isReconciled = absAdjustment < 0.01;

    if (isReconciled || isNearlyReconciled) {
        return `${baseClass} border-green-300`;
    }
    if (adjustment > 0) { // Shortfall
        return `${baseClass} border-yellow-300`;
    }
    return `${baseClass} border-orange-300`;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Draggable
      axis="y"
      handle=".drag-handle"
      bounds="parent"
      nodeRef={nodeRef}
    >
        <div 
          ref={nodeRef} 
          className={`fixed z-40 cursor-grab ${
            isMobile
              ? "top-40 left-4 w-[calc(100%-2rem)]"
              : "top-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl"
          }`}
        >
            <div className={getWrapperClass()}>
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
