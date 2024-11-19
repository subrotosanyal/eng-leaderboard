import React, { useState } from 'react';
import { commonStyle } from './styles/commonStyles.ts';

interface SearchBarProps {
  engineers: { name: string; avatar: string }[];
  selectedNames?: { name: string; avatar: string }[];
  setSelectedNames?: (names: { name: string; avatar: string }[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ engineers, selectedNames = [], setSelectedNames }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{ name: string; avatar: string }[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value) {
      const filteredResults = engineers.filter(engineer =>
        engineer.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedNames.some(selected => selected.name === engineer.name)
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  };

  const handleSelectName = (engineer: { name: string; avatar: string }) => {
    if (setSelectedNames) {
      setSelectedNames([...selectedNames, engineer]);
    }
    setSearch('');
    setResults([]);
  };

  return (
    <div className="mb-4" style={commonStyle}>
      <input
        type="text"
        placeholder="Search for an engineer..."
        value={search}
        onChange={handleSearchChange}
        className="border p-2 rounded w-full"
        style={commonStyle}
      />
      {results.length > 0 && (
        <div className="border mt-2 rounded bg-white shadow-lg" style={commonStyle}>
          {results.map(engineer => (
            <div
              key={engineer.name}
              onClick={() => handleSelectName(engineer)}
              className="cursor-pointer p-2 hover:bg-gray-200 flex items-center"
            >
              <img src={engineer.avatar} alt={engineer.name} className="w-6 h-6 rounded-full mr-2" />
              {engineer.name}
            </div>
          ))}
        </div>
      )}
      {search && results.length === 0 && (
        <div className="border mt-2 rounded bg-white shadow-lg p-2 text-gray-500">
          No results found
        </div>
      )}
      <div className="mt-2 flex flex-wrap">
        {selectedNames.map(({ name, avatar }) => (
          <div key={name} className="bg-blue-200 text-blue-800 rounded-full px-3 py-1 m-1 flex items-center" style={commonStyle} title={name}>
            <img src={avatar} alt={name} className="w-6 h-6 rounded-full mr-2" />
            {setSelectedNames && (
              <button onClick={() => setSelectedNames(selectedNames.filter(n => n.name !== name))} style={commonStyle} className="ml-2 text-red-500">✕</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;