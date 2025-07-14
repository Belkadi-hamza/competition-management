import React from 'react';
import { Building, Users, MapPin, Trophy, User, Weight, Calendar } from 'lucide-react';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface StatsCardsProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  stats, 
  columns = 3 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  const trendIcons = {
    up: (
      <svg className="w-4 h-4 ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2v-1H5a1 1 0 110-2h2V8H5a1 1 0 010-2h2V5a1 1 0 112 0v1h2a1 1 0 011 1z" clipRule="evenodd" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4 ml-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4 ml-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 mb-6`}>
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${colorClasses[stat.color || 'blue']}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            </div>
            {stat.trend && (
              <div className="flex items-center">
                <span className="text-xs font-medium">
                  {stat.trendValue}
                </span>
                {trendIcons[stat.trend]}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Default export with predefined stats for clubs
export const ClubStatsCards: React.FC<{ 
  totalClubs: number;
  totalPlayers: number;
  citiesCount: number;
}> = ({ totalClubs, totalPlayers, citiesCount }) => {
  return (
    <StatsCards
      stats={[
        {
          title: 'Total Clubs',
          value: totalClubs,
          icon: Building,
          color: 'blue',
          trend: totalClubs > 0 ? 'up' : 'neutral'
        },
        {
          title: 'Total Joueurs',
          value: totalPlayers,
          icon: Users,
          color: 'green',
          trend: totalPlayers > 0 ? 'up' : 'neutral'
        },
        {
          title: 'Villes',
          value: citiesCount,
          icon: MapPin,
          color: 'purple'
        }
      ]}
    />
  );
};

// Default export with predefined stats for players
export const PlayerStatsCards: React.FC<{ 
  totalPlayers: number;
  malePlayers: number;
  femalePlayers: number;
}> = ({ totalPlayers, malePlayers, femalePlayers }) => {
  return (
    <StatsCards
      stats={[
        {
          title: 'Total Joueurs',
          value: totalPlayers,
          icon: Users,
          color: 'blue'
        },
        {
          title: 'Garçons',
          value: malePlayers,
          icon: User,
          color: 'indigo'
        },
        {
          title: 'Filles',
          value: femalePlayers,
          icon: User,
          color: 'purple'
        }
      ]}
    />
  );
};

export default StatsCards;