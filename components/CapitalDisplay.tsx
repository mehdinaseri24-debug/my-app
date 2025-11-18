import React, { useState, useEffect } from 'react';

interface CapitalDisplayProps {
  capital: number;
  onCapitalChange: (newCapital: number) => void;
}

export const CapitalDisplay: React.FC<CapitalDisplayProps> = ({ capital, onCapitalChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localCapital, setLocalCapital] = useState(capital.toString());

  useEffect(() => {
    // Update local state if the prop changes from outside (e.g., initial load)
    setLocalCapital(capital.toString());
  }, [capital]);

  const handleSave = () => {
    const newCapital = parseFloat(localCapital);
    if (!isNaN(newCapital) && newCapital > 0) {
      onCapitalChange(newCapital);
    } else {
      // Reset to the last valid capital if input is invalid
      setLocalCapital(capital.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalCapital(capital.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
      <h2 className="text-lg font-medium text-gray-300">سرمایه شما</h2>
      <div className="mt-1 flex items-center justify-center gap-2 group">
        {isEditing ? (
          <input
            type="number"
            value={localCapital}
            onChange={(e) => setLocalCapital(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-4xl font-bold text-blue-400 bg-transparent text-center w-48 border-b-2 border-blue-500 focus:outline-none transition-all"
            step="1"
            min="1"
          />
        ) : (
          <>
            <p className="text-4xl font-bold text-blue-400 cursor-pointer" onClick={() => setIsEditing(true)}>
              ${capital.toLocaleString()}
            </p>
            <button 
              onClick={() => setIsEditing(true)} 
              aria-label="ویرایش سرمایه" 
              className="text-gray-500 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-white transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
              </svg>
            </button>
          </>
        )}
      </div>
      {!isEditing && <p className="text-xs text-gray-500 mt-2">برای ویرایش روی مبلغ کلیک کنید</p>}
    </div>
  );
};