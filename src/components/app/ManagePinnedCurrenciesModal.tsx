import React from 'react';
import { ALLOWED_CURRENCIES } from '../constants';
import { Star, X } from 'lucide-react';

interface ManagePinnedCurrenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedCurrencies: string[];
  togglePin: (currencyCode: string) => void;
}

const ManagePinnedCurrenciesModal: React.FC<ManagePinnedCurrenciesModalProps> = ({ isOpen, onClose, pinnedCurrencies, togglePin }) => {
  if (!isOpen) return null;

  const allCurrencies = Object.entries(ALLOWED_CURRENCIES).sort(([codeA], [codeB]) => codeA.localeCompare(codeB));

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Manage Pinned Currencies</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </header>
        <main className="p-4 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-4">Select the currencies you use most often. They will appear at the top of the currency selection list for quick access.</p>
            <div className="flex flex-col space-y-1">
            {allCurrencies.map(([code, name]) => {
                const isPinned = pinnedCurrencies.includes(code);
                return (
                <button
                    key={code}
                    onClick={() => togglePin(code)}
                    className={`flex items-center justify-between p-2 rounded-md text-left transition-colors text-sm w-full ${isPinned ? 'bg-agoda-blue/10' : 'hover:bg-gray-100'}`}
                >
                    <span className="font-medium text-gray-700">{code} - {name}</span>
                    <Star
                        size={18}
                        className={`transition-all duration-200 ${isPinned ? 'text-yellow-500 fill-current' : 'text-gray-400 hover:text-yellow-400'}`}
                    />
                </button>
                );
            })}
            </div>
        </main>
        <footer className="p-4 border-t mt-auto">
            <button
                onClick={onClose}
                className="w-full bg-agoda-blue hover:bg-agoda-blue-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Done
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ManagePinnedCurrenciesModal;
