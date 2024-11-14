import api from './api';
import { queries } from './jiraQueries';
import { isAfter, subMonths } from 'date-fns';
import type { Assignee, Developer, Issue, Sprint, TimeframeOption } from '../types';
import { mockSprints, mockTimeframeStats } from '../mocks/data';
import type { JiraConfig } from '../types';
import {config} from "../config/env.ts";

export class JiraService {
  private readonly isConfigured: boolean;

  constructor(private jiraConfig: JiraConfig) {
    this.isConfigured = Boolean(
        jiraConfig.project &&
        jiraConfig.board &&
        jiraConfig.developerField &&
        jiraConfig.storyPointField &&
        config.jira.baseUrl &&
        config.jira.email &&
        config.jira.apiToken
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
    const maxResults = 50;
    const twelveMonthsAgo = subMonths(new Date(), 12);

    try {
      while (true) {
        const response = await api.get(`/rest/agile/1.0/board/${this.jiraConfig.board}/sprint?state=active,closed&startAt=${startAt}&maxResults=${maxResults}`);
        const fetchedSprints = response.data.values
          .filter((sprint: Sprint) => sprint && sprint.startDate)
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

      sprints.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      return sprints;
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
      return mockSprints;
    }
  }

  async getTimeframeData(timeframe: TimeframeOption): Promise<Developer[]> {
    if (!this.isConfigured) {
      return mockTimeframeStats[timeframe.type];
    }

    try {
      let jql = '';

      switch (timeframe.type) {
        case 'sprint':
          jql = queries.sprintIssues(timeframe.value, this.jiraConfig);
          break;
        case 'week':
          jql = queries.weeklyIssues(timeframe.value, this.jiraConfig);
          break;
        case 'month':
          jql = queries.monthlyIssues(timeframe.value, this.jiraConfig);
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

  private async fetchIssues(jql: string): Promise<Issue[]> {
    const response = await api.post('/rest/api/3/search', {
      jql,
      fields: ['assignee', this.jiraConfig.storyPointField, this.jiraConfig.developerField, 'customfield_10110', 'status', 'updated'],
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
      issues: Issue[];
    }>();

    issues.forEach(issue => {
      const developers: Assignee[] = issue.fields[this.jiraConfig.developerField] as Assignee[];
      const developer: Assignee | null = (developers && developers.length > 0) ? developers[0] : issue.fields.assignee;

      if (!developer) return;

      const devData = devMap.get(developer.accountId) || {
        id: developer.accountId,
        name: developer.displayName,
        avatar: developer.avatarUrls['48x48'],
        storyPoints: 0,
        ticketsClosed: 0,
        ticketKeys: [],
        issues: []
      };

      const storyPoints = Number(issue.fields[this.jiraConfig.storyPointField]) || 0;
      devData.storyPoints += storyPoints;
      devData.ticketsClosed += 1;
      devData.ticketKeys.push(issue.key);
      devData.issues.push(issue);

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
}