export interface Player {
  id: string;
  name: string;
  category: string;
  weight: number;
  age: number;
  belt: string;
  club: string;
  photo?: string;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  player1: Player | null;
  player2: Player | null;
  winner: Player | null;
  score?: {
    player1: number;
    player2: number;
  };
  status: 'pending' | 'active' | 'completed';
  nextMatchId?: string;
  scheduledTime?: Date;
}

export interface Tournament {
  id: string;
  name: string;
  category: string;
  date: Date;
  players: Player[];
  matches: Match[];
  status: 'registration' | 'active' | 'completed';
  maxPlayers: number;
}

export interface Category {
  id: string;
  name: string;
  minWeight: number;
  maxWeight: number;
  minAge: number;
  maxAge: number;
  minBelt: string;
  maxBelt: string;
}