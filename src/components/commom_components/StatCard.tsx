import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  onClick?: () => void;
  iconUrl?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, onClick, iconUrl }) => {
  return (
    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--stat-card-bg)' }}>
      <div className="flex items-center">
        {iconUrl && <img src={iconUrl} alt={title} className="w-6 h-6 mr-2" />}
        <p className="text-sm font-medium" style={{ color: 'var(--stat-card-text)' }}>{title}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--stat-card-value)' }}>
        {onClick ? (
          <a href="#" onClick={onClick} className="text-blue-500">
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    </div>
  );
};

export default StatCard;