import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import {
    BarElement,
    CategoryScale,
    Chart,
    ChartData,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Issue, Role } from '../../types';
import { getStoryPointsPerDeveloper } from '../../services/implementation/utils/jiraUtils';
import Card from '../commom_components/Card';
import { commonStyle } from "../styles/commonStyles.ts";
import { ITicketingConfig } from '../../services/interfaces/ITicketingConfig';

// Register required Chart.js components
Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Legend,
    Tooltip
);

interface EngineerGraphProps {
    issues: Issue[];
    jiraConfig: ITicketingConfig;
    role: Role;
}

const EngineerGraph: React.FC<EngineerGraphProps> = ({ issues, jiraConfig, role }) => {
    const [groupBy, setGroupBy] = useState<'week' | 'month' | 'quarter'>('month');
    const [cumulative, setCumulative] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        setTimeout(() => {
            setLoading(false);
        }, 1000); // Adjust the timeout as needed
    }, []);

    const processDataForGraph = (): ChartData<'line'> => {
        const groupedData: { [key: string]: { tickets: number; storyPoints: number } } = {};

        issues.forEach((issue) => {
            const resolutionDate = issue.fields.resolutiondate;

            if (!resolutionDate) {
                console.warn('Missing or invalid resolution date:', issue);
                return;
            }

            const date = new Date(resolutionDate as string);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date format:', resolutionDate);
                return;
            }

            let key: string;

            switch (groupBy) {
                case 'week': {
                    const startOfWeek = new Date(date);
                    startOfWeek.setDate(date.getDate() - date.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    // Store in a sortable format: YYYY-MM-DD as the key, but display differently
                    const displayKey = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
                    key = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}|${displayKey}`;
                    break;
                }
                case 'month': {
                    // Store in sortable format: YYYY-MM as the key, but display differently
                    const displayKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}|${displayKey}`;
                    break;
                }
                case 'quarter': {
                    const quarter = Math.ceil((date.getMonth() + 1) / 3);
                    // Store in sortable format: YYYY-Q# as the key
                    key = `${date.getFullYear()}-${quarter}|${date.getFullYear()}-Q${quarter}`;
                    break;
                }
                default: {
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                }
            }

            if (!groupedData[key]) {
                groupedData[key] = { tickets: 0, storyPoints: 0 };
            }

            groupedData[key].tickets += 1;
            groupedData[key].storyPoints += getStoryPointsPerDeveloper(issue, jiraConfig, role) || 0;
        });

        const sortedLabels = Object.keys(groupedData).sort((a, b) => {
            // Extract the sortable part before the pipe
            const sortKeyA = a.split('|')[0];
            const sortKeyB = b.split('|')[0];
            return sortKeyA.localeCompare(sortKeyB);
        });

        // Extract display labels
        const labels = sortedLabels.map(key => key.includes('|') ? key.split('|')[1] : key);

        // Use sortedLabels for data mapping to maintain order
        const ticketsData = sortedLabels.map((label) => groupedData[label].tickets);
        const storyPointsData = sortedLabels.map((label) => groupedData[label].storyPoints);

        if (cumulative) {
            for (let i = 1; i < ticketsData.length; i++) {
                ticketsData[i] += ticketsData[i - 1];
                storyPointsData[i] += storyPointsData[i - 1];
            }
        }

        const averageTickets = ticketsData.reduce((sum, value) => sum + value, 0) / ticketsData.length;
        const averageStoryPoints = storyPointsData.reduce((sum, value) => sum + value, 0) / storyPointsData.length;
        return {
            labels,
            datasets: [
                {
                    label: 'Tickets Closed',
                    data: ticketsData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    type: 'line',
                },
                {
                    label: 'Story Points',
                    data: storyPointsData,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    type: 'line',
                },
                {
                    label: 'Average Tickets Closed',
                    data: new Array(labels.length).fill(averageTickets),
                    type: 'line',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    borderDash: [5, 5],
                },
                {
                    label: 'Average Story Points',
                    data: new Array(labels.length).fill(averageStoryPoints),
                    type: 'line',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    borderDash: [5, 5],
                },
            ],
        };
    };

    return (
        <Card title="Engineer Performance">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between mb-4">
                        <div>
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value as 'week' | 'month' | 'quarter')}
                                style={commonStyle}
                                className="border p-2 rounded w-full"
                            >
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="quarter">Quarter</option>
                            </select>
                        </div>
                        <div>
                            <label className="mr-2">Cumulative:</label>
                            <Toggle
                                defaultChecked={cumulative}
                                icons={false}
                                onChange={() => setCumulative(!cumulative)}
                            />
                        </div>
                    </div>
                    <Line
                        data={processDataForGraph()}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                    labels: {
                                        filter: (legendItem) => !legendItem.text.includes('Average'),
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Time',
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Counts',
                                    },
                                },
                            },
                        }}
                    />
                </>
            )}
        </Card>
    );
};

export default EngineerGraph;