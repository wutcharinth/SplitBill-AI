
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
                 <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
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
