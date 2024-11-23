import React from 'react';
import Card from '../commom_components/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Engineer, ChartData } from '../../types';
import {commonStyle} from "../styles/commonStyles.ts";

interface PerformanceChartProps {
  developers: Engineer[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ developers }) => {
  const getChartData = (): ChartData[] => {
    return developers.map(dev => ({
      name: dev.name,
      storyPoints: dev.storyPoints,
      ticketsClosed: dev.ticketsClosed
    }));
  };

  const getTicketTypeData = () => {
    const ticketTypeMap = developers.reduce((map, dev) => {
      dev.issues.forEach(issue => {
        const type = issue.fields.issuetype.name;
        const iconUrl = issue.fields.issuetype.iconUrl;
        if (!map[type]) {
          map[type] = { count: 0, iconUrl };
        }
        map[type].count += 1;
      });
      return map;
    }, {} as Record<string, { count: number; iconUrl: string }>);

    return Object.entries(ticketTypeMap).map(([name, { count, iconUrl }]) => ({ name, value: count, iconUrl }));
  };

  const data = getChartData();
  const ticketTypeData = getTicketTypeData();

  const generateUniqueColors = (numColors: number) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      colors.push(`hsl(${(i * 360) / numColors}, 50%, 70%)`);
    }
    return colors;
  };

  const COLORS = generateUniqueColors(ticketTypeData.length);

  const renderCustomLabel = ({ name, iconUrl }: { name: string; iconUrl: string }) => (
    <img src={iconUrl} alt={name} title={name} style={{ width: '20px', height: '20px' }} />
  );

  const renderCustomTooltip = ({ payload }: any) => {
    if (payload && payload.length) {
      const { name, iconUrl, value } = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <img src={iconUrl} alt={name} style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          <span>{name}: {value}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Task Analysis">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip contentStyle={commonStyle}/>
            <Bar
              yAxisId="left"
              dataKey="storyPoints"
              fill="#818cf8"
              name="Story Points"
            />
            <Bar
              yAxisId="right"
              dataKey="ticketsClosed"
              fill="#c084fc"
              name="Tickets Closed"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-[300px] mt-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ticketTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={renderCustomLabel}
            >
              {ticketTypeData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip content={renderCustomTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PerformanceChart;