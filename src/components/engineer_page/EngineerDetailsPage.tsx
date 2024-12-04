import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TicketingServiceFactory, TicketingSystem } from '../../services/factory/TicketingServiceFactory';
import { config } from '../../config/env';
import Card from '../commom_components/Card';
import EngineerGraph from './EngineerGraph';
import { commonStyle } from '../styles/commonStyles';
import { Issue, JiraConfig, Role, UserDetails } from '../../types';
import ApplicationLayout from "../layout/ApplicationLayout.tsx";

const EngineerDetailsPage: React.FC<{ jiraConfig: JiraConfig; role: Role }> = ({ jiraConfig, role }) => {
    const { engineerId } = useParams<{ engineerId: string }>();
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [tickets, setTickets] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!engineerId) {
                setError('No engineer ID provided');
                setLoading(false);
                return;
            }

            try {
                const ticketingService = TicketingServiceFactory.createService(
                    TicketingSystem.JIRA,
                    { ...jiraConfig, ...config.jira }
                );

                const [userDetailsResponse, ticketsResponse] = await Promise.all([
                    ticketingService.getUserDetails(engineerId),
                    ticketingService.getClosedTicketsForEngineer(engineerId, role)
                ]);

                setUserDetails(userDetailsResponse);
                setTickets(ticketsResponse);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [engineerId, jiraConfig, role]);

    if (loading) {
        return (
            <ApplicationLayout>
                <div className="container mx-auto p-4" style={commonStyle}>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                </div>
            </ApplicationLayout>
        );
    }

    if (error) {
        return (
            <ApplicationLayout>
                <div className="container mx-auto p-4" style={commonStyle}>
                    <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
                        Error: {error}
                    </div>
                </div>
            </ApplicationLayout>
        );
    }

    return (
        <ApplicationLayout>
            <div className="container mx-auto p-4" style={commonStyle}>
                {userDetails && (
                    <Card title={userDetails.displayName}>
                        <div className="grid grid-cols-1 md:grid-cols-5 items-center p-4 bg-white rounded-lg shadow-md" style={commonStyle}>
                            <img
                                src={userDetails.avatarUrls['48x48']}
                                alt={userDetails.displayName}
                                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
                            />
                            <p className="text-lg font-semibold">
                                {userDetails.emailAddress}
                            </p>
                        </div>
                    </Card>
                )}
                <EngineerGraph
                    issues={tickets}
                    jiraConfig={jiraConfig}
                    role={role}
                />
            </div>
        </ApplicationLayout>
    );
};

export default EngineerDetailsPage;