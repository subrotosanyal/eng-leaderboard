import type { Engineer, ComparisonResult, DateRange, JiraConfig } from '../types';
import { buildJQL } from './jiraQueries';
import { Role, Metrics } from '../types';
import { JiraService } from './jiraService';

export class MetricsComparator {
    private jiraService: JiraService;
    private jiraConfig: JiraConfig;

    constructor(jiraService: JiraService, jiraConfig: JiraConfig) {
        this.jiraService = jiraService;
        this.jiraConfig = jiraConfig;
    }

    public async compareMetrics(timeframe1: DateRange, timeframe2: DateRange, role: Role): Promise<ComparisonResult> {
        const jql1 = buildJQL(timeframe1.start.toString(), timeframe1.end.toString(), this.jiraConfig.project);
        const jql2 = buildJQL(timeframe2.start.toString(), timeframe2.end.toString(), this.jiraConfig.project);

        const [issues1, issues2] = await Promise.all([
            this.jiraService.fetchIssues(jql1),
            this.jiraService.fetchIssues(jql2)
        ]);

        const metrics1 = this.jiraService.processIssues(issues1, role);
        const metrics2 = this.jiraService.processIssues(issues2, role);

        return this.compareMetricsData(metrics1, metrics2);
    }

    private compareMetricsData(metrics1: Engineer[], metrics2: Engineer[]): ComparisonResult {
        const calculateMetrics = (metrics: Engineer[]): Metrics => {
            const storyPoints = metrics.reduce((sum, engineer) => sum + engineer.storyPoints, 0);
            const ticketsClosed = metrics.reduce((sum, engineer) => sum + engineer.ticketsClosed, 0);
            const issueTypeDistribution = metrics.reduce((distribution, engineer) => {
                engineer.issueTypeCount.forEach((count, type) => {
                    distribution[type] = (distribution[type] || 0) + count;
                });
                return distribution;
            }, {} as Record<string, number>);

            const validEngineers = metrics.filter(engineer => engineer.issues.length > 0);
            const averageResolutionTime =
                validEngineers.reduce((sum, engineer) => {
                    const totalResolutionTime = engineer.issues.reduce((time, issue) => {
                        const resolutionTime =
                            new Date(issue.fields.resolutiondate as string).getTime() -
                            new Date(issue.fields.created as string).getTime();
                        return time + resolutionTime;
                    }, 0);
                    return sum + totalResolutionTime / engineer.issues.length;
                }, 0) / validEngineers.length || 0;

            const overallTeamVelocity = validEngineers.length
                ? storyPoints / validEngineers.length
                : 0;

            return {
                storyPoints,
                ticketsClosed,
                issueTypeDistribution,
                averageResolutionTime,
                overallTeamVelocity,
                individualContributions: metrics.map(engineer => ({
                    name: engineer.name,
                    storyPoints: engineer.storyPoints,
                    ticketsClosed: engineer.ticketsClosed,
                    issueTypeDistribution: Object.fromEntries(engineer.issueTypeCount),
                    averageResolutionTime: engineer.issues.length
                        ? engineer.issues.reduce((sum, issue) => {
                            const resolutionTime =
                                new Date(issue.fields.resolutiondate as string).getTime() -
                                new Date(issue.fields.created as string).getTime();
                            return sum + resolutionTime;
                        }, 0) / engineer.issues.length
                        : 0,
                })),
            };
        };

        const calculateDifference = (value1: number, value2: number) => {
            return value1 - value2
        };

        const metricsData1 = calculateMetrics(metrics1);
        const metricsData2 = calculateMetrics(metrics2);

        const issueTypeKeys = Array.from(
            new Set([
                ...Object.keys(metricsData1.issueTypeDistribution),
                ...Object.keys(metricsData2.issueTypeDistribution),
            ])
        );

        return {
            timeframe1: metricsData1,
            timeframe2: metricsData2,
            difference: {
                storyPoints: calculateDifference(metricsData1.storyPoints, metricsData2.storyPoints),
                ticketsClosed: calculateDifference(metricsData1.ticketsClosed, metricsData2.ticketsClosed),
                issueTypeDistribution: issueTypeKeys.reduce((diff, type) => {
                    const val1 = metricsData1.issueTypeDistribution[type] || 0;
                    const val2 = metricsData2.issueTypeDistribution[type] || 0;
                    diff[type] = calculateDifference(val1, val2);
                    return diff;
                }, {} as Record<string, number>),
                averageResolutionTime: calculateDifference(
                    metricsData1.averageResolutionTime,
                    metricsData2.averageResolutionTime
                ),
                overallTeamVelocity: calculateDifference(
                    metricsData1.overallTeamVelocity,
                    metricsData2.overallTeamVelocity
                ),
                individualContributions: metricsData1.individualContributions.map(contribution1 => {
                    const contribution2 =
                        metricsData2.individualContributions.find(c => c.name === contribution1.name) ||
                        { storyPoints: 0, ticketsClosed: 0, averageResolutionTime: 0, issueTypeDistribution: {} };
                    return {
                        name: contribution1.name,
                        storyPoints: calculateDifference(
                            contribution1.storyPoints,
                            contribution2.storyPoints
                        ),
                        ticketsClosed: calculateDifference(
                            contribution1.ticketsClosed,
                            contribution2.ticketsClosed
                        ),
                        issueTypeDistribution: Object.keys(contribution1.issueTypeDistribution).reduce(
                            (diff, type) => {
                                const val1 = (metricsData1.issueTypeDistribution[type as keyof typeof metricsData1.issueTypeDistribution] || 0) as number;
                                const val2 = (metricsData2.issueTypeDistribution[type as keyof typeof metricsData2.issueTypeDistribution] || 0) as number;
                                diff[type] = calculateDifference(val1, val2);
                                return diff;
                            },
                            {} as Record<string, number>
                        ),
                        averageResolutionTime: calculateDifference(
                            contribution1.averageResolutionTime,
                            contribution2.averageResolutionTime
                        ),
                    };
                }),
            },
        };
    }
}