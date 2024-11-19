import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import TimeframeComparison from './TimeframeComparison';
import { DateRange, ComparisonResult, JiraConfig, Role } from '../types';
import { JiraService } from '../services/jiraService';
import { MetricsComparator } from '../services/MetricsComparator';
import MetricComparisonResult from './MetricComparisonResult.tsx';

interface MetricComparisonPageProps {
    jiraConfig: JiraConfig;
    role: Role;
    setIsMockData: (isMock: boolean) => void;
}

const MetricComparisonPage: React.FC<MetricComparisonPageProps> = ({ jiraConfig, role, setIsMockData }) => {
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const navigate = useNavigate();

    const handleCompare = async (timeframe1: DateRange, timeframe2: DateRange) => {
        const metricComparator = new MetricsComparator(new JiraService(jiraConfig, setIsMockData), jiraConfig);
        const result = await metricComparator.compareMetrics(timeframe1, timeframe2, role);
        setComparisonResult(result);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Metric Comparison</h1>
                <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-700">
                    <FaHome size={24} />
                </button>
            </div>
            <TimeframeComparison onCompare={handleCompare} />
            {comparisonResult && <MetricComparisonResult comparisonResult={comparisonResult} />}
        </div>
    );
};

export default MetricComparisonPage;