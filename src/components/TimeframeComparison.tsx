import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateRange } from '../types';
import { useState } from 'react';

const TimeframeComparison = ({ onCompare }: { onCompare: (timeframe1: DateRange, timeframe2: DateRange) => void }) => {
    const [timeframe1, setTimeframe1] = useState<DateRange>({ start: new Date(), end: new Date() });
    const [timeframe2, setTimeframe2] = useState<DateRange>({ start: new Date(), end: new Date() });

    const handleCompare = () => {
        onCompare(timeframe1, timeframe2);
    };

    return (
        <div>
            <div>
                <label>Timeframe 1</label>
                <DatePicker
                    selected={timeframe1.start}
                    onChange={(date) => setTimeframe1({ ...timeframe1, start: date || new Date() })}
                    selectsStart
                    startDate={timeframe1.start}
                    endDate={timeframe1.end}
                />
                <DatePicker
                    selected={timeframe1.end}
                    onChange={(date) => setTimeframe1({ ...timeframe1, end: date || new Date() })}
                    selectsEnd
                    startDate={timeframe1.start}
                    endDate={timeframe1.end}
                />
            </div>
            <div>
                <label>Timeframe 2</label>
                <DatePicker
                    selected={timeframe2.start}
                    onChange={(date) => setTimeframe2({ ...timeframe2, start: date || new Date() })}
                    selectsStart
                    startDate={timeframe2.start}
                    endDate={timeframe2.end}
                />
                <DatePicker
                    selected={timeframe2.end}
                    onChange={(date) => setTimeframe2({ ...timeframe2, end: date || new Date() })}
                    selectsEnd
                    startDate={timeframe2.start}
                    endDate={timeframe2.end}
                />
            </div>
            <button onClick={handleCompare}>Compare</button>
        </div>
    );
};

export default TimeframeComparison;