import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, onClick }) => {
  return (
    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--stat-card-bg)' }}>
      <p className="text-sm font-medium" style={{ color: 'var(--stat-card-text)' }}>{title}</p>
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