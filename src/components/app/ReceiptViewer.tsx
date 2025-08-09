
'use client';

import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

interface ReceiptViewerProps {
  isVisible: boolean;
  onClose: () => void;
  receiptImage: string;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ isVisible, onClose, receiptImage }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full p-2 sm:p-4">
             <DialogHeader className="p-4 pt-2 pb-2">
                <DialogTitle className="text-lg font-headline">Original Receipt</DialogTitle>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto px-4 pb-4">
                <img 
                    src={`data:image/png;base64,${receiptImage}`} 
                    alt="Uploaded Receipt"
                    className="w-full rounded-lg" 
                />
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;
