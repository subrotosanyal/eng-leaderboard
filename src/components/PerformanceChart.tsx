import React from 'react';
import Card from './Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../types';

interface PerformanceChartProps {
  data: ChartData[];
  title: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title }) => {
  return (
    <Card title={title}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
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
    </Card>
  );
};

export default PerformanceChart;