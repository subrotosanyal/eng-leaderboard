import { ITicketingConfig } from './interfaces/ITicketingConfig';
import { JiraField } from '../types';
import { config as envConfig } from '../config/env';

export class ConfigurationService {
    private static defaultJiraField: JiraField = {
        key: '',
        name: '',
        clauseName: ''
    };

    static loadConfig(): ITicketingConfig {
        try {
            return {
                project: localStorage.getItem('jiraProject') || '',
                board: localStorage.getItem('jiraBoard') || '',
                developerField: JSON.parse(localStorage.getItem('jiraDeveloperField') || JSON.stringify(this.defaultJiraField)),
                storyPointField: JSON.parse(localStorage.getItem('jiraStoryPointField') || JSON.stringify(this.defaultJiraField)),
                testedByField: JSON.parse(localStorage.getItem('jiraTestedByField') || JSON.stringify(this.defaultJiraField)),
                baseUrl: envConfig.jira.baseUrl,
                email: envConfig.jira.email,
                apiToken: envConfig.jira.apiToken,
            };
        } catch (error) {
            console.error('Failed to load config:', error);
            return this.getDefaultConfig();
        }
    }

    static saveConfig(config: ITicketingConfig): void {
        try {
            localStorage.setItem('jiraProject', config.project);
            localStorage.setItem('jiraBoard', config.board);
            localStorage.setItem('jiraDeveloperField', JSON.stringify(config.developerField));
            localStorage.setItem('jiraStoryPointField', JSON.stringify(config.storyPointField));
            localStorage.setItem('jiraTestedByField', JSON.stringify(config.testedByField));
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    static getDefaultConfig(): ITicketingConfig {
        return {
            project: '',
            board: '',
            developerField: this.defaultJiraField,
            storyPointField: this.defaultJiraField,
            testedByField: this.defaultJiraField,
            baseUrl: envConfig.jira.baseUrl,
            email: envConfig.jira.email,
            apiToken: envConfig.jira.apiToken,
        };
    }
}
