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
    week: Engineer[];
    month: Engineer[];
    quarter: Engineer[];
    'half-year': Engineer[];
    year: Engineer[];
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
    type: 'sprint' | 'week' | 'month' | 'quarter' | 'half-year' | 'year';
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
    developerField: string;
    storyPointField: string;
    testedByField: string;
}

export enum Role {
    Developer = 'Developer',
    QA = 'QA'
}