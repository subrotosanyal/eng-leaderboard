import api from './api';
import {JIRA_API_PATHS} from './utils/jiraApiUrl';
import {closedTicketForAnEngineerATimeRangeJQL, closedTicketInATimeRangeJQL, queries} from './jiraQueries';
import {format, isAfter, subMonths} from 'date-fns';
import {Assignee, ComparisonResult, Engineer, Issue, JiraField, Role, Sprint, TimeframeOption} from '../types';
import {mockSprints, mockTimeframeStats} from '../mocks/data';
import {getStoryPointsPerDeveloper} from './utils/jiraUtils';
import {ITicketingService} from './interfaces/ITicketingService';
import {ITicketingConfig} from './interfaces/ITicketingConfig';
import {MetricsComparator} from './MetricsComparator';
import { store } from '../store/store';
import { setIsMockData } from '../store/mockDataSlice';

interface RawJiraField {
    id: string;
    key: string;
    name: string;
    untranslatedName: string;
    custom: boolean;
    orderable: boolean;
    navigable: boolean;
    searchable: boolean;
    clauseNames: string[];
    schema: {
        type: string;
        items?: string;
        custom?: string;
        customId?: number;
    };
}
export class JiraService implements ITicketingService {
    private readonly isConfigured: boolean;
    private readonly setIsMockData: (isMock: boolean) => void;

    constructor(private config: ITicketingConfig) {
        this.isConfigured = Boolean(
            this.config.project &&
            this.config.board &&
            this.config.storyPointField &&
            this.config.baseUrl &&
            this.config.email &&
            this.config.apiToken
        );
        
        this.setIsMockData = (isMock: boolean) => {
            store.dispatch(setIsMockData(isMock));
        };
        if (!this.isConfigured) {
            console.warn('JIRA configuration is incomplete. Using mock data instead.');
            this.setIsMockData(true);
        }
    }

    isServiceConfigured(): boolean {
        return this.isConfigured;
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
                const response = await api.get(JIRA_API_PATHS.SPRINTS(this.config.board, startAt, maxResults));
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
                    jql = queries.sprintIssues(timeframe.value, this.config);
                    break;
                case 'custom-range':
                    jql = queries.customDateRange(timeframe.value, this.config);
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

    async fetchIssues(jql: string): Promise<Issue[]> {
        const fields = ['assignee', 'status', 'updated', 'issuetype', 'resolutiondate'];
        if (this.config.storyPointField) fields.push(this.config.storyPointField.key);
        if (this.config.developerField) fields.push(this.config.developerField.key);
        if (this.config.testedByField) fields.push(this.config.testedByField.key);

        const issues: Issue[] = [];
        let startAt = 0;
        const maxResults = 100;

        while (true) {
            const response = await api.post(JIRA_API_PATHS.SEARCH, {
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

    processIssues(issues: Issue[], role: Role): Engineer[] {
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
            const field = role === Role.Developer ? this.config.developerField : this.config.testedByField;
            const developers: Assignee[] = issue.fields[field.key] as Assignee[] || [];
            const assignee: Assignee | null = issue.fields.assignee;

            const assignedDevelopers = developers.length > 0 ? developers : (assignee ? [assignee] : []);

            if (assignedDevelopers.length === 0) return;

            const storyPointsPerDeveloper = getStoryPointsPerDeveloper(issue, this.config, role);

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

    async getClosedTicketsForEngineer(engineerAccountId: string, role: Role): Promise<Issue[]> {
        const endDate = new Date();
        const startDate = subMonths(endDate, 12);

        const fieldName = role === Role.Developer
            ? this.config.developerField?.clauseName
            : this.config.testedByField?.clauseName;

        if (!fieldName) {
            console.warn(`Field name for role ${role} is not configured.`);
        }

        const jql = closedTicketForAnEngineerATimeRangeJQL(
            format(startDate, 'yyyy-MM-dd'),
            format(endDate, 'yyyy-MM-dd'),
            this.config.project,
            engineerAccountId,
            fieldName
        );

        return await this.fetchIssues(jql);
    }

    async getUserDetails(userId: string) {
        if (!this.isConfigured) {
            // Return mock data or throw an error if not configured
            return null;
        }

        try {
            const response = await api.get(JIRA_API_PATHS.ACCOUNT_DETAILS_GET(userId));
            return response.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    }

    async getComparisonMetrics(
        startDate1: Date,
        endDate1: Date | null,
        startDate2: Date,
        endDate2: Date | null,
        role: Role = Role.Developer
    ): Promise<ComparisonResult> {
        const timeframe1Data = await this.getTimeframeDataByDates(startDate1, endDate1, role);
        const timeframe2Data = await this.getTimeframeDataByDates(startDate2, endDate2, role);

        return MetricsComparator.compareMetricsData(timeframe1Data, timeframe2Data);
    }

    private async getTimeframeDataByDates(startDate: Date, endDate: Date | null, role: Role): Promise<Engineer[]> {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

        const fieldName = role === Role.Developer
            ? this.config.developerField?.clauseName
            : this.config.testedByField?.clauseName;

        if (!fieldName) {
            console.warn(`Field name for role ${role} is not configured.`);
            return [];
        }

        const jql = closedTicketInATimeRangeJQL(
            formattedStartDate,
            formattedEndDate,
            this.config.project,
        );

        const issues = await this.fetchIssues(jql);
        return this.processIssues(issues, role);
    }

    async getJiraFields(): Promise<JiraField[]> {
        try {
            const response = await api.get<RawJiraField[]>(JIRA_API_PATHS.FIELDS_GET);
            const fields = response.data;
            return fields.map(field => ({
                key: field.key,
                name: field.name,
                clauseName: field.clauseNames.length > 0 ? field.clauseNames[0] : ''
            }));
        } catch (error) {
            console.error('Error fetching JIRA fields:', error);
            throw error;
        }
    };
}