import React, {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {store} from './store/store';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from './context/ThemeContext';
import MainPage from './components/main_page/MainPage';
import MetricComparisonPage from './components/comparsion_page/MetricComparisonPage.tsx';
import EngineerDetailsPage from "./components/engineer_page/EngineerDetailsPage.tsx";
import {Role} from './types';
import {ITicketingConfig} from './services/interfaces/ITicketingConfig';
import {ConfigurationService} from './services/ConfigurationService';

const App: React.FC = () => {
    const [jiraConfig, setJiraConfig] = useState<ITicketingConfig>(ConfigurationService.loadConfig());
    const [role, setRole] = useState<Role>(Role.Developer);
    const [isMockData, setIsMockData] = useState(false);

    const handleConfigSave = (newConfig: ITicketingConfig) => {
        ConfigurationService.saveConfig(newConfig);
        setJiraConfig(newConfig);
    };

    useEffect(() => {
        setIsMockData(
            !(
                jiraConfig.project &&
                jiraConfig.board &&
                jiraConfig.developerField &&
                jiraConfig.storyPointField
            )
        );
    }, [jiraConfig]);

    return (
        <Provider store={store}>
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
                            <MetricComparisonPage 
                                jiraConfig={jiraConfig} 
                                setIsMockData={setIsMockData}
                                role={role}
                            />
                        }/>
                    </Routes>
                </Router>
            </ThemeProvider>
        </Provider>
    );
};

export default App;