import { config } from '../config/env';
import { addDays, addMonths, format } from 'date-fns';


export const queries = {
  sprintIssues: (sprintId: string) => `
    project in ( ${config.jira.projectKey})
    AND sprint = ${sprintId}
    AND statusCategory IN (Done)
    ORDER BY updated DESC
  `,

  weeklyIssues: (startDate: string) => {
    const start = new Date(startDate);
    const end = addDays(start, 7);
    return `
      project in (${config.jira.projectKey})
      AND statusCategory IN (Done)
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  },

  monthlyIssues: (startDate: string) => {
    const start = new Date(startDate);
    const end = addMonths(start, 1);
    return `
      project in (${config.jira.projectKey})
      AND statusCategory IN (Done)
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  }
};