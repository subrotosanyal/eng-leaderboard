import {JiraField, UserDetails} from "../types";
import api from "./api.ts";

interface RawJiraField {
    id: string;
    key: string;
    name: string;
    untranslatedName: string;
    custom: boolean;
    orderable: boolean;
    navigable: boolean;
    searchable: boolean;
    clauseNames: string[];
    schema: {
        type: string;
        items?: string;
        custom?: string;
        customId?: number;
    };
}

export class GenericJiraService {


    getJiraFields = async (): Promise<JiraField[]> => {
        try {
            const response = await api.get<RawJiraField[]>('/rest/api/3/field');
            const fields = response.data;
            return fields.map(field => ({
                key: field.key,
                name: field.name,
                clauseName: field.clauseNames.length > 0 ? field.clauseNames[0] : ''
            }));
        } catch (error) {
            console.error('Error fetching JIRA fields:', error);
            throw error;
        }
    };

    getUserDetails = async (userId: string): Promise<UserDetails> => {
        try {
            const response = await api.get(`/rest/api/3/user?accountId=${userId}`);
            return response.data as UserDetails;
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw error;
        }
    }
}