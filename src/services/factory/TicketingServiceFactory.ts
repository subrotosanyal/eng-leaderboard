import { ITicketingService } from '../interfaces/ITicketingService';
import { ITicketingConfig } from '../interfaces/ITicketingConfig';
import { JiraService } from '../jiraService';

export enum TicketingSystem {
    JIRA = 'JIRA'
}

export class TicketingServiceFactory {
    static createService(system: TicketingSystem, config: ITicketingConfig, setIsMockData: (isMock: boolean) => void): ITicketingService {
        switch (system) {
            case TicketingSystem.JIRA:
                return new JiraService(config, setIsMockData);
            default:
                throw new Error(`Unsupported ticketing system: ${system}`);
        }
    }
}
