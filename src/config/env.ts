export const config = {
  jira: {
    baseUrl: import.meta.env.VITE_JIRA_BASE_URL || '',
    apiToken: import.meta.env.VITE_JIRA_API_TOKEN || '',
    email: import.meta.env.VITE_JIRA_EMAIL || '',
    projectKey: import.meta.env.VITE_JIRA_PROJECT_KEY || '',
    storyPointField: import.meta.env.VITE_JIRA_STORY_POINT_FIELD || 'customfield_10050'
  }
};