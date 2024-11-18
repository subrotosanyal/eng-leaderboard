import {format} from 'date-fns';
import type {JiraConfig} from '../types';


export const buildJQL = (start: string, end: string, project: string): string => {
    return `
        project in (${project})
        AND statusCategory IN (Done)
        AND updated >= "${format(new Date(start), 'yyyy-MM-dd')}"
        AND updated < "${format(new Date(end), 'yyyy-MM-dd')}"
        ORDER BY updated DESC
    `;
};
export const queries = {
    sprintIssues: (sprintId: string, jiraConfig: JiraConfig) => `
    project in (${jiraConfig.project})
    AND sprint = ${sprintId}
    AND statusCategory IN (Done)
    ORDER BY updated DESC
  `,

    customDateRange: (dateRange: string, jiraConfig: JiraConfig) => {
        const [startDate, endDate] = dateRange.split('|');
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `
      project in (${jiraConfig.project})
      AND statusCategory IN (Done)
      AND resolutiondate >= "${format(start, 'yyyy-MM-dd')}"
      AND resolutiondate < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
    }
};