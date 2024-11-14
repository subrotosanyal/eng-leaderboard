export const config = {
  jira: {
    apiToken: import.meta.env.VITE_JIRA_API_TOKEN || '',
    email: import.meta.env.VITE_JIRA_EMAIL || '',
    baseUrl: import.meta.env.VITE_JIRA_BASE_URL || '',
  }
};