import React, { useState } from 'react';
import TimeframeComparison from './TimeframeComparison';
import { ComparisonResult, Role, TimeframeOption } from '../../types';
import { TicketingServiceFactory, TicketingSystem } from '../../services/factory/TicketingServiceFactory';
import ApplicationLayout from '../layout/ApplicationLayout';
import { MetricsComparator } from '../../services/MetricsComparator';
import MetricComparisonResult from './MetricComparisonResult';
import { ITicketingService } from '../../services/interfaces/ITicketingService';
import { ITicketingConfig } from '../../services/interfaces/ITicketingConfig';
import {ConfigurationService} from "../../services/ConfigurationService.ts";

interface MetricComparisonPageProps {
    jiraConfig: ITicketingConfig;
    setIsMockData: (isMock: boolean) => void;
    role: Role;
}

const MetricComparisonPage: React.FC<MetricComparisonPageProps> = ({ jiraConfig, setIsMockData, role }) => {
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCompare = async (timeframe1: TimeframeOption, timeframe2: TimeframeOption) => {
        setLoading(true);
        try {
            const ticketingService: ITicketingService = TicketingServiceFactory.createService(
                TicketingSystem.JIRA,
                { ...jiraConfig, ...ConfigurationService.loadConfig() }
            );
            
            const [data1, data2] = await Promise.all([
                ticketingService.getTimeframeData(timeframe1, role),
                ticketingService.getTimeframeData(timeframe2, role)
            ]);

            const comparisonResult = MetricsComparator.compareMetricsData(data1, data2);
            setComparisonResult(comparisonResult);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ApplicationLayout setIsMockData={setIsMockData}>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Metric Comparison</h1>
                </div>
                <TimeframeComparison onCompare={handleCompare} isLoading={loading} />
                <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {loading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    )}
                    {comparisonResult && <MetricComparisonResult comparisonResult={comparisonResult} />}
                </div>
            </div>
        </ApplicationLayout>
    );
};

export default MetricComparisonPage;