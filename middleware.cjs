const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

const distPath = path.join(__dirname, 'dist');
const defaultJiraBaseUrl = process.env.VITE_JIRA_BASE_URL || 'https://your-jira-instance.atlassian.net';
const PORT = process.env.VITE_MIDDLEWARE_PORT || 5000;

let jiraBaseUrl = defaultJiraBaseUrl;
console.log(jiraBaseUrl);
if (!jiraBaseUrl) {
    console.error('Error: JIRA Base URL is undefined. Please check your configuration.');
    process.exit(1); // Exit the application if JIRA Base URL is undefined
}

// Serve React build files
app.use(express.static(distPath));

// Update JIRA Base URL dynamically
app.post('/update-config', express.json(), (req, res) => {
    const { jiraBaseUrl: newUrl } = req.body;
    if (newUrl) {
        jiraBaseUrl = newUrl;
        console.log(`Updated JIRA Base URL to: ${jiraBaseUrl}`);
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } else {
        res.status(400).json({ error: 'Invalid JIRA Base URL' });
    }
});

// Proxy middleware for API calls
app.use(
    '/api/jira',
    (req, res, next) => {
        if (!jiraBaseUrl) {
            return res.status(500).json({ error: 'JIRA Base URL is not set' });
        }
        next();
    },
    createProxyMiddleware({
        target: jiraBaseUrl,
        secure: false,
        changeOrigin: true,
        headers: {
            'X-Atlassian-Token': 'no-check',
            origin: `http://localhost:${PORT}`,
            'User-Agent': 'test'
        },
        pathRewrite: { '^/api/jira': '' },
    })
);

// Serve index.html for other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Middleware running on http://localhost:${PORT}`);
});