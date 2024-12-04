export const config = {
    jira: {
        apiToken: localStorage.getItem('jiraApiToken') || import.meta.env.VITE_JIRA_API_TOKEN || '',
        email: localStorage.getItem('jiraEmail') || import.meta.env.VITE_JIRA_EMAIL || '',
        baseUrl: localStorage.getItem('jiraBaseUrl') || import.meta.env.VITE_JIRA_BASE_URL || '',
    }
};