import { config } from '../config/env';
import { addDays, addMonths, format } from 'date-fns';


export const queries = {
  sprintIssues: (sprintId: string) => `
    project = ${config.jira.projectKey}
    AND sprint = ${sprintId}
    AND status changed to Done
    ORDER BY updated DESC
  `,

  weeklyIssues: (startDate: string) => {
    const start = new Date(startDate);
    const end = addDays(start, 7);
    return `
      project = ${config.jira.projectKey}
      AND status changed to Done
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  },

  monthlyIssues: (startDate: string) => {
    const start = new Date(startDate);
    const end = addMonths(start, 1);
    return `
      project = ${config.jira.projectKey}
      AND status changed to Done
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  }
};