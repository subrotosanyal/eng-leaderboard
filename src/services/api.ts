import axios from 'axios';
import { config } from '../config/env';

const api = axios.create({
  baseURL: config.jira.baseUrl,
  headers: {
    'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default api;