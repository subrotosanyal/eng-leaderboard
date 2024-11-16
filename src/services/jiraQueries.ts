import { addDays, addMonths, addQuarters, addYears, format } from 'date-fns';
import type { JiraConfig } from '../types';

export const queries = {
  sprintIssues: (sprintId: string, jiraConfig: JiraConfig) => `
    project in (${jiraConfig.project})
    AND sprint = ${sprintId}
    AND statusCategory IN (Done)
    ORDER BY updated DESC
  `,

  weeklyIssues: (startDate: string, jiraConfig: JiraConfig) => {
    const start = new Date(startDate);
    const end = addDays(start, 7);
    return `
      project in (${jiraConfig.project})
      AND statusCategory IN (Done)
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  },

  monthlyIssues: (startDate: string, jiraConfig: JiraConfig) => {
    const start = new Date(startDate);
    const end = addMonths(start, 1);
    return `
      project in (${jiraConfig.project})
      AND statusCategory IN (Done)
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  },

  quarterlyIssues: (startDate: string, jiraConfig: JiraConfig) => {
    const start = new Date(startDate);
    const end = addQuarters(start, 1);
    return `
      project in (${jiraConfig.project})
      AND statusCategory IN (Done)
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  },

  halfYearlyIssues: (startDate: string, jiraConfig: JiraConfig) => {
    const start = new Date(startDate);
    const end = addMonths(start, 6);
    return `
      project in (${jiraConfig.project})
      AND statusCategory IN (Done)
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  },

  yearlyIssues: (startDate: string, jiraConfig: JiraConfig) => {
    const start = new Date(startDate);
    const end = addYears(start, 1);
    return `
      project in (${jiraConfig.project})
      AND statusCategory IN (Done)
      AND updated >= "${format(start, 'yyyy-MM-dd')}"
      AND updated < "${format(end, 'yyyy-MM-dd')}"
      ORDER BY updated DESC
    `;
  }
};