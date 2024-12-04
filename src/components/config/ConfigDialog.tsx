import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { StylesConfig, GroupBase } from 'react-select';
import { JiraConfig, JiraField } from '../../types';
import { config } from '../../config/env';
import { TicketingServiceFactory, TicketingSystem } from '../../services/factory/TicketingServiceFactory';
import { useTheme } from '../../context/ThemeContext';
import './ConfigDialog.css';

interface ConfigDialogProps {
    open: boolean;
    onClose: () => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ open, onClose }) => {
    useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [jiraEmail, setJiraEmail] = useState(localStorage.getItem('jiraEmail') || config.jira.email);
    const [jiraBaseUrl, setJiraBaseUrl] = useState(localStorage.getItem('jiraBaseUrl') || config.jira.baseUrl);
    const [jiraApiToken, setJiraApiToken] = useState(localStorage.getItem('jiraApiToken') || config.jira.apiToken);
    const defaultJiraField = {key: '', name: '', clauseName: ''};
    const [jiraConfig, setJiraConfig] = useState<JiraConfig>({
        project: localStorage.getItem('jiraProject') || '',
        board: localStorage.getItem('jiraBoard') || '',
        developerField: JSON.parse(localStorage.getItem('jiraDeveloperField') || JSON.stringify(defaultJiraField)),
        storyPointField: JSON.parse(localStorage.getItem('jiraStoryPointField') || JSON.stringify(defaultJiraField)),
        testedByField: JSON.parse(localStorage.getItem('jiraTestedByField') || JSON.stringify(defaultJiraField)),
    });
    const [fields, setFields] = useState<JiraField[]>([]);

    useEffect(() => {
        if (activeTab === 1) {
            const fetchFields = async () => {
                try {
                    const service = TicketingServiceFactory.createService(
                        TicketingSystem.JIRA,
                        {
                            baseUrl: jiraBaseUrl || config.jira.baseUrl,
                            email: jiraEmail || config.jira.email,
                            apiToken: jiraApiToken || config.jira.apiToken,
                            project: jiraConfig.project,
                            board: jiraConfig.board,
                            developerField: jiraConfig.developerField,
                            storyPointField: jiraConfig.storyPointField,
                            testedByField: jiraConfig.testedByField,
                        },
                    );
                    const fetchedFields = await service.getJiraFields();
                    setFields(fetchedFields.sort((a, b) => a.name.localeCompare(b.name)));
                } catch (error) {
                    console.error('Failed to fetch Jira fields:', error);
                }
            };

            fetchFields().catch((err) => console.error('Error in fetching fields:', err));
        }
    }, [activeTab, jiraBaseUrl, jiraEmail, jiraApiToken, jiraConfig]);

    const handleTabChange = (newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSaveFirstTab = async () => {
        localStorage.setItem('jiraEmail', jiraEmail);
        localStorage.setItem('jiraBaseUrl', jiraBaseUrl);
        localStorage.setItem('jiraApiToken', jiraApiToken);

        try {
            await axios.post('/update-config', { jiraBaseUrl });
        } catch (error) {
            console.error('Failed to update configuration:', error);
        }

        onClose(); // Close the dialog
        window.location.reload(); // Reload the page
    };

    const handleSaveSecondTab = () => {
        localStorage.setItem('jiraProject', jiraConfig.project);
        localStorage.setItem('jiraBoard', jiraConfig.board);
        localStorage.setItem('jiraDeveloperField', JSON.stringify(jiraConfig.developerField));
        localStorage.setItem('jiraStoryPointField', JSON.stringify(jiraConfig.storyPointField));
        localStorage.setItem('jiraTestedByField', JSON.stringify(jiraConfig.testedByField));
        
        onClose();
        window.location.reload();
    };

    const selectStyles: StylesConfig<JiraField, false, GroupBase<JiraField>> = {
        control: (styles) => ({
            ...styles,
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
        }),
        singleValue: (styles) => ({
            ...styles,
            color: 'var(--text-color)',
        }),
        menu: (styles) => ({
            ...styles,
            backgroundColor: 'var(--bg-color)',
        }),
        option: (styles, { isFocused }) => ({
            ...styles,
            backgroundColor: isFocused ? 'var(--border-color)' : undefined,
            color: 'var(--text-color)',
        }),
    };

    if (!open) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <div className="dialog-title">
                    <h2>Configuration</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="dialog-content">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 0 ? 'active' : ''}`}
                            onClick={() => handleTabChange(0)}
                        >
                            Jira Configuration
                        </button>
                        <button
                            className={`tab ${activeTab === 1 ? 'active' : ''}`}
                            onClick={() => handleTabChange(1)}
                            disabled={!jiraEmail || !jiraBaseUrl || !jiraApiToken}
                        >
                            Project Configuration
                        </button>
                    </div>
                    {activeTab === 0 && (
                        <div className="tab-content">
                            <input
                                type="email"
                                placeholder="Jira Email"
                                value={jiraEmail}
                                onChange={(e) => setJiraEmail(e.target.value)}
                                className="input"
                            />
                            <input
                                type="url"
                                placeholder="Jira Base URL"
                                value={jiraBaseUrl}
                                onChange={(e) => setJiraBaseUrl(e.target.value)}
                                className="input"
                            />
                            <input
                                type="password"
                                placeholder="Jira API Token"
                                value={jiraApiToken}
                                onChange={(e) => setJiraApiToken(e.target.value)}
                                className="input"
                            />
                            <button onClick={handleSaveFirstTab} className="button">
                                Save
                            </button>
                        </div>
                    )}
                    {activeTab === 1 && (
                        <div className="tab-content">
                            <input
                                type="text"
                                placeholder="Jira Project"
                                value={jiraConfig.project}
                                onChange={(e) => setJiraConfig({ ...jiraConfig, project: e.target.value })}
                                className="input"
                            />
                            <input
                                type="text"
                                placeholder="Jira Board"
                                value={jiraConfig.board}
                                onChange={(e) => setJiraConfig({ ...jiraConfig, board: e.target.value })}
                                className="input"
                            />
                            <div className="form-control">
                                <label>Developed By</label>
                                <Select<JiraField>
                                    options={fields}
                                    getOptionLabel={(field) => `${field.name} (${field.key})`}
                                    getOptionValue={(field) => field.key}
                                    value={fields.find(field => field.key === jiraConfig.developerField.key)}
                                    onChange={(selectedOption) => {
                                        if (selectedOption) {
                                            setJiraConfig(prevConfig => ({
                                                ...prevConfig,
                                                developerField: selectedOption
                                            }));
                                        }
                                    }}
                                    isSearchable
                                    styles={selectStyles}
                                />
                            </div>
                            <div className="form-control">
                                <label>Story Point Field</label>
                                <Select<JiraField>
                                    options={fields}
                                    getOptionLabel={(field) => `${field.name} (${field.key})`}
                                    getOptionValue={(field) => field.key}
                                    value={fields.find(field => field.key === jiraConfig.storyPointField.key)}
                                    onChange={(selectedOption) => {
                                        if (selectedOption) {
                                            setJiraConfig(prevConfig => ({
                                                ...prevConfig,
                                                storyPointField: selectedOption
                                            }));
                                        }
                                    }}
                                    isSearchable
                                    styles={selectStyles}
                                />
                            </div>
                            <div className="form-control">
                                <label>Tested By</label>
                                <Select<JiraField>
                                    options={fields}
                                    getOptionLabel={(field) => `${field.name} (${field.key})`}
                                    getOptionValue={(field) => field.key}
                                    value={fields.find(field => field.key === jiraConfig.testedByField.key)}
                                    onChange={(selectedOption) => {
                                        if (selectedOption) {
                                            setJiraConfig(prevConfig => ({
                                                ...prevConfig,
                                                testedByField: selectedOption
                                            }));
                                        }
                                    }}
                                    isSearchable
                                    styles={selectStyles}
                                />
                            </div>
                            <button onClick={handleSaveSecondTab} className="button">
                                Save
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigDialog;