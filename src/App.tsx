import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { JiraService } from './services/jiraService';
import { ComparisonResult, DateRange, Role } from './types';
import { config } from './config/env';
import TimeframeComparison from './components/TimeframeComparison';
import ComparisonView from './components/ComparisionView';
import MainPage from './components/MainPage';
import type { Engineer, JiraConfig, Sprint, TimeframeOption } from './types';
import {MetricsComparator} from "./services/MetricsComparator.ts";

const App: React.FC = () => {
    const loadConfig = (): JiraConfig => ({
        project: localStorage.getItem('jiraProject') || '',
        board: localStorage.getItem('jiraBoard') || '',
        developerField: localStorage.getItem('jiraDeveloperField') || '',
        storyPointField: localStorage.getItem('jiraStoryPointField') || '',
        testedByField: localStorage.getItem('jiraTestedByField') || '',
    });

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>({
        id: 'loading',
        label: 'Loading...',
        value: '',
        type: 'sprint',
    });
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
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

        setIsMockData(
            !(
                config.jira.baseUrl &&
                config.jira.apiToken &&
                config.jira.email &&
                jiraConfig.project &&
                jiraConfig.board &&
                jiraConfig.developerField &&
                jiraConfig.storyPointField
            )
        );

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

    const handleConfigSave = (newConfig: JiraConfig) => {
        setJiraConfig(newConfig);
    };

    const handleCompare = async (timeframe1: DateRange, timeframe2: DateRange) => {
        const metricComparator = new MetricsComparator(new JiraService(jiraConfig, setIsMockData), jiraConfig)
        const result = await metricComparator.compareMetrics(timeframe1, timeframe2, role);
        setComparisonResult(result);
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
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <MainPage
                                sprints={sprints}
                                selectedTimeframe={selectedTimeframe}
                                setSelectedTimeframe={setSelectedTimeframe}
                                developers={developers}
                                loading={loading}
                                isMockData={isMockData}
                                selectedNames={selectedNames}
                                setSelectedNames={setSelectedNames}
                                isConfigDialogOpen={isConfigDialogOpen}
                                setIsConfigDialogOpen={setIsConfigDialogOpen}
                                jiraConfig={jiraConfig}
                                handleConfigSave={handleConfigSave}
                                role={role}
                                setRole={setRole}
                            />
                        }
                    />
                    <Route
                        path="/comparison"
                        element={
                            <div>
                                <TimeframeComparison onCompare={handleCompare} />
                                {comparisonResult && <ComparisonView result={comparisonResult} />}
                            </div>
                        }
                    />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;