import React from 'react';

interface ScoreCardProps {
  label: string;
  value: number;
  color: string;
  icon?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ label, value, color, icon }) => {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-gray-600`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
        </div>
        {icon && (
          <div className="text-3xl">{icon}</div>
        )}
      </div>
    </div>
  );
};

