import { ITicketingService } from '../interfaces/ITicketingService';
import { ITicketingConfig } from '../interfaces/ITicketingConfig';
import { JiraService } from '../implementation/jiraService';

export enum TicketingSystem {
    JIRA = 'JIRA'
}

export class TicketingServiceFactory {
    static createService(system: TicketingSystem, config: ITicketingConfig): ITicketingService {
        switch (system) {
            case TicketingSystem.JIRA:
                return new JiraService(config);
            default:
                throw new Error(`Unsupported ticketing system: ${system}`);
        }
    }
}
