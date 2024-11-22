import React, { useState } from 'react';
import type { TimeframeOption } from '../../types';
import { commonStyle } from '../styles/commonStyles.ts';
import DateRangeSelector from '../commom_components/DateRangeSelector';

interface CustomDropdownProps {
    options: TimeframeOption[];
    selected: TimeframeOption;
    onChange: (option: TimeframeOption) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, selected, onChange }) => {
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = options.find((option) => option.value == e.target.value);
        if (selectedOption) {
            if (selectedOption.id === 'custom-date-range') {
                setIsDatePickerVisible(true);
            } else {
                onChange(selectedOption);
                setIsDatePickerVisible(false);
            }
        }
    };

    const handleApplyDateRange = () => {
        if (startDate && endDate) {
            if (startDate <= endDate) {
                const customRangeOption: TimeframeOption = {
                    id: 'custom-date-range',
                    label: `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
                    value: `${startDate.toISOString()}|${endDate.toISOString()}`,
                    type: 'custom-range',
                };
                onChange(customRangeOption);
                setIsDatePickerVisible(false); // Close the date picker
            }
        }
    };

    return (
        <div className="relative">
            <select
                value={selected.id === 'custom-date-range' ? 'custom-date-range' : selected.value}
                onChange={handleSelectChange}
                className="border p-2 rounded w-full"
                style={commonStyle}
            >
                {options.map((option) => (
                    <option key={option.id} value={option.value} id={option.id} >
                        {option.label}
                    </option>
                ))}
            </select>

            {isDatePickerVisible && (
                <DateRangeSelector
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    onApply={handleApplyDateRange}
                />
            )}
        </div>
    );
};

export default CustomDropdown;