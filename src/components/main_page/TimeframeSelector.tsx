import React from 'react';
import CustomDropdown from './CustomDropdown';
import type { TimeframeOption, Sprint } from '../../types';
import {commonStyle} from "../styles/commonStyles.ts";

interface TimeframeSelectorProps {
  selected: TimeframeOption;
  sprints: Sprint[];
  onChange: (option: TimeframeOption) => void;
  isLoading: boolean;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ selected, sprints, onChange, isLoading }) => {
  const sprintOptions = sprints.map((sprint) => ({
    id: sprint.id,
    label: sprint.name,
    value: sprint.id,
    type: 'sprint' as const,
  }));

  const options: TimeframeOption[] = [
    ...sprintOptions,
    {
      id: 'custom-date-range',
      label: 'Custom Date Range',
      value: 'custom-date-range',
      type: 'custom-range' as const,
    },
  ];

  return (
      <div className="flex flex-col space-y-4" style={commonStyle}>
        {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-500"></div>
        ) : (
            <CustomDropdown options={options} selected={selected} onChange={onChange} />
        )}
      </div>
  );
};

export default TimeframeSelector;