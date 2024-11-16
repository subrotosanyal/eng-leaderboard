import { useEffect, useState } from 'react';
import { Layout, Menu } from 'lucide-react';
import LeaderCard from './components/LeaderCard';
import PerformanceChart from './components/PerformanceChart';
import TimeframeSelector from './components/TimeframeSelector';
import ConfigDialog from './components/ConfigDialog';
import { JiraService } from './services/jiraService';
import { Role } from './types';
import type { ChartData, Engineer, JiraConfig, Sprint, TimeframeOption } from './types';
import { config } from './config/env';
import TeamStats from './components/TeamStats';
import MockDataStrip from './components/MockDataStrip';
import SearchBar from './components/SearchBar';
import RoleSlider from './components/RoleSlider';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import {commonStyle} from "./components/styles/commonStyles.ts";

function App() {
    const loadConfig = (): JiraConfig => {
        return {
            project: localStorage.getItem('jiraProject') || '',
            board: localStorage.getItem('jiraBoard') || '',
            developerField: localStorage.getItem('jiraDeveloperField') || '',
            storyPointField: localStorage.getItem('jiraStoryPointField') || '',
            testedByField: localStorage.getItem('jiraTestedByField') || '',
        };
    };

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>({
        id: 'loading',
        label: 'Loading...',
        value: '',
        type: 'sprint'
    });
    const [developers, setDevelopers] = useState<Engineer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);
    const [selectedNames, setSelectedNames] = useState<{ name: string; avatar: string }[]>([]);
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [jiraConfig, setJiraConfig] = useState<JiraConfig>(loadConfig);
    const [role, setRole] = useState<Role>(Role.Developer);

    useEffect(() => {
        const initializeData = async () => {
            try {
                const jiraService = new JiraService(jiraConfig, setIsMockData);
                const fetchedSprints = await jiraService.getSprints();
                setSprints(fetchedSprints);

                const currentSprint = fetchedSprints[0];
                const initialTimeframe: TimeframeOption = {
                    id: currentSprint.id,
                    label: currentSprint.name,
                    value: currentSprint.id,
                    type: 'sprint'
                };
                setSelectedTimeframe(initialTimeframe);
            } catch (err) {
                setError('Failed to fetch sprints. Please check your JIRA configuration.');
                console.error('Error fetching sprints:', err);
            }
        };

        setIsMockData(!(
            config.jira.baseUrl &&
            config.jira.apiToken &&
            config.jira.email &&
            jiraConfig.project &&
            jiraConfig.board &&
            jiraConfig.developerField &&
            jiraConfig.storyPointField
        ));

        initializeData().catch(err => console.error('Error in initializeData:', err));
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
                setSelectedNames(data.map(dev => ({ name: dev.name, avatar: dev.avatar })));
            } catch (err) {
                setError('Failed to fetch leaderboard data. Please check your JIRA configuration.');
                console.error('Error fetching JIRA data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeframeData().catch(err => console.error('Error in fetchTimeframeData:', err));
    }, [selectedTimeframe, jiraConfig, role]);

    const getChartData = (): ChartData[] => {
        return developers.map(dev => ({
            name: dev.name,
            storyPoints: dev.storyPoints,
            ticketsClosed: dev.ticketsClosed
        }));
    };

    const filteredDevelopers = developers.filter(dev =>
        selectedNames.some(selected => selected.name === dev.name)
    );

    const handleConfigSave = (newConfig: typeof jiraConfig) => {
        setJiraConfig(newConfig);
    };

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
        <ThemeProvider>
            <div className="min-h-screen bg-gray-100" style={commonStyle}>
                <div className="min-h-screen bg-gray-100" style={commonStyle}>
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <Layout className="w-8 h-8 text-indigo-600"/>
                                <h1 className="text-2xl font-bold">Engineering Leaderboard</h1>
                            </div>
                            <ThemeSwitcher/>
                            <div className="flex items-center space-x-3">
                                <TimeframeSelector
                                    selected={selectedTimeframe}
                                    sprints={sprints}
                                    onChange={setSelectedTimeframe}
                                    isLoading={loading}
                                />
                                <Menu className="w-8 h-8 text-indigo-600 cursor-pointer"
                                      onClick={() => setIsConfigDialogOpen(true)}/>
                            </div>
                        </div>

                        <div className="mb-4">
                            <SearchBar
                                engineers={developers.map(dev => ({name: dev.name, avatar: dev.avatar}))}
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                                    <PerformanceChart
                                        data={getChartData()}
                                        title="Story Points vs Tickets Closed"
                                    />
                                    <TeamStats developers={developers}/>
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
            </div>
        </ThemeProvider>
    );
}

export default App;