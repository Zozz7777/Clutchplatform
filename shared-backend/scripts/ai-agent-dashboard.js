#!/usr/bin/env node

/**
 * AI Agent Dashboard
 * Provides a simple web interface to monitor and control the AI agent
 */

const express = require('express');
const path = require('path');
const AIMonitoringAgent = require('../services/aiMonitoringAgent');

const app = express();
const aiAgent = new AIMonitoringAgent();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Agent Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status.running { background: #d4edda; color: #155724; }
            .status.stopped { background: #f8d7da; color: #721c24; }
            .btn { padding: 8px 16px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
            .btn-primary { background: #007bff; color: white; }
            .btn-danger { background: #dc3545; color: white; }
            .btn-success { background: #28a745; color: white; }
            .issue { padding: 10px; margin: 5px 0; border-left: 4px solid #dc3545; background: #f8f9fa; }
            .issue.medium { border-left-color: #ffc107; }
            .issue.low { border-left-color: #28a745; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
            .metric { text-align: center; }
            .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
            .metric-label { color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 AI Monitoring Agent Dashboard</h1>
            
            <div class="card">
                <h2>Agent Status</h2>
                <div id="status">
                    <span class="status stopped">Stopped</span>
                    <button class="btn btn-success" onclick="startAgent()">Start Agent</button>
                    <button class="btn btn-danger" onclick="stopAgent()">Stop Agent</button>
                    <button class="btn btn-primary" onclick="healthCheck()">Manual Health Check</button>
                </div>
                <p>Last Check: <span id="lastCheck">Never</span></p>
            </div>
            
            <div class="card">
                <h2>System Metrics</h2>
                <div class="metrics" id="metrics">
                    <div class="metric">
                        <div class="metric-value" id="totalIssues">0</div>
                        <div class="metric-label">Total Issues</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" id="recentIssues">0</div>
                        <div class="metric-label">Recent Issues (24h)</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" id="autoFixes">0</div>
                        <div class="metric-label">Auto Fixes</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" id="uptime">0h</div>
                        <div class="metric-label">Uptime</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h2>Recent Issues</h2>
                <div id="issues">
                    <p>No issues detected</p>
                </div>
            </div>
            
            <div class="card">
                <h2>AI Insights</h2>
                <div id="insights">
                    <p>Click "Generate Insights" to get AI-powered analysis</p>
                    <button class="btn btn-primary" onclick="generateInsights()">Generate Insights</button>
                </div>
            </div>
        </div>
        
        <script>
            let statusInterval;
            
            // Start agent
            async function startAgent() {
                try {
                    const response = await fetch('/api/start', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                        updateStatus();
                        showMessage('Agent started successfully', 'success');
                    } else {
                        showMessage('Failed to start agent: ' + data.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error starting agent: ' + error.message, 'error');
                }
            }
            
            // Stop agent
            async function stopAgent() {
                try {
                    const response = await fetch('/api/stop', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                        updateStatus();
                        showMessage('Agent stopped successfully', 'success');
                    } else {
                        showMessage('Failed to stop agent: ' + data.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error stopping agent: ' + error.message, 'error');
                }
            }
            
            // Manual health check
            async function healthCheck() {
                try {
                    const response = await fetch('/api/health-check', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                        showMessage('Health check completed', 'success');
                        updateStatus();
                    } else {
                        showMessage('Health check failed: ' + data.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error performing health check: ' + error.message, 'error');
                }
            }
            
            // Generate insights
            async function generateInsights() {
                try {
                    const response = await fetch('/api/insights');
                    const data = await response.json();
                    if (data.success) {
                        document.getElementById('insights').innerHTML = 
                            '<h3>AI Insights</h3><pre style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 4px;">' + 
                            data.data.insights + '</pre>';
                    } else {
                        showMessage('Failed to generate insights: ' + data.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error generating insights: ' + error.message, 'error');
                }
            }
            
            // Update status
            async function updateStatus() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();
                    if (data.success) {
                        const status = data.data;
                        
                        // Update status indicator
                        const statusEl = document.querySelector('.status');
                        statusEl.textContent = status.isRunning ? 'Running' : 'Stopped';
                        statusEl.className = 'status ' + (status.isRunning ? 'running' : 'stopped');
                        
                        // Update last check
                        document.getElementById('lastCheck').textContent = 
                            status.lastCheck ? new Date(status.lastCheck).toLocaleString() : 'Never';
                        
                        // Update metrics
                        document.getElementById('totalIssues').textContent = status.totalIssues;
                        
                        // Update recent issues
                        updateIssues(status.recentIssues);
                    }
                } catch (error) {
                    console.error('Error updating status:', error);
                }
            }
            
            // Update issues display
            function updateIssues(issues) {
                const issuesEl = document.getElementById('issues');
                if (issues.length === 0) {
                    issuesEl.innerHTML = '<p>No issues detected</p>';
                    return;
                }
                
                issuesEl.innerHTML = issues.map(issue => 
                    '<div class="issue ' + issue.severity + '">' +
                    '<strong>' + issue.type + '</strong> - ' + issue.message + '<br>' +
                    '<small>' + new Date(issue.timestamp).toLocaleString() + '</small>' +
                    '</div>'
                ).join('');
            }
            
            // Show message
            function showMessage(message, type) {
                const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
                const alert = document.createElement('div');
                alert.className = 'alert ' + alertClass;
                alert.textContent = message;
                alert.style.cssText = 'padding: 10px; margin: 10px 0; border-radius: 4px; background: ' + 
                    (type === 'error' ? '#f8d7da' : '#d4edda') + '; color: ' + 
                    (type === 'error' ? '#721c24' : '#155724');
                
                document.querySelector('.container').insertBefore(alert, document.querySelector('.card'));
                setTimeout(() => alert.remove(), 5000);
            }
            
            // Start auto-refresh
            updateStatus();
            statusInterval = setInterval(updateStatus, 10000); // Update every 10 seconds
            
            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
                if (statusInterval) clearInterval(statusInterval);
            });
        </script>
    </body>
    </html>
  `);
});

// API Routes
app.post('/api/start', async (req, res) => {
  try {
    await aiAgent.start();
    res.json({ success: true, message: 'Agent started successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/stop', async (req, res) => {
  try {
    await aiAgent.stop();
    res.json({ success: true, message: 'Agent stopped successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const status = aiAgent.getStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/health-check', async (req, res) => {
  try {
    await aiAgent.performHealthCheck();
    res.json({ success: true, message: 'Health check completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/insights', async (req, res) => {
  try {
    const insights = await aiAgent.generateInsights();
    res.json({ success: true, data: { insights } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start dashboard server
const PORT = process.env.AI_DASHBOARD_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🤖 AI Agent Dashboard running on http://localhost:${PORT}`);
  console.log('📊 Monitor your AI agent at: http://localhost:' + PORT);
});
