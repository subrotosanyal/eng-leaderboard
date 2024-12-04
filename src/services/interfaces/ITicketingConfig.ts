import { JiraField } from '../../types';

export interface ITicketingConfig {
    project: string;
    board: string;
    developerField: JiraField;
    storyPointField: JiraField;
    testedByField: JiraField;
    baseUrl?: string;
    email?: string;
    apiToken?: string;
}
