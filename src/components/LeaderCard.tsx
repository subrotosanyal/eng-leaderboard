import {Medal, Trophy} from 'lucide-react';
import type {Engineer, Issue} from '../types';
import {config} from '../config/env';

interface LeaderCardProps {
    developer: Engineer;
    rank: number;
    tickets: Issue[];
}

const LeaderCard: React.FC<LeaderCardProps> = ({developer, rank}) => {
    const getRankIcon = () => {
        switch (rank) {
            case 1:
                return <Trophy className="w-8 h-8 text-yellow-400"/>;
            case 2:
                return <Medal className="w-8 h-8 text-gray-400"/>;
            case 3:
                return <Medal className="w-8 h-8 text-amber-600"/>;
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
        <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img
                        src={developer.avatar}
                        alt={developer.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                    />
                    <div className="absolute -top-2 -right-2">
                        {getRankIcon()}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{developer.name}</h3>
                    <div className="flex items-center space-x-2 text-gray-600">
                        <span className="text-sm">Rank #{rank}</span>
                        <span className={`text-sm ${developer.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {developer.trend > 0 ? '↑' : '↓'} {Math.abs(developer.trend)}
            </span>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-sm text-indigo-600 font-medium">Story Points</p>
                    <p className="text-2xl font-bold text-indigo-900"><a href="#" onClick={() => handleLinkClick()}
                                                                         className="text-blue-500">{developer.storyPoints}</a>
                    </p>
                    <a href="#" onClick={() => handleLinkClick()} className="text-blue-500"></a>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Tickets Closed</p>
                    <p className="text-2xl font-bold text-purple-900"><a href="#" onClick={() => handleLinkClick()}
                                                                         className="text-blue-500">{developer.ticketsClosed}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeaderCard;