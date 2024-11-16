import React from 'react';
import { Users } from 'lucide-react';
import type { Engineer } from '../types';
import Card from './Card';
import StatCard from './StatCard';

interface TeamStatsProps {
  developers: Engineer[];
}

const TeamStats: React.FC<TeamStatsProps> = ({ developers }) => {
  const totalStoryPoints = Math.round(developers.reduce((sum, dev) => sum + dev.storyPoints, 0));
  const totalTickets = Math.round(developers.reduce((sum, dev) => sum + dev.ticketsClosed, 0));

  return (
    <Card title="Team Stats" icon={<Users className="w-6 h-6 text-indigo-600" />}>
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Story Points"
          value={totalStoryPoints}
        />
        <StatCard
          title="Total Tickets"
          value={totalTickets}
        />
      </div>
    </Card>
  );
};

export default TeamStats;