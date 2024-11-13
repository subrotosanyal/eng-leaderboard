import React, { useState } from 'react';
import type { TimeframeOption } from '../types';

interface CustomDropdownProps {
  options: TimeframeOption[];
  selected: TimeframeOption;
  onChange: (option: TimeframeOption) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options = [], selected, onChange }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-64"> {/* Adjust the width here */}
      <div
        className="border p-2 rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.label}
      </div>
      {isOpen && (
        <div className="absolute mt-1 w-full bg-white border rounded shadow-lg z-10">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-b p-2 w-full"
          />
          {filteredOptions.map(option => (
            <div
              key={option.id}
              className={`p-2 cursor-pointer ${option.value === selected.value ? 'bg-gray-200' : ''}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;