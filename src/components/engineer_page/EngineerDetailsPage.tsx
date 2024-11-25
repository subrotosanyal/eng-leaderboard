import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JiraService } from '../../services/jiraService';
import { GenericJiraService } from '../../services/GenericJiraService';
import Card from '../commom_components/Card';
import EngineerGraph from './EngineerGraph';
import { commonStyle } from '../styles/commonStyles';
import { Issue, JiraConfig, Role, UserDetails } from '../../types';
import ApplicationLayout from "../layout/ApplicationLayout.tsx";

const EngineerDetailsPage: React.FC<{ jiraConfig: JiraConfig; role: Role }> = ({ jiraConfig, role }) => {
    const { engineerId } = useParams<{ engineerId: string }>();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [engineerDetails, setEngineerDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    useNavigate();

    useEffect(() => {
        const fetchEngineer = async () => {
            try {
                const jiraService = new JiraService(jiraConfig, () => {});
                const genericJiraService = new GenericJiraService();
                if (engineerId) {
                    const [fetchedIssues, fetchedEngineerDetails] = await Promise.all([
                        jiraService.getClosedTicketsForEngineer(engineerId, jiraConfig, role),
                        genericJiraService.getUserDetails(engineerId)
                    ]);
                    setIssues(fetchedIssues);
                    setEngineerDetails(fetchedEngineerDetails);
                }
            } catch (error) {
                console.error('Error fetching engineer data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEngineer().catch(error => console.error('Error in fetchEngineer:', error));
    }, [engineerId, jiraConfig, role]);

    return (
        <ApplicationLayout>
            <div className="container mx-auto p-4" style={commonStyle}>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <>
                        {engineerDetails && (
                            <Card title={engineerDetails.displayName}>
                                <div className="grid grid-cols-1 md:grid-cols-5 items-center p-4 bg-white rounded-lg shadow-md" style={commonStyle}>
                                    <img
                                        src={engineerDetails.avatarUrls['48x48']}
                                        alt={engineerDetails.displayName}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
                                    />
                                    <p className="text-lg font-semibold">
                                        {engineerDetails.emailAddress}
                                    </p>
                                </div>
                            </Card>
                        )}
                        <EngineerGraph
                            issues={issues}
                            jiraConfig={jiraConfig}
                            role={role}
                        />
                    </>
                )}
            </div>
        </ApplicationLayout>
    );
};

export default EngineerDetailsPage;