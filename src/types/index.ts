export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Developer {
  id: string;
  name: string;
  avatar: string;
  storyPoints: number;
  ticketsClosed: number;
  trend: number;
  rank: number;
}

export interface TimeframeStats {
  sprint: Developer[];
  week: Developer[];
  month: Developer[];
}

export interface ChartData {
  name: string;
  storyPoints: number;
  ticketsClosed: number;
}

export interface TimeframeOption {
  id: string;
  label: string;
  value: string;
  type: 'sprint' | 'week' | 'month';
}