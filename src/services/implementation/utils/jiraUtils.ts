import { Issue, Role } from '../../../types';
import { ITicketingConfig } from '../../interfaces/ITicketingConfig';

export const getStoryPointsPerDeveloper = (issue: Issue, jiraConfig: ITicketingConfig, role: Role): number => {
    const storyPoints = Number(issue.fields[jiraConfig.storyPointField.key]) || 0;
    const field = role === Role.Developer ? jiraConfig.developerField : jiraConfig.testedByField;
    const developers = issue.fields[field.key] as unknown as { accountId: string }[] || [];
    const assignee = issue.fields.assignee;

    const assignedDevelopers = developers.length > 0 ? developers : (assignee ? [assignee] : []);
    if (assignedDevelopers.length === 0) return 0;

    return storyPoints / assignedDevelopers.length;
};