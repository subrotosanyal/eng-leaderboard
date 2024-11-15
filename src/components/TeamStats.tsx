import React from 'react';
import { Users } from 'lucide-react';
import type { Engineer } from '../types';

interface TeamStatsProps {
  developers: Engineer[];
}

const TeamStats: React.FC<TeamStatsProps> = ({ developers }) => {
  const totalStoryPoints = Math.round(developers.reduce((sum, dev) => sum + dev.storyPoints, 0));
  const totalTickets = Math.round(developers.reduce((sum, dev) => sum + dev.ticketsClosed, 0));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">Team Stats</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600 mb-1">Total Story Points</p>
          <p className="text-2xl font-bold text-indigo-900">{totalStoryPoints}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 mb-1">Total Tickets</p>
          <p className="text-2xl font-bold text-purple-900">{totalTickets}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamStats;