'use client';

import React, { useState } from 'react';
import { Person } from '../types';
import { PERSON_COLORS } from '../constants';
import { Plus, X } from 'lucide-react';

interface ManagePeopleProps {
  people: Person[];
  dispatch: React.Dispatch<any>;
}

const ManagePeople: React.FC<ManagePeopleProps> = ({ people, dispatch }) => {
    const [newName, setNewName] = useState('');

    const handleAddPerson = () => {
        let personName = newName.trim();

        if (!personName) {
            // Generate a default name like P3, P4...
            // Find all numbers from existing names matching the pattern "P<number>"
            const pNumbers = people
                .map(p => {
                    const match = p.name.match(/^P(\d+)$/i); // Case-insensitive for robustness
                    return match ? parseInt(match[1], 10) : 0;
                });
            
            const maxPNumber = pNumbers.length > 0 ? Math.max(...pNumbers) : 0;
            
            // The next number is the highest of the current person count or the max P-number found, plus one.
            // This handles cases where P-names might have been renamed or have gaps (e.g., P1, P3).
            const nextNumber = Math.max(people.length, maxPNumber) + 1;
            personName = `P${nextNumber}`;
        }

        const nextColorIndex = people.length % PERSON_COLORS.length;
        const newPerson: Person = {
            id: `p${Date.now()}`,
            name: personName,
            color: PERSON_COLORS[nextColorIndex],
        };
        dispatch({ type: 'ADD_PERSON', payload: newPerson });
        setNewName(''); // Clear input after adding
    };

    const handleRemovePerson = (personId: string) => {
        if (people.length > 1) { // Prevent removing the last person
            dispatch({ type: 'REMOVE_PERSON', payload: { personId } });
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-4">
                {people.map(person => (
                    <div
                        key={person.id}
                        className="flex items-center gap-2 rounded-full py-1 pl-3 pr-2 text-sm font-medium text-white shadow"
                        style={{ backgroundColor: person.color }}
                    >
                        <span>{person.name}</span>
                        <button
                            onClick={() => handleRemovePerson(person.id)}
                            className="bg-white/20 hover:bg-white/40 rounded-full p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={people.length <= 1}
                            aria-label={`Remove ${person.name}`}
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPerson()}
                    placeholder="Custom name or leave blank for P3, P4..."
                    className="flex-grow p-2 border rounded-md text-sm bg-white text-gray-900 border-gray-300 focus:ring-1 focus:ring-agoda-blue focus:border-agoda-blue"
                />
                <button
                    onClick={handleAddPerson}
                    className="bg-agoda-blue hover:bg-agoda-blue-dark text-white font-bold p-2 px-3 rounded-md flex items-center justify-center"
                    aria-label="Add person"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
};
