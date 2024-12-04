import { Engineer, Issue, Role, Sprint, TimeframeOption, ComparisonResult, JiraField } from '../../types';

export interface ITicketingService {
    isServiceConfigured(): boolean;
    getSprints(): Promise<Sprint[]>;
    getTimeframeData(timeframe: TimeframeOption, role: Role): Promise<Engineer[]>;
    fetchIssues(jql: string): Promise<Issue[]>;
    processIssues(issues: Issue[], role: Role): Engineer[];
    getClosedTicketsForEngineer(engineerAccountId: string, role: Role): Promise<Issue[]>;
    getUserDetails(userId: string): Promise<any>;
    getComparisonMetrics(
        startDate1: Date,
        endDate1: Date | null,
        startDate2: Date,
        endDate2: Date | null,
        role?: Role
    ): Promise<ComparisonResult>;
    getJiraFields(): Promise<JiraField[]>;
}
