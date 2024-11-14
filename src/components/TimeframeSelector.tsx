import React from 'react';
import CustomDropdown from './CustomDropdown';
import type { TimeframeOption, Sprint } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, subWeeks, subMonths } from 'date-fns';

interface TimeframeSelectorProps {
  selected: TimeframeOption;
  sprints: Sprint[];
  onChange: (option: TimeframeOption) => void;
  isLoading: boolean;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ selected, sprints, onChange, isLoading }) => {
  const sprintOptions = sprints.map(sprint => ({
    id: sprint.id,
    label: sprint.name,
    value: sprint.id,
    type: 'sprint' as const
  }));

  const currentDate = new Date();
  const weekOptions = Array.from({ length: 52 }, (_, i) => {
    const startDate = startOfWeek(subWeeks(currentDate, i));
    const endDate = endOfWeek(startDate);
    return {
      id: `week-${i + 1}`,
      label: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`,
      value: format(startDate, 'yyyy-MM-dd'),
      type: 'week' as const
    };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = startOfMonth(subMonths(currentDate, i));
    return {
      id: `month-${i + 1}`,
      label: format(date, 'MMMM yyyy'),
      value: format(date, 'yyyy-MM-dd'),
      type: 'month' as const
    };
  });

  const options: TimeframeOption[] = [
    ...sprintOptions,
    ...weekOptions,
    ...monthOptions
  ];

  return (
    <div className="flex flex-col space-y-2">
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
      ) : (
        <CustomDropdown options={options} selected={selected} onChange={onChange} />
      )}
    </div>
  );
};

export default TimeframeSelector;