
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BillItem, Person } from '../types';
import { Plus, Trash2, X } from 'lucide-react';

interface ItemAssignmentProps {
  items: BillItem[];
  people: Person[];
  currencySymbol: string;
  fxRate: number;
  dispatch: React.Dispatch<any>;
}

const ItemPriceInput: React.FC<{
    itemIndex: number;
    price: number;
    fxRate: number;
    dispatch: React.Dispatch<any>;
}> = ({ itemIndex, price, fxRate, dispatch }) => {
    const [localPrice, setLocalPrice] = useState((price * fxRate).toFixed(2));

    useEffect(() => {
        setLocalPrice((price * fxRate).toFixed(2));
    }, [price, fxRate]);

    const handleBlur = () => {
        const numericValue = parseFloat(localPrice);
        if (!isNaN(numericValue)) {
            dispatch({ type: 'UPDATE_ITEM_PRICE', payload: { itemIndex, price: numericValue / fxRate } });
        } else {
            setLocalPrice((price * fxRate).toFixed(2));
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (parseFloat(e.target.value) === 0) {
            e.target.value = '';
        }
        setLocalPrice(e.target.value);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <input
            type="number"
            value={localPrice}
            onChange={(e) => setLocalPrice(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            step="0.01"
            placeholder="0.00"
            className="w-20 text-right p-1 bg-transparent font-mono text-xs text-gray-800 rounded-md border border-gray-300 focus:border-agoda-blue focus:outline-none focus:ring-1 focus:ring-agoda-blue"
        />
    );
};


const ItemAssignment: React.FC<ItemAssignmentProps> = ({ items, people, currencySymbol, fxRate, dispatch }) => {
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressOrContext = useRef(false);

  const handlePressStart = (itemIndex: number, personIndex: number) => {
    isLongPressOrContext.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPressOrContext.current = true;
      dispatch({ type: 'UPDATE_ITEM_SHARE', payload: { itemIndex, personIndex, change: -1 } });
    }, 500); // 500ms threshold for long press
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };
  
  const handleClick = (itemIndex: number, personIndex: number) => {
    if (!isLongPressOrContext.current) {
      dispatch({ type: 'UPDATE_ITEM_SHARE', payload: { itemIndex, personIndex, change: 1 } });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, itemIndex: number, personIndex: number) => {
    e.preventDefault();
    
    // If a long press was already handled, do nothing to prevent double action
    if (isLongPressOrContext.current) return;

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    isLongPressOrContext.current = true;
    dispatch({ type: 'UPDATE_ITEM_SHARE', payload: { itemIndex, personIndex, change: -1 } });
  };
  
  const handleAddItem = () => {
    const price = parseFloat(manualItemPrice);
    if (manualItemName && !isNaN(price) && price > 0) {
      dispatch({ type: 'ADD_ITEM', payload: { name: manualItemName, price } });
      setManualItemName('');
      setManualItemPrice('');
      setShowAddItem(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) === 0) {
      e.target.value = '';
    }
  };

  return (
    <div className="mt-4">
      <div>
        <p className="text-xs text-gray-500">Assign items by tapping a person's icon to add a share.</p>
        <small className="text-[10px] text-gray-400">(Long-press or right-click on an icon to remove a share)</small>
      </div>
      
      <div className="space-y-3 mb-4 border-t py-4 border-gray-200 mt-2">
        {items.map((item, itemIndex) => {
           return (
            <div key={itemIndex} className="item-row p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow pr-2">
                        <input
                            type="text"
                            value={item.name}
                            onChange={(e) => dispatch({ type: 'UPDATE_ITEM_NAME', payload: { itemIndex, name: e.target.value } })}
                            className="w-full p-1 -ml-1 bg-transparent text-xs font-medium text-gray-800 rounded-md border border-transparent focus:border-gray-300 focus:bg-white focus:outline-none"
                            placeholder="Item Name"
                        />
                        {item.translatedName && item.translatedName.toLowerCase() !== item.name.toLowerCase() && (
                            <p className="text-[10px] text-accent mt-1 pl-1 font-medium">{item.translatedName}</p>
                        )}
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <span className="font-mono text-xs text-gray-500">{currencySymbol}</span>
                        <ItemPriceInput 
                          itemIndex={itemIndex}
                          price={item.price}
                          fxRate={fxRate}
                          dispatch={dispatch}
                        />
                         <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { itemIndex } })} className="ml-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Remove item">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-2">
                        {people.map((person, personIndex) => {
                            const shareCount = item.shares[personIndex];
                            return (
                                <div key={person.id} className="relative">
                                    <button
                                        onMouseDown={() => handlePressStart(itemIndex, personIndex)}
                                        onMouseUp={handlePressEnd}
                                        onTouchStart={() => handlePressStart(itemIndex, personIndex)}
                                        onTouchEnd={handlePressEnd}
                                        onClick={() => handleClick(itemIndex, personIndex)}
                                        onContextMenu={(e) => handleContextMenu(e, itemIndex, personIndex)}
                                        className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs transition-transform transform hover:scale-110"
                                        style={{ backgroundColor: person.color }}
                                        title={person.name}
                                    >
                                        {person.name.substring(0, 2).toUpperCase()}
                                    </button>
                                    {shareCount > 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold border-2 border-slate-50 pointer-events-none">
                                            {shareCount}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
           )
        })}
      </div>

      {showAddItem ? (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-xs text-gray-800">Quick Add Item</h4>
            <button onClick={() => setShowAddItem(false)} className="text-gray-500 hover:text-gray-700" aria-label="Cancel adding item">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              value={manualItemName}
              onChange={(e) => setManualItemName(e.target.value)}
              className="w-full sm:flex-grow p-2 border rounded-md text-xs bg-white text-gray-900 border-gray-300"
              placeholder="Item Name"
            />
            <input
              type="number"
              value={manualItemPrice}
              onChange={(e) => setManualItemPrice(e.target.value)}
              className="w-full sm:w-24 p-2 border rounded-md text-xs bg-white text-gray-900 border-gray-300"
              placeholder="Price"
            />
            <button onClick={handleAddItem} className="w-full sm:w-auto bg-primary text-primary-foreground font-bold p-2 sm:px-3 rounded-md flex items-center justify-center" aria-label="Add item">
              <Plus size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button 
            onClick={() => setShowAddItem(true)}
            className="w-full mt-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus size={14} />
          <span className="text-xs font-medium">Quick Add Item</span>
        </button>
      )}
    </div>
  );
};

export default ItemAssignment;
