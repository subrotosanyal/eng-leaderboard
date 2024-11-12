import { config } from '../config/env';

export const queries = {
  sprintIssues: (sprintId: string) => `
    project = ${config.jira.projectKey} 
    AND sprint = ${sprintId} 
    AND status changed to Done 
    ORDER BY updated DESC
  `,
  
  weeklyIssues: (startDate: string) => `
    project = ${config.jira.projectKey} 
    AND status changed to Done 
    AND updated >= "${startDate}"
    AND updated < "${startDate}" + 7d
    ORDER BY updated DESC
  `,
  
  monthlyIssues: (yearMonth: string) => `
    project = ${config.jira.projectKey} 
    AND status changed to Done 
    AND updated >= "${yearMonth}-01"
    AND updated < "${yearMonth}-01" + 1M
    ORDER BY updated DESC
  `
};