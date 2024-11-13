import api from './api';
import { queries } from './jiraQueries';
import { subMonths, isAfter } from 'date-fns';
import type { Developer, Sprint, TimeframeOption, Issue, Assignee } from '../types';
import { mockTimeframeStats, mockSprints } from '../mocks/data';
import { config } from '../config/env';

export class JiraService {
  private readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(
      config.jira.baseUrl &&
      config.jira.apiToken &&
      config.jira.email &&
      config.jira.projectKey
    );

    if (!this.isConfigured) {
      console.warn('JIRA configuration is incomplete. Using mock data instead.');
    }
  }

  async getSprints(): Promise<Sprint[]> {
    if (!this.isConfigured) {
      return mockSprints;
    }

    const sprints: Sprint[] = [];
    let startAt = 0;
    const maxResults = 50; // Adjust as needed
    const twelveMonthsAgo = subMonths(new Date(), 12);

    try {
      while (true) {
        const response = await api.get(`/rest/agile/1.0/board/61/sprint?state=active,closed&startAt=${startAt}&maxResults=${maxResults}`);
        const fetchedSprints = response.data.values
            .filter((sprint: Sprint) => sprint && sprint.startDate) // Ensure sprint and startDate are defined
            .map((sprint: Sprint) => ({
              id: sprint.id,
              name: sprint.name,
              startDate: sprint.startDate,
              endDate: sprint.endDate
            }))
            .filter((sprint: Sprint) => isAfter(new Date(sprint.startDate), twelveMonthsAgo));

        sprints.push(...fetchedSprints);

        if (response.data.isLast) {
          break;
        }

        startAt += maxResults;
      }

      // Sort sprints by startDate in descending order
      sprints.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      return sprints;
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
      return mockSprints;
    }
  }

  private async fetchIssues(jql: string): Promise<Issue[]> {
    const response = await api.post('/rest/api/3/search', {
      jql,
      fields: ['assignee', config.jira.storyPointField, config.jira.developerField, 'customfield_10110', 'status', 'updated'],
      maxResults: 100
    });
    return response.data.issues as Issue[];
  }

  private processIssues(issues: Issue[]): Developer[] {
    const devMap = new Map<string, {
      id: string;
      name: string;
      avatar: string;
      storyPoints: number;
      ticketsClosed: number;
      previousRank?: number;
      ticketKeys: string[];
    }>();

    issues.forEach(issue => {
      const developers: Assignee[] = issue.fields[config.jira.developerField] as Assignee[];
      const developer: Assignee | null = (developers && developers.length > 0) ? developers[0] : issue.fields.assignee;

      if (!developer) return;

      const devData = devMap.get(developer.accountId) || {
        id: developer.accountId,
        name: developer.displayName,
        avatar: developer.avatarUrls['48x48'],
        storyPoints: 0,
        ticketsClosed: 0,
        ticketKeys: []
      };

      const storyPoints = Number(issue.fields[config.jira.storyPointField]) || 0;
      devData.storyPoints += storyPoints;
      devData.ticketsClosed += 1;
      devData.ticketKeys.push(issue.key);

      devMap.set(developer.accountId, devData);
    });

    return Array.from(devMap.values())
        .sort((a, b) => b.storyPoints - a.storyPoints)
        .map((dev, index) => ({
          ...dev,
          rank: index + 1,
          trend: dev.previousRank ? dev.previousRank - (index + 1) : 0
        }));
  }

  async getTimeframeData(timeframe: TimeframeOption): Promise<Developer[]> {
    if (!this.isConfigured) {
      return mockTimeframeStats[timeframe.type];
    }

    try {
      let jql = '';

      switch (timeframe.type) {
        case 'sprint':
          jql = queries.sprintIssues(timeframe.value);
          break;
        case 'week':
          jql = queries.weeklyIssues(timeframe.value);
          break;
        case 'month':
          jql = queries.monthlyIssues(timeframe.value);
          break;
      }

      const issues = await this.fetchIssues(jql);
      return this.processIssues(issues);
    } catch (error) {
      console.error('Failed to fetch JIRA data:', error);
      console.warn('Falling back to mock data');
      return mockTimeframeStats[timeframe.type];
    }
  }
}