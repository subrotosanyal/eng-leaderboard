export interface Sprint {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
}

export interface Engineer {
    id: string;
    name: string;
    avatar: string;
    storyPoints: number;
    ticketsClosed: number;
    trend: number;
    rank: number;
    issues: Issue[];
    issueTypeCount: Map<string, number>;
}

export interface TimeframeStats {
    sprint: Engineer[];
    'custom-range': Engineer[];
}

export interface ChartData {
    name: string;
    storyPoints: number;
    ticketsClosed: number;
}

export interface TimeframeOption {
    id: string;
    label: string;
    value: string;
    type: 'sprint' | 'custom-range';
}

export interface Assignee {
    accountId: string;
    displayName: string;
    avatarUrls: { '48x48': string };
}

export interface IssueType {
    name: string;
    iconUrl: string;
}

export interface Issue {
    id: string;
    key: string;
    fields: {
        assignee: Assignee | null;
        issuetype: IssueType;
        [key: string]: unknown;
    };
}

export interface JiraConfig {
    project: string;
    board: string;
    developerField: JiraField;
    storyPointField: JiraField;
    testedByField: JiraField;
    baseUrl?: string;
    email?: string;
    apiToken?: string;
}

export enum Role {
    Developer = 'Developer',
    QA = 'QA'
}

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export interface ComparisonResult {
    timeframe1: Metrics;
    timeframe2: Metrics;
    difference: Metrics;
}

export interface IndividualContribution {
    name: string;
    avatar: string;
    storyPoints: number;
    ticketsClosed: number;
    issueTypeDistribution: Record<string, number>;
    averageResolutionTime: number;
}

export interface Metrics {
    storyPoints: number;
    ticketsClosed: number;
    issueTypeDistribution: Record<string, number>;
    averageResolutionTime: number;
    overallTeamVelocity: number;
    individualContributions: IndividualContribution[];
}

export interface JiraField {
    key: string;
    name: string;
    clauseName: string;
}

export interface UserDetails {
    accountId: string;
    accountType: string;
    active: boolean;
    avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
    };
    displayName: string;
    emailAddress: string;
    key: string;
    name: string;
    self: string;
    timeZone: string;
    locale: string
}
