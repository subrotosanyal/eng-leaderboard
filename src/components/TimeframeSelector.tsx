import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TimeframeOption, Sprint } from '../types';
import { format, startOfWeek, endOfWeek, subWeeks, subMonths } from 'date-fns';

interface TimeframeSelectorProps {
  selected: TimeframeOption;
  sprints: Sprint[];
  onChange: (timeframe: TimeframeOption) => void;
  isLoading?: boolean;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selected,
  sprints,
  onChange,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getWeekOptions = (): TimeframeOption[] => {
    return Array.from({ length: 52 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), i));
      const weekEnd = endOfWeek(weekStart);
      return {
        id: `week-${i}`,
        label: `Week ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
        value: format(weekStart, 'yyyy-MM-dd'),
        type: 'week'
      };
    });
  };

  const getMonthOptions = (): TimeframeOption[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        id: `month-${i}`,
        label: format(date, 'MMMM yyyy'),
        value: format(date, 'yyyy-MM'),
        type: 'month'
      };
    });
  };

  const allOptions = [
    ...sprints.map(sprint => ({
      id: sprint.id,
      label: sprint.name,
      value: sprint.id,
      type: 'sprint' as const
    })),
    ...getWeekOptions(),
    ...getMonthOptions()
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-md 
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
      >
        <span className="text-gray-700">{selected.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10">
          <div className="py-2">
            <div className="px-3 py-2 text-sm font-semibold text-gray-500">Sprints</div>
            {sprints.map(sprint => (
              <button
                key={sprint.id}
                onClick={() => {
                  onChange({
                    id: sprint.id,
                    label: sprint.name,
                    value: sprint.id,
                    type: 'sprint'
                  });
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                  ${selected.id === sprint.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`}
              >
                {sprint.name}
              </button>
            ))}

            <div className="px-3 py-2 text-sm font-semibold text-gray-500 border-t">Weeks</div>
            {getWeekOptions().map(option => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                  ${selected.id === option.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`}
              >
                {option.label}
              </button>
            ))}

            <div className="px-3 py-2 text-sm font-semibold text-gray-500 border-t">Months</div>
            {getMonthOptions().map(option => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100
                  ${selected.id === option.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeframeSelector;