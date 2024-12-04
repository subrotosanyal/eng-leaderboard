import type { Engineer, ComparisonResult, Metrics, IndividualContribution } from '../types';

export class MetricsComparator {
    public static compareMetricsData(metrics1: Engineer[], metrics2: Engineer[]): ComparisonResult {
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

            const individualContributions: IndividualContribution[] = metrics.map(engineer => ({
                name: engineer.name,
                avatar: engineer.avatar,
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
            }));

            return {
                storyPoints,
                ticketsClosed,
                issueTypeDistribution,
                averageResolutionTime,
                overallTeamVelocity,
                individualContributions,
            };
        };

        const calculateDifference = (value1: number, value2: number) => {
            return value2 - value1;
        };

        const metricsData1 = calculateMetrics(metrics1);
        const metricsData2 = calculateMetrics(metrics2);

        const issueTypeKeys = Array.from(
            new Set([
                ...Object.keys(metricsData1.issueTypeDistribution),
                ...Object.keys(metricsData2.issueTypeDistribution),
            ])
        );

        const difference: Metrics = {
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
                    {
                        name: contribution1.name,
                        avatar: contribution1.avatar,
                        storyPoints: 0,
                        ticketsClosed: 0,
                        averageResolutionTime: 0,
                        issueTypeDistribution: {}
                    };
                return {
                    name: contribution1.name,
                    avatar: contribution1.avatar,
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
                            const val1 = contribution1.issueTypeDistribution[type] || 0;
                            const val2 = contribution2.issueTypeDistribution[type] || 0;
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
        };

        return {
            timeframe1: metricsData1,
            timeframe2: metricsData2,
            difference,
        };
    }
}