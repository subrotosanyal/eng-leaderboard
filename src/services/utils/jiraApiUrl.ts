export const JIRA_API_PATHS = {
    SPRINTS: (boardId: string, startAt: number, maxResults: number) =>
        `/api/jira/rest/agile/1.0/board/${boardId}/sprint?state=active,closed&startAt=${startAt}&maxResults=${maxResults}`,
    SEARCH: '/api/jira/rest/api/3/search',
    FIELDS_GET : '/api/jira/rest/api/3/field',
    ACCOUNT_DETAILS_GET : (userId: string) => `/api/jira/rest/api/3/user?accountId=${userId}`
};