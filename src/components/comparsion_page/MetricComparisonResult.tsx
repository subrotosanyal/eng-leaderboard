import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from 'recharts';
import Card from '../commom_components/Card';
import SearchBar from '../commom_components/SearchBar';
import { ComparisonResult, IndividualContribution } from '../../types';
import { commonStyle } from '../styles/commonStyles';

interface MetricComparisonResultProps {
    comparisonResult: ComparisonResult;
}

const barColors = ['#8884d8', '#82ca9d'];
const pieColors = ['#6d6dca', '#8bdc82', '#eddf98', '#cd8b8b', '#e3e3e3'];

const MetricComparisonResult: React.FC<MetricComparisonResultProps> = ({ comparisonResult }) => {
    const { timeframe1, timeframe2, difference } = comparisonResult;

    const developers = Array.from(new Set([
        ...timeframe1.individualContributions,
        ...timeframe2.individualContributions
    ].map(contribution => contribution.name)))
    .map(name => {
        const contribution = timeframe1.individualContributions.find(c => c.name === name) ||
                             timeframe2.individualContributions.find(c => c.name === name);
        return { name: contribution!.name, avatar: contribution!.avatar };
    });

    const [selectedNames, setSelectedNames] = useState<{ name: string; avatar: string }[]>(developers);

    const renderPieChart = (data: Record<string, number | null>) => {
        const pieData = Object.entries(data).map(([key, value]) => ({
            name: key,
            value: value ?? 0,
        }));
        return (
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label>
                        {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    const renderIndividualContributionsComparison = (contribution1: IndividualContribution, contribution2: IndividualContribution, name: string) => {
        const barData = [
            { metric: 'Story Points', t1: contribution1.storyPoints, t2: contribution2.storyPoints },
            { metric: 'Tickets Closed', t1: contribution1.ticketsClosed, t2: contribution2.ticketsClosed },
        ];

        return (
            <div key={name} className="p-4 border rounded-lg bg-gray-50 shadow-sm space-y-4" style={commonStyle}>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="t1" name="Timeframe 1" fill={barColors[0]} />
                        <Bar dataKey="t2" name="Timeframe 2" fill={barColors[1]} />
                    </BarChart>
                </ResponsiveContainer>

                <h5 className="text-md font-semibold">Issue Type Distribution Comparison</h5>
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <h6 className="text-sm font-semibold text-gray-600">Timeframe 1</h6>
                        {renderPieChart(contribution1.issueTypeDistribution)}
                    </div>
                    <div className="w-1/2">
                        <h6 className="text-sm font-semibold text-gray-600">Timeframe 2</h6>
                        {renderPieChart(contribution2.issueTypeDistribution)}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Metric Comparison Result</h2>

            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Overall Metrics</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                        { metric: 'Story Points', t1: timeframe1.storyPoints, t2: timeframe2.storyPoints, diff: difference.storyPoints },
                        { metric: 'Tickets Closed', t1: timeframe1.ticketsClosed, t2: timeframe2.ticketsClosed, diff: difference.ticketsClosed },
                    ]}>
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="t1" name="Timeframe 1" fill={barColors[0]} />
                        <Bar dataKey="t2" name="Timeframe 2" fill={barColors[1]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mb-4">
                <SearchBar
                    engineers={developers}
                    selectedNames={selectedNames}
                    setSelectedNames={setSelectedNames}
                />
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Individual Contributions</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {timeframe1.individualContributions.map((contribution1) => {
                        const contribution2 = timeframe2.individualContributions.find(c => c.name === contribution1.name) || {
                            name: contribution1.name,
                            avatar: contribution1.avatar,
                            storyPoints: 0,
                            ticketsClosed: 0,
                            issueTypeDistribution: {},
                            averageResolutionTime: 0,
                        };
                        return selectedNames.some(selected => selected.name === contribution1.name) ? (
                            <Card
                                key={contribution1.name}
                                title={contribution1.name}
                                icon={<img src={contribution1.avatar} alt={`${contribution1.name}'s avatar`} className="w-8 h-8 rounded-full" />}
                            >
                                {renderIndividualContributionsComparison(contribution1, contribution2, contribution1.name)}
                            </Card>
                        ) : null;
                    })}
                </div>
            </div>
        </div>
    );
};

export default MetricComparisonResult;