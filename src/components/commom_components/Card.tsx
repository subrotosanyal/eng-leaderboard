import React from 'react';
import { commonStyle } from '../styles/commonStyles';

interface CardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, icon }) => {
  return (
    <div
      className="p-6 rounded-xl shadow-lg"
      style={{ ...commonStyle, backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
    >
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default Card;