import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { commonStyle } from '../styles/commonStyles.ts';

interface DateRangeSelectorProps {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
    onApply?: () => void; // Make onApply optional
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    onApply
}) => {
    return (
        <div className="mt-4 border p-4 rounded shadow-lg" style={{ ...commonStyle, backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
            <div className="flex space-x-4">
                <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    placeholderText="Start Date"
                    selectsStart
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    maxDate={endDate || new Date()}
                    className="border p-2 rounded date-picker"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => setEndDate(date)}
                    placeholderText="End Date"
                    selectsEnd
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    minDate={startDate || undefined}
                    className="border p-2 rounded date-picker"
                />
            </div>
            {onApply && (
                <button
                    onClick={onApply}
                    className="mt-4 px-4 py-2 rounded"
                    disabled={!startDate || !endDate}
                    style={{ backgroundColor: 'var(--button-bg-color)', color: 'var(--button-text-color)' }}
                >
                    Apply
                </button>
            )}
        </div>
    );
};

export default DateRangeSelector;