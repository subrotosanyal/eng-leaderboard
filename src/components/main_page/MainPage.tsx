import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'lucide-react';
import LeaderCard from './LeaderCard';
import PerformanceChart from './PerformanceChart';
import TimeframeSelector from './TimeframeSelector';
import ConfigDialog from '../ConfigDialog';
import TeamStats from './TeamStats';
import MockDataStrip from './MockDataStrip';
import SearchBar from '../commom_components/SearchBar';
import RoleSlider from './RoleSlider';
import ThemeSwitcher from '../ThemeSwitcher';
import { commonStyle } from '../styles/commonStyles';
import { JiraService } from '../../services/jiraService';
import type { Engineer, Sprint, TimeframeOption, JiraConfig, Role } from '../../types';

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
    handleConfigSave,
    role,
    setRole,
    isMockData,
    setIsMockData,
}) => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>({
        id: 'loading',
        label: 'Loading...',
        value: '',
        type: 'sprint',
    });
    const [developers, setDevelopers] = useState<Engineer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNames, setSelectedNames] = useState<{ name: string; avatar: string }[]>([]);
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const jiraService = new JiraService(jiraConfig, setIsMockData);
                const fetchedSprints = await jiraService.getSprints();
                setSprints(fetchedSprints);

                const currentSprint = fetchedSprints[0];
                setSelectedTimeframe({
                    id: currentSprint.id,
                    label: currentSprint.name,
                    value: currentSprint.id,
                    type: 'sprint',
                });
            } catch (err) {
                setError('Failed to fetch sprints. Please check your JIRA configuration.');
                console.error('Error fetching sprints:', err);
            }
        };

        initializeData().catch((err) => console.error('Error in initializeData:', err));
    }, [jiraConfig]);

    useEffect(() => {
        const fetchTimeframeData = async () => {
            if (selectedTimeframe.id === 'loading') return;

            try {
                setLoading(true);
                setError(null);
                const jiraService = new JiraService(jiraConfig, setIsMockData);
                const data = await jiraService.getTimeframeData(selectedTimeframe, role);
                setDevelopers(data);
                setSelectedNames(data.map((dev) => ({ name: dev.name, avatar: dev.avatar })));
            } catch (err) {
                setError('Failed to fetch leaderboard data. Please check your JIRA configuration.');
                console.error('Error fetching JIRA data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeframeData().catch((err) => console.error('Error in fetchTimeframeData:', err));
    }, [selectedTimeframe, jiraConfig, role]);

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
        <div className="min-h-screen bg-gray-100" style={commonStyle}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <Layout className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-2xl font-bold">Engineering Leaderboard</h1>
                    </div>
                    <ThemeSwitcher />
                    <div className="flex items-center space-x-3">
                        <TimeframeSelector
                            selected={selectedTimeframe}
                            sprints={sprints}
                            onChange={setSelectedTimeframe}
                            isLoading={loading}
                        />
                        <Menu
                            className="w-8 h-8 text-indigo-600 cursor-pointer"
                            onClick={() => setIsConfigDialogOpen(true)}
                        />
                    </div>
                </div>

                <div className="my-4">
                    <Link
                        to="/comparison"
                        className="text-indigo-600 underline text-sm"
                    >
                        Go to Metric Comparison
                    </Link>
                </div>

                <div className="mb-4">
                    <SearchBar
                        engineers={developers.map((dev) => ({ name: dev.name, avatar: dev.avatar }))}
                        selectedNames={selectedNames}
                        setSelectedNames={setSelectedNames}
                    />
                </div>

                <RoleSlider role={role} setRole={setRole} />
                <MockDataStrip isMockData={isMockData} />

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {developers.filter((dev) =>
                                selectedNames.some((selected) => selected.name === dev.name)
                            ).map((developer, index) => (
                                <LeaderCard
                                    key={developer.id}
                                    developer={developer}
                                    rank={index + 1}
                                    tickets={developer.issues}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PerformanceChart developers={developers} />
                            <TeamStats developers={developers} />
                        </div>
                    </>
                )}
            </div>

            <ConfigDialog
                isOpen={isConfigDialogOpen}
                onClose={() => setIsConfigDialogOpen(false)}
                onSave={handleConfigSave}
                initialConfig={jiraConfig}
            />
        </div>
    );
};

export default MainPage;