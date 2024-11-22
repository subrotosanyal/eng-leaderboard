import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from './context/ThemeContext';
import {config} from './config/env';
import MainPage from './components/main_page/MainPage';
import MetricComparisonPage from './components/comparsion_page/MetricComparisonPage.tsx';
import EngineerDetailsPage from "./components/engineer_page/EngineerDetailsPage.tsx";
import {JiraConfig, Role} from './types';

const App: React.FC = () => {
    const loadConfig = (): JiraConfig => ({
        project: localStorage.getItem('jiraProject') || '',
        board: localStorage.getItem('jiraBoard') || '',
        developerField: JSON.parse(localStorage.getItem('jiraDeveloperField') || ''),
        storyPointField: JSON.parse(localStorage.getItem('jiraStoryPointField') || ''),
        testedByField: JSON.parse(localStorage.getItem('jiraTestedByField') || ''),
    });

    const [jiraConfig, setJiraConfig] = useState<JiraConfig>(loadConfig);
    const [role, setRole] = useState<Role>(Role.Developer);
    const [isMockData, setIsMockData] = useState(false);

    useEffect(() => {
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
    }, [jiraConfig]);

    const handleConfigSave = (newConfig: JiraConfig) => {
        setJiraConfig(newConfig);
    };

    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/engineer/:engineerId"
                           element={<EngineerDetailsPage jiraConfig={jiraConfig} role={role}/>}/>
                    <Route
                        path="/"
                        element={
                            <MainPage
                                jiraConfig={jiraConfig}
                                handleConfigSave={handleConfigSave}
                                role={role}
                                setRole={setRole}
                                isMockData={isMockData}
                                setIsMockData={setIsMockData}
                            />
                        }
                    />
                    <Route path="/comparison" element={
                        <MetricComparisonPage jiraConfig={jiraConfig} role={role} setIsMockData={setIsMockData}/>
                    }
                    />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;