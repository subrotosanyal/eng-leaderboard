import { useState } from 'react';
import DateRangeSelector from '../commom_components/DateRangeSelector';
import { TimeframeOption } from '../../types';
import { LuGitCompare } from 'react-icons/lu';
import { FaSpinner } from 'react-icons/fa';
import Card from '../commom_components/Card';

const TimeframeComparison = ({ onCompare, isLoading }: { 
    onCompare: (timeframe1: TimeframeOption, timeframe2: TimeframeOption) => void,
    isLoading: boolean 
}) => {
    const [timeframe1, setTimeframe1] = useState<TimeframeOption>({ id: '', label: '', value: '', type: 'custom-range' });
    const [timeframe2, setTimeframe2] = useState<TimeframeOption>({ id: '', label: '', value: '', type: 'custom-range' });

    const handleCompare = async () => {
        await onCompare(timeframe1, timeframe2);
    };

    const isCompareDisabled = !timeframe1.value || !timeframe2.value || isLoading;

    const getDateFromValue = (value: string, index: number): Date | null => {
        if (!value) return null;
        const dates = value.split('|');
        const dateStr = dates[index];
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    };

    const formatDateToString = (date: Date | null, currentValue: string, index: number): string => {
        if (!date) return currentValue;
        const dates = currentValue ? currentValue.split('|') : ['', ''];
        dates[index] = date.toISOString();
        return dates.join('|');
    };

    return (
        <Card title="">
            <div className="flex items-center space-x-8 mb-4">
                <div>
                    <label className="block mb-2 font-bold">Period 1</label>
                    <DateRangeSelector
                        startDate={getDateFromValue(timeframe1.value, 0)}
                        endDate={getDateFromValue(timeframe1.value, 1)}
                        setStartDate={(date) => 
                            setTimeframe1({
                                ...timeframe1,
                                value: formatDateToString(date, timeframe1.value, 0),
                                type: 'custom-range'
                            })
                        }
                        setEndDate={(date) => 
                            setTimeframe1({
                                ...timeframe1,
                                value: formatDateToString(date, timeframe1.value, 1),
                                type: 'custom-range'
                            })
                        }
                    />
                </div>
                <div>
                    <label className="block mb-2 font-bold">Period 2</label>
                    <DateRangeSelector
                        startDate={getDateFromValue(timeframe2.value, 0)}
                        endDate={getDateFromValue(timeframe2.value, 1)}
                        setStartDate={(date) => 
                            setTimeframe2({
                                ...timeframe2,
                                value: formatDateToString(date, timeframe2.value, 0),
                                type: 'custom-range'
                            })
                        }
                        setEndDate={(date) => 
                            setTimeframe2({
                                ...timeframe2,
                                value: formatDateToString(date, timeframe2.value, 1),
                                type: 'custom-range'
                            })
                        }
                    />
                </div>
                <button
                    onClick={handleCompare}
                    disabled={isCompareDisabled}
                    className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md 
                        ${isCompareDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
                        transition-all duration-200`}
                >
                    {isLoading ? (
                        <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                        <LuGitCompare className="h-5 w-5" />
                    )}
                    <span>{isLoading ? 'Comparing...' : 'Compare'}</span>
                </button>
            </div>
        </Card>
    );
};

export default TimeframeComparison;