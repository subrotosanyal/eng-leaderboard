import { Medal, Trophy } from 'lucide-react';
import type { Engineer, Issue } from '../types';
import { config } from '../config/env';
import React from 'react';
import { commonStyle } from './styles/commonStyles';
import Card from './Card';
import StatCard from './StatCard';

interface LeaderCardProps {
  developer: Engineer;
  rank: number;
  tickets: Issue[];
}

const LeaderCard: React.FC<LeaderCardProps> = ({ developer, rank }) => {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-amber-600" />;
      default:
        return null;
    }
  };

  const handleLinkClick = () => {
    const baseUrl = config.jira.baseUrl;
    const issueKeys = developer.issues.map(issue => issue.key).join(',');
    const jql = `id in (${issueKeys})`;
    const url = `${baseUrl}/issues/?jql=${encodeURIComponent(jql)}`;
    window.open(url, '_blank');
  };

  return (
    <Card
      title={developer.name}
      icon={
        <div className="relative">
          <img
            src={developer.avatar}
            alt={developer.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
          />
          {getRankIcon() && (
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
              {getRankIcon()}
            </div>
          )}
        </div>
      }
    >
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2 text-gray-600" style={commonStyle}>
            <span className="text-sm">#{rank}</span>
            {/*<span className={`text-sm ${developer.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>*/}
            {/*  {developer.trend > 0 ? '↑' : '↓'} {Math.abs(developer.trend)}*/}
            {/*</span>*/}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatCard
          title="Story Points"
          value={developer.storyPoints}
          onClick={handleLinkClick}
        />
        <StatCard
          title="Tickets Closed"
          value={developer.ticketsClosed}
          onClick={handleLinkClick}
        />
      </div>
    </Card>
  );
};

export default LeaderCard;