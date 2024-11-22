import React from 'react';
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
import type { Engineer, Sprint, TimeframeOption, JiraConfig, Role } from '../../types';

interface MainPageProps {
    sprints: Sprint[];
    selectedTimeframe: TimeframeOption;
    setSelectedTimeframe: (timeframe: TimeframeOption) => void;
    developers: Engineer[];
    loading: boolean;
    isMockData: boolean;
    selectedNames: { name: string; avatar: string }[];
    setSelectedNames: (names: { name: string; avatar: string }[]) => void;
    isConfigDialogOpen: boolean;
    setIsConfigDialogOpen: (isOpen: boolean) => void;
    jiraConfig: JiraConfig;
    handleConfigSave: (newConfig: JiraConfig) => void;
    role: Role;
    setRole: (role: Role) => void;
}

const MainPage: React.FC<MainPageProps> = ({
    sprints,
    selectedTimeframe,
    setSelectedTimeframe,
    developers,
    loading,
    isMockData,
    selectedNames,
    setSelectedNames,
    isConfigDialogOpen,
    setIsConfigDialogOpen,
    jiraConfig,
    handleConfigSave,
    role,
    setRole,
}) => {
    const filteredDevelopers = developers.filter((dev) =>
        selectedNames.some((selected) => selected.name === dev.name)
    );

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
                            {filteredDevelopers.map((developer, index) => (
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