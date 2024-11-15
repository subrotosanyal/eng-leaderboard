import type { Engineer, TimeframeStats, Sprint } from '../types';

const mockDevelopers: Engineer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    storyPoints: 34,
    ticketsClosed: 12,
    trend: 2,
    rank: 1,
    issues: []
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    storyPoints: 28,
    ticketsClosed: 15,
    trend: -1,
    rank: 2,
    issues: []
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    storyPoints: 25,
    ticketsClosed: 10,
    trend: 1,
    rank: 3,
    issues: []
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    storyPoints: 22,
    ticketsClosed: 8,
    trend: 0,
    rank: 4,
    issues: []
  }
];

export const mockSprints: Sprint[] = [
  {
    id: 'current',
    name: 'Sprint 24 - Current',
    startDate: '2024-03-11T00:00:00.000Z',
    endDate: '2024-03-24T23:59:59.999Z'
  },
  {
    id: 'previous1',
    name: 'Sprint 23',
    startDate: '2024-02-26T00:00:00.000Z',
    endDate: '2024-03-10T23:59:59.999Z'
  },
  {
    id: 'previous2',
    name: 'Sprint 22',
    startDate: '2024-02-12T00:00:00.000Z',
    endDate: '2024-02-25T23:59:59.999Z'
  }
];

export const mockTimeframeStats: TimeframeStats = {
  sprint: mockDevelopers,
  week: mockDevelopers.map(dev => ({
    ...dev,
    storyPoints: Math.floor(dev.storyPoints * 0.7),
    ticketsClosed: Math.floor(dev.ticketsClosed * 0.8)
  })),
  month: mockDevelopers.map(dev => ({
    ...dev,
    storyPoints: dev.storyPoints * 2,
    ticketsClosed: dev.ticketsClosed * 2
  }))
};