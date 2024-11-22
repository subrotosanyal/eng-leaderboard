import { Medal, Trophy } from 'lucide-react';
import type { Engineer, Issue } from '../types';
import { config } from '../config/env';
import React from 'react';
import { commonStyle } from './styles/commonStyles';
import Card from './Card';
import { Tooltip } from 'react-tooltip';
import StatCard from './StatCard';
import { useNavigate } from 'react-router-dom';

interface LeaderCardProps {
    developer: Engineer;
    rank: number;
    tickets: Issue[];
}

const LeaderCard: React.FC<LeaderCardProps> = ({ developer, rank }) => {
    const navigate = useNavigate();

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

    const handleAvatarClick = () => {
        navigate(`/engineer/${developer.id}`);
    };

    const handleLinkClick = () => {
        const baseUrl = config.jira.baseUrl;
        const issueKeys = developer.issues.map(issue => issue.key).join(',');
        const jql = `id in (${issueKeys})`;
        const url = `${baseUrl}/issues/?jql=${encodeURIComponent(jql)}`;
        window.open(url, '_blank');
    };

    const issueTypeSummary = Array.from(developer.issueTypeCount.entries())
        .map(([issueType, count]) => {
            const iconUrl = developer.issues.find(issue => issue.fields.issuetype.name === issueType)?.fields.issuetype.iconUrl;
            return { issueType, count, iconUrl };
        });

    return (
        <Card
            title={developer.name}
            icon={
                <div className="relative">
                    <img
                        src={developer.avatar}
                        alt={developer.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 cursor-pointer"
                        onClick={handleAvatarClick}
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
                <div data-tooltip-id={`issueTypeTooltip-${developer.id}`} className="cursor-pointer">
                    <p className="text-sm font-medium" style={{ color: 'var(--stat-card-text)' }}>Issue Types</p>
                </div>
                <Tooltip id={`issueTypeTooltip-${developer.id}`} place="top">
                    <div className="flex flex-col">
                        {issueTypeSummary.map(({ issueType, count, iconUrl }) => (
                            <div key={issueType} className="flex items-center space-x-2">
                                {iconUrl && <img src={iconUrl} alt={issueType} className="w-4 h-4" />}
                                <span>{issueType}: {count}</span>
                            </div>
                        ))}
                    </div>
                </Tooltip>
            </div>
        </Card>
    );
};

export default LeaderCard;