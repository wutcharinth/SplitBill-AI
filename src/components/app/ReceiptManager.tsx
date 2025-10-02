'use client';

import React, { useRef } from 'react';
import { Receipt } from '@/lib/types';
import { Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptManagerProps {
  receipts: Receipt[];
  onAddReceipt: (file: File) => Promise<void>;
  onRemoveReceipt: (receiptId: string) => void;
  disabled?: boolean;
}

const ReceiptManager: React.FC<ReceiptManagerProps> = ({
  receipts,
  onAddReceipt,
  onRemoveReceipt,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAddReceipt(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Receipts ({receipts.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-8 gap-1"
        >
          <Plus size={14} />
          Add Receipt
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>

      {receipts.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {receipts.map((receipt, index) => (
            <div
              key={receipt.id}
              className="relative group border rounded-lg overflow-hidden bg-card"
            >
              {receipt.imageUrl ? (
                <img
                  src={receipt.imageUrl}
                  alt={`Receipt ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-muted">
                  <Upload size={24} className="text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveReceipt(receipt.id)}
                  disabled={disabled}
                  className="h-8 w-8"
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="p-1.5 text-xs bg-background/95">
                <div className="font-medium truncate">{receipt.restaurantName || `Receipt ${index + 1}`}</div>
                <div className="text-muted-foreground">
                  ${receipt.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiptManager;
