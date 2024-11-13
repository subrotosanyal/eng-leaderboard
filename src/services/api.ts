import axios from 'axios';
import { config } from '../config/env';

const api = axios.create({
  // baseURL: config.jira.baseUrl,
  headers: {
    'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Atlassian-Token': 'no-check',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization',
  }
});

export default api;