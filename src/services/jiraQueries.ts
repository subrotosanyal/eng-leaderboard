import {format, parseISO} from 'date-fns';
import type {JiraConfig} from '../types';

export function closedTicketInATimeRangeJQL(start: string, end: string, project: string): string {
    return `
    project in (${project})
    AND statusCategory IN (Done)
    AND resolutiondate >= "${start}"
    AND resolutiondate < "${end}"
    ORDER BY updated DESC
  `;
}

export function closedTicketForAnEngineerATimeRangeJQL(start: string, end: string, project: string, engineerAccountId : string , additionalField?: string): string {
    const additionalFieldQuery = additionalField ? `AND (${additionalField} IN (${engineerAccountId}) OR assignee in (${engineerAccountId}))` : `AND assignee in (${engineerAccountId})`;
    return `
        project in (${project})
        ${additionalFieldQuery}
        AND statusCategory IN (Done)
        AND resolutiondate >= "${format(new Date(start), 'yyyy-MM-dd')}"
        AND resolutiondate < "${format(new Date(end), 'yyyy-MM-dd')}"
        ORDER BY updated DESC
    `;
}

export const queries = {
    sprintIssues: (sprintId: string, jiraConfig: JiraConfig) => `
    project in (${jiraConfig.project})
    AND sprint = ${sprintId}
    AND statusCategory IN (Done)
    ORDER BY updated DESC
  `,

    customDateRange: (dateRange: string, jiraConfig: JiraConfig) => {
        try {
            const [startDate, endDate] = dateRange.split('|');
            // Handle both ISO string dates and timestamps
            const start = isNaN(Date.parse(startDate)) ? new Date(parseInt(startDate)) : parseISO(startDate);
            const end = isNaN(Date.parse(endDate)) ? new Date(parseInt(endDate)) : parseISO(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error('Invalid date format');
            }

            return `
                project in (${jiraConfig.project})
                AND statusCategory IN (Done)
                AND resolutiondate >= "${format(start, 'yyyy-MM-dd')}"
                AND resolutiondate < "${format(end, 'yyyy-MM-dd')}"
                ORDER BY updated DESC
            `;
        } catch (error) {
            console.error('Error parsing dates:', error);
            throw new Error('Invalid date format in timeframe');
        }
    }
};