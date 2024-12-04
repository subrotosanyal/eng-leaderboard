import React, {useEffect, useState} from 'react';
import {Layout} from 'lucide-react';
import LeaderCard from './LeaderCard';
import PerformanceChart from './PerformanceChart';
import TimeframeSelector from './TimeframeSelector';
import TeamStats from './TeamStats';
import MockDataStrip from '../layout/MockDataStrip';
import SearchBar from '../commom_components/SearchBar';
import RoleSlider from './RoleSlider';
import {commonStyle} from '../styles/commonStyles';
import {TicketingServiceFactory, TicketingSystem} from '../../services/factory/TicketingServiceFactory';
import {config} from '../../config/env';
import type {Engineer, JiraConfig, Role, Sprint, TimeframeOption} from '../../types';
import ApplicationLayout from '../layout/ApplicationLayout';

interface MainPageProps {
    jiraConfig: JiraConfig;
    handleConfigSave: (newConfig: JiraConfig) => void;
    role: Role;
    setRole: (role: Role) => void;
    isMockData: boolean;
    setIsMockData: (isMockData: boolean) => void;
}

const MainPage: React.FC<MainPageProps> = ({
                                               jiraConfig,
                                               role,
                                               setRole,
                                               isMockData,
                                               setIsMockData,
                                           }) => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption | null>(null);
    const [developers, setDevelopers] = useState<Engineer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNames, setSelectedNames] = useState<{ name: string; avatar: string }[]>([]);

    useEffect(() => {
        const fetchSprints = async () => {
            try {
                setLoading(true);
                const ticketingService = TicketingServiceFactory.createService(
                    TicketingSystem.JIRA,
                    {...jiraConfig, ...config.jira}
                );
                const sprintData = await ticketingService.getSprints();
                setSprints(sprintData);
                if (sprintData.length > 0 && !selectedTimeframe) {
                    const latestSprint = sprintData[0];
                    setSelectedTimeframe({
                        id: latestSprint.id,
                        label: latestSprint.name,
                        value: latestSprint.id,
                        type: 'sprint'
                    });
                }
            } catch (err) {
                setError('Failed to fetch sprints');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSprints();
    }, [jiraConfig, setIsMockData, selectedTimeframe]);

    useEffect(() => {
        const fetchTimeframeData = async () => {
            if (!selectedTimeframe) return;

            setLoading(true);
            try {
                const ticketingService = TicketingServiceFactory.createService(
                    TicketingSystem.JIRA,
                    {...jiraConfig, ...config.jira}
                );
                const fetchedDevelopers = await ticketingService.getTimeframeData(selectedTimeframe, role);
                setDevelopers(fetchedDevelopers);
                setSelectedNames(fetchedDevelopers.map((dev) => ({name: dev.name, avatar: dev.avatar})));
            } catch (err) {
                setError('Failed to fetch leaderboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeframeData();
    }, [selectedTimeframe, jiraConfig, role, setIsMockData]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <ApplicationLayout setIsMockData={setIsMockData}>
            <div className="min-h-screen bg-gray-100" style={commonStyle}>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <Layout className="w-8 h-8 text-indigo-600"/>
                            <h1 className="text-2xl font-bold">Engineering Leaderboard</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <TimeframeSelector
                                selected={selectedTimeframe || {
                                    id: 'loading',
                                    label: 'Loading...',
                                    value: 'loading',
                                    type: 'sprint'
                                }}
                                sprints={sprints}
                                onChange={setSelectedTimeframe}
                                isLoading={loading}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <SearchBar
                            engineers={developers.map((dev) => ({name: dev.name, avatar: dev.avatar}))}
                            selectedNames={selectedNames}
                            setSelectedNames={setSelectedNames}
                        />
                    </div>

                    <RoleSlider role={role} setRole={setRole}/>
                    <MockDataStrip isMockData={isMockData}/>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div
                                className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {developers
                                    .filter((dev) => selectedNames.some((selected) => selected.name === dev.name))
                                    .map((developer, index) => (
                                        <LeaderCard
                                            key={developer.id}
                                            developer={developer}
                                            rank={index + 1}
                                            tickets={developer.issues}
                                        />
                                    ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <PerformanceChart developers={developers}/>
                                <TeamStats developers={developers}/>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ApplicationLayout>
    );
};

export default MainPage;