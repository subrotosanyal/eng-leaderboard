import { useState, useEffect } from 'react';
import { Layout, Users } from 'lucide-react';
import LeaderCard from './components/LeaderCard';
import PerformanceChart from './components/PerformanceChart';
import TimeframeSelector from './components/TimeframeSelector';
import { JiraService } from './services/jiraService';
import type { Developer, Sprint, TimeframeOption, ChartData } from './types';
import { config } from './config/env';

function App() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>({
    id: 'loading',
    label: 'Loading...',
    value: '',
    type: 'sprint'
  });
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const initializeData = async () => {
      try {
        const jiraService = new JiraService();
        const fetchedSprints = await jiraService.getSprints();
        setSprints(fetchedSprints);

        // Set the current sprint as default
        const currentSprint = fetchedSprints[0];
        const initialTimeframe: TimeframeOption = {
          id: currentSprint.id,
          label: currentSprint.name,
          value: currentSprint.id,
          type: 'sprint'
        };
        setSelectedTimeframe(initialTimeframe);

        setIsMockData(!(
          config.jira.baseUrl &&
          config.jira.apiToken &&
          config.jira.email &&
          config.jira.projectKey
        ));
      } catch (err) {
        setError('Failed to fetch sprints. Please check your JIRA configuration.');
        console.error('Error fetching sprints:', err);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    const fetchTimeframeData = async () => {
      if (selectedTimeframe.id === 'loading') return;

      try {
        setLoading(true);
        setError(null);
        const jiraService = new JiraService();
        const data = await jiraService.getTimeframeData(selectedTimeframe);
        setDevelopers(data);
      } catch (err) {
        setError('Failed to fetch leaderboard data. Please check your JIRA configuration.');
        console.error('Error fetching JIRA data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeframeData();
  }, [selectedTimeframe]);

  const getChartData = (): ChartData[] => {
    return developers.map(dev => ({
      name: dev.name,
      storyPoints: dev.storyPoints,
      ticketsClosed: dev.ticketsClosed
    }));
  };

  const filteredDevelopers = developers.filter(dev =>
    dev.name.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Layout className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Developer Leaderboard</h1>
          </div>
          <TimeframeSelector
            selected={selectedTimeframe}
            sprints={sprints}
            onChange={setSelectedTimeframe}
            isLoading={loading}
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search developers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {isMockData && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Using mock data. To see real data, please configure your JIRA credentials in the .env file.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredDevelopers.map((developer, index) => (
                <LeaderCard
                  key={developer.id}
                  developer={developer}
                  rank={index + 1}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart
                data={getChartData()}
                title="Story Points vs Tickets Closed"
              />
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-800">Team Stats</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-600 mb-1">Total Story Points</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {developers.reduce((sum, dev) => sum + dev.storyPoints, 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 mb-1">Total Tickets</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {developers.reduce((sum, dev) => sum + dev.ticketsClosed, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;