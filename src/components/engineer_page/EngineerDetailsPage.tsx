import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JiraService } from '../../services/jiraService';
import { GenericJiraService } from '../../services/GenericJiraService';
import { FaHome } from 'react-icons/fa';
import Card from '../commom_components/Card';
import EngineerGraph from './EngineerGraph';
import { commonStyle } from '../styles/commonStyles';
import { Issue, JiraConfig, Role, UserDetails } from '../../types';

const EngineerDetailsPage: React.FC<{ jiraConfig: JiraConfig; role: Role }> = ({ jiraConfig, role }) => {
    const { engineerId } = useParams<{ engineerId: string }>();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [engineerDetails, setEngineerDetails] = useState<UserDetails | null>(null);
    const navigate = useNavigate();

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
            }
        };

        fetchEngineer();
    }, [engineerId, jiraConfig, role]);

    return (
        <div className="container mx-auto p-4" style={commonStyle}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate('/')} className="text-blue-500 hover:text-blue-700">
                    <FaHome size={24} />
                </button>
            </div>
            {engineerDetails && (
                <Card title={engineerDetails.displayName}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <img
                            src={engineerDetails.avatarUrls['48x48']}
                            alt={engineerDetails.displayName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                        />
                        <div>
                            <p><strong>Email:</strong> {engineerDetails.emailAddress}</p>
                            <p><strong>Timezone:</strong> {engineerDetails.timeZone}</p>
                            <p><strong>Account ID:</strong> {engineerDetails.accountId}</p>
                            <p><strong>Active:</strong> {engineerDetails.active ? 'Yes' : 'No'}</p>
                            <p><strong>Locale:</strong> {engineerDetails.locale}</p>
                        </div>
                    </div>
                </Card>
            )}
            <EngineerGraph
                issues={issues}
                jiraConfig={jiraConfig}
                role={role}
            />
        </div>
    );
};

export default EngineerDetailsPage;