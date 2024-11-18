import { useState } from 'react';
import DateRangeSelector from './DateRangeSelector';
import { DateRange } from '../types';
import { LuGitCompare } from 'react-icons/lu';
import { FaSpinner } from 'react-icons/fa';

const TimeframeComparison = ({ onCompare }: { onCompare: (timeframe1: DateRange, timeframe2: DateRange) => void }) => {
    const [timeframe1, setTimeframe1] = useState<DateRange>({ start: null, end: null });
    const [timeframe2, setTimeframe2] = useState<DateRange>({ start: null, end: null });
    const [loading, setLoading] = useState(false);

    const handleCompare = async () => {
        setLoading(true);
        await onCompare(timeframe1, timeframe2);
        setLoading(false);
    };

    const isCompareDisabled = !timeframe1.start || !timeframe1.end || !timeframe2.start || !timeframe2.end || loading;

    return (
        <div className="flex items-center space-x-8 mb-4">
            <div>
                <label className="block mb-2 font-bold">Period 1</label>
                <DateRangeSelector
                    startDate={timeframe1.start}
                    endDate={timeframe1.end}
                    setStartDate={(date) => setTimeframe1({ ...timeframe1, start: date })}
                    setEndDate={(date) => setTimeframe1({ ...timeframe1, end: date })}
                />
            </div>
            <div>
                <label className="block mb-2 font-bold">Period 2</label>
                <DateRangeSelector
                    startDate={timeframe2.start}
                    endDate={timeframe2.end}
                    setStartDate={(date) => setTimeframe2({ ...timeframe2, start: date })}
                    setEndDate={(date) => setTimeframe2({ ...timeframe2, end: date })}
                />
            </div>
            <button
                onClick={handleCompare}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isCompareDisabled}
            >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <LuGitCompare className="mr-2" />}
                Compare
            </button>
        </div>
    );
};

export default TimeframeComparison;