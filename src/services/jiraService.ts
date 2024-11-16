import api from './api';
import { queries } from './jiraQueries';
import { isAfter, subMonths } from 'date-fns';
import type { Assignee, Engineer, Issue, JiraConfig, Sprint, TimeframeOption } from '../types';
import { mockSprints, mockTimeframeStats } from '../mocks/data';
import { config } from "../config/env";
import { Role } from '../types';

export class JiraService {
    private readonly isConfigured: boolean;
    private readonly setIsMockData: (isMock: boolean) => void;

    constructor(private jiraConfig: JiraConfig, setIsMockData: (isMock: boolean) => void) {
        this.isConfigured = Boolean(
            jiraConfig.project &&
            jiraConfig.board &&
            jiraConfig.storyPointField &&
            config.jira.baseUrl &&
            config.jira.email &&
            config.jira.apiToken
        );
        this.setIsMockData = setIsMockData;
        if (!this.isConfigured) {
            console.warn('JIRA configuration is incomplete. Using mock data instead.');
            this.setIsMockData(true);
        }
    }

    async getSprints(): Promise<Sprint[]> {
        if (!this.isConfigured) {
            return mockSprints;
        }

        const sprints: Sprint[] = [];
        let startAt = 0;
        const maxResults = 50;
        const twelveMonthsAgo = subMonths(new Date(), 12);

        try {
            while (true) {
                const response = await api.get(`/rest/agile/1.0/board/${this.jiraConfig.board}/sprint?state=active,closed&startAt=${startAt}&maxResults=${maxResults}`);
                const fetchedSprints = response.data.values
                    .filter((sprint: Sprint) => sprint && sprint.startDate)
                    .map((sprint: Sprint) => ({
                        id: sprint.id,
                        name: sprint.name,
                        startDate: sprint.startDate,
                        endDate: sprint.endDate
                    }))
                    .filter((sprint: Sprint) => isAfter(new Date(sprint.startDate), twelveMonthsAgo));

                sprints.push(...fetchedSprints);

                if (response.data.isLast) {
                    break;
                }

                startAt += maxResults;
            }

            sprints.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

            return sprints;
        } catch (error) {
            console.error('Failed to fetch sprints:', error);
            this.setIsMockData(true);
            return mockSprints;
        }
    }

    async getTimeframeData(timeframe: TimeframeOption, role: Role): Promise<Engineer[]> {
        if (!this.isConfigured) {
            return mockTimeframeStats[timeframe.type];
        }

        try {
            let jql = '';

            switch (timeframe.type) {
                case 'sprint':
                    jql = queries.sprintIssues(timeframe.value, this.jiraConfig);
                    break;
                case 'week':
                    jql = queries.weeklyIssues(timeframe.value, this.jiraConfig);
                    break;
                case 'month':
                    jql = queries.monthlyIssues(timeframe.value, this.jiraConfig);
                    break;
                case 'quarter':
                    jql = queries.quarterlyIssues(timeframe.value, this.jiraConfig);
                    break;
                case 'half-year':
                    jql = queries.halfYearlyIssues(timeframe.value, this.jiraConfig);
                    break;
                case 'year':
                    jql = queries.yearlyIssues(timeframe.value, this.jiraConfig);
                    break;
            }

            const issues = await this.fetchIssues(jql);
            return this.processIssues(issues, role);
        } catch (error) {
            console.error('Failed to fetch JIRA data:', error);
            console.warn('Falling back to mock data');
            this.setIsMockData(true);
            return mockTimeframeStats[timeframe.type];
        }
    }

    private async fetchIssues(jql: string): Promise<Issue[]> {
        const fields = ['assignee', 'status', 'updated', 'issuetype'];
        if (this.jiraConfig.storyPointField) fields.push(this.jiraConfig.storyPointField);
        if (this.jiraConfig.developerField) fields.push(this.jiraConfig.developerField);
        if (this.jiraConfig.testedByField) fields.push(this.jiraConfig.testedByField);

        const issues: Issue[] = [];
        let startAt = 0;
        const maxResults = 100;

        while (true) {
            const response = await api.post('/rest/api/3/search', {
                jql,
                fields,
                startAt,
                maxResults
            });

            issues.push(...response.data.issues);

            if (response.data.issues.length < maxResults) {
                break;
            }

            startAt += maxResults;
        }

        return issues;
    }

    private processIssues(issues: Issue[], role: Role): Engineer[] {
        const devMap = new Map<string, {
            id: string;
            name: string;
            avatar: string;
            storyPoints: number;
            ticketsClosed: number;
            previousRank?: number;
            ticketKeys: string[];
            issues: Issue[];
            issueTypeCount: Map<string, number>;
        }>();

        issues.forEach(issue => {
            const field = role === Role.Developer ? this.jiraConfig.developerField : this.jiraConfig.testedByField;
            const developers: Assignee[] = issue.fields[field] as Assignee[] || [];
            const assignee: Assignee | null = issue.fields.assignee;

            const assignedDevelopers = developers.length > 0 ? developers : (assignee ? [assignee] : []);

            if (assignedDevelopers.length === 0) return;

            const storyPoints = Number(issue.fields[this.jiraConfig.storyPointField]) || 0;
            const storyPointsPerDeveloper = storyPoints / assignedDevelopers.length;

            assignedDevelopers.forEach(developer => {
                const devData = devMap.get(developer.accountId) || {
                    id: developer.accountId,
                    name: developer.displayName,
                    avatar: developer.avatarUrls['48x48'],
                    storyPoints: 0,
                    ticketsClosed: 0,
                    ticketKeys: [],
                    issues: [],
                    issueTypeCount: new Map<string, number>()
                };

                devData.storyPoints = Number((devData.storyPoints + storyPointsPerDeveloper).toFixed(1));
                devData.ticketsClosed += 1;
                devData.ticketKeys.push(issue.key);
                devData.issues.push(issue);

                const issueTypeName = issue.fields.issuetype.name;
                const currentCount = devData.issueTypeCount.get(issueTypeName) || 0;
                devData.issueTypeCount.set(issueTypeName, currentCount + 1);

                devMap.set(developer.accountId, devData);
            });
        });

        return Array.from(devMap.values())
            .sort((a, b) => b.storyPoints - a.storyPoints)
            .map((dev, index) => ({
                ...dev,
                rank: index + 1,
                trend: dev.previousRank ? dev.previousRank - (index + 1) : 0
            }));
    }
}