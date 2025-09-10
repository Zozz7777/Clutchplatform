#!/usr/bin/env node

/**
 * Enterprise AI Developer Dashboard
 * Advanced web interface for monitoring and controlling the Enterprise AI Developer
 */

const express = require('express');
const path = require('path');
const AIMonitoringAgent = require('../services/aiMonitoringAgent');

const app = express();
const aiAgent = new AIMonitoringAgent();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve enhanced dashboard HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enterprise AI Developer Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
            .header { 
                background: rgba(255,255,255,0.95); 
                padding: 20px; 
                border-radius: 15px; 
                margin-bottom: 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                backdrop-filter: blur(10px);
            }
            .header h1 { 
                color: #2c3e50; 
                font-size: 2.5em; 
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .developer-info {
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin: 10px 0;
            }
            .card { 
                background: rgba(255,255,255,0.95); 
                padding: 25px; 
                margin: 15px 0; 
                border-radius: 15px; 
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .card h2 { 
                color: #2c3e50; 
                margin-bottom: 20px; 
                font-size: 1.8em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .status { 
                display: inline-block; 
                padding: 8px 16px; 
                border-radius: 20px; 
                font-size: 14px; 
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .status.running { background: #4CAF50; color: white; }
            .status.stopped { background: #f44336; color: white; }
            .status.analyzing { background: #ff9800; color: white; }
            .btn { 
                padding: 12px 24px; 
                margin: 8px; 
                border: none; 
                border-radius: 25px; 
                cursor: pointer; 
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
            .btn-primary { background: linear-gradient(45deg, #667eea, #764ba2); color: white; }
            .btn-danger { background: linear-gradient(45deg, #f44336, #d32f2f); color: white; }
            .btn-success { background: linear-gradient(45deg, #4CAF50, #45a049); color: white; }
            .btn-warning { background: linear-gradient(45deg, #ff9800, #f57c00); color: white; }
            .metrics { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                gap: 20px; 
                margin: 20px 0;
            }
            .metric { 
                text-align: center; 
                padding: 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .metric-value { 
                font-size: 3em; 
                font-weight: bold; 
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .metric-label { 
                font-size: 1.1em; 
                opacity: 0.9;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .issue { 
                padding: 15px; 
                margin: 10px 0; 
                border-left: 5px solid #f44336; 
                background: rgba(244, 67, 54, 0.1);
                border-radius: 0 10px 10px 0;
                transition: all 0.3s ease;
            }
            .issue:hover { transform: translateX(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .issue.medium { border-left-color: #ff9800; background: rgba(255, 152, 0, 0.1); }
            .issue.low { border-left-color: #4CAF50; background: rgba(76, 175, 80, 0.1); }
            .issue.resolved { border-left-color: #2196F3; background: rgba(33, 150, 243, 0.1); }
            .resolution { 
                padding: 15px; 
                margin: 10px 0; 
                background: rgba(76, 175, 80, 0.1);
                border-radius: 10px;
                border-left: 5px solid #4CAF50;
            }
            .capabilities { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 15px; 
                margin: 20px 0;
            }
            .capability { 
                padding: 15px; 
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white; 
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
            }
            .loading { 
                display: inline-block; 
                width: 20px; 
                height: 20px; 
                border: 3px solid #f3f3f3; 
                border-top: 3px solid #667eea; 
                border-radius: 50%; 
                animation: spin 1s linear infinite; 
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .alert { 
                padding: 15px; 
                margin: 15px 0; 
                border-radius: 10px; 
                font-weight: bold;
            }
            .alert-success { background: rgba(76, 175, 80, 0.2); color: #2e7d32; border: 1px solid #4CAF50; }
            .alert-error { background: rgba(244, 67, 54, 0.2); color: #c62828; border: 1px solid #f44336; }
            .alert-info { background: rgba(33, 150, 243, 0.2); color: #1565c0; border: 1px solid #2196F3; }
            .tabs { 
                display: flex; 
                margin-bottom: 20px; 
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 5px;
            }
            .tab { 
                flex: 1; 
                padding: 15px; 
                text-align: center; 
                cursor: pointer; 
                border-radius: 8px;
                transition: all 0.3s ease;
                font-weight: bold;
            }
            .tab.active { 
                background: rgba(255,255,255,0.9); 
                color: #2c3e50;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 Enterprise AI Developer Dashboard</h1>
                <div class="developer-info">
                    <h3>👨‍💻 Alex Chen - Senior Enterprise Backend Developer</h3>
                    <p>15+ years experience | Specialized in Node.js, MongoDB, Microservices | Enterprise-grade solutions</p>
                </div>
                <div id="status">
                    <span class="status stopped">Stopped</span>
                    <button class="btn btn-success" onclick="startAgent()">Start AI Agent</button>
                    <button class="btn btn-danger" onclick="stopAgent()">Stop AI Agent</button>
                    <button class="btn btn-primary" onclick="healthCheck()">Manual Health Check</button>
                    <button class="btn btn-warning" onclick="testDeveloper()">Test Developer</button>
                </div>
                <p>Last Check: <span id="lastCheck">Never</span></p>
            </div>
            
            <div class="tabs">
                <div class="tab active" onclick="showTab('overview')">📊 Overview</div>
                <div class="tab" onclick="showTab('issues')">🚨 Issues</div>
                <div class="tab" onclick="showTab('resolutions')">✅ Resolutions</div>
                <div class="tab" onclick="showTab('capabilities')">🛠️ Capabilities</div>
                <div class="tab" onclick="showTab('insights')">🧠 AI Insights</div>
            </div>
            
            <div id="overview" class="tab-content active">
                <div class="card">
                    <h2>📈 System Metrics</h2>
                    <div class="metrics" id="metrics">
                        <div class="metric">
                            <div class="metric-value" id="totalIssues">0</div>
                            <div class="metric-label">Total Issues</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="resolvedIssues">0</div>
                            <div class="metric-label">Resolved Issues</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="successRate">0%</div>
                            <div class="metric-label">Success Rate</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="codeLinesFixed">0</div>
                            <div class="metric-label">Code Lines Fixed</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h2>🎯 Developer Performance</h2>
                    <div class="metrics" id="developerMetrics">
                        <div class="metric">
                            <div class="metric-value" id="issuesResolved">0</div>
                            <div class="metric-label">Issues Resolved</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="performanceImprovements">0</div>
                            <div class="metric-label">Performance Improvements</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="securityFixes">0</div>
                            <div class="metric-label">Security Fixes</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value" id="uptime">0h</div>
                            <div class="metric-label">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="issues" class="tab-content">
                <div class="card">
                    <h2>🚨 Current Issues</h2>
                    <div id="issues">
                        <p>No issues detected</p>
                    </div>
                </div>
            </div>
            
            <div id="resolutions" class="tab-content">
                <div class="card">
                    <h2>✅ Recent Resolutions</h2>
                    <div id="resolutions">
                        <p>No resolutions yet</p>
                    </div>
                </div>
            </div>
            
            <div id="capabilities" class="tab-content">
                <div class="card">
                    <h2>🛠️ AI Developer Capabilities</h2>
                    <div class="capabilities" id="capabilities">
                        <div class="capability">Automatic Code Analysis</div>
                        <div class="capability">Enterprise Solutions</div>
                        <div class="capability">Performance Optimization</div>
                        <div class="capability">Security Hardening</div>
                        <div class="capability">Configuration Management</div>
                        <div class="capability">Dependency Updates</div>
                        <div class="capability">Testing Automation</div>
                        <div class="capability">Documentation Generation</div>
                    </div>
                </div>
            </div>
            
            <div id="insights" class="tab-content">
                <div class="card">
                    <h2>🧠 AI-Powered Insights</h2>
                    <div id="insights">
                        <p>Click "Generate Insights" to get AI-powered analysis</p>
                        <button class="btn btn-primary" onclick="generateInsights()">Generate Insights</button>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            let statusInterval;
            let currentTab = 'overview';
            
            // Tab management
            function showTab(tabName) {
                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Remove active class from all tabs
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Show selected tab content
                document.getElementById(tabName).classList.add('active');
                
                // Add active class to clicked tab
                event.target.classList.add('active');
                
                currentTab = tabName;
                
                // Load tab-specific data
                if (tabName === 'resolutions') {
                    loadResolutions();
                } else if (tabName === 'capabilities') {
                    loadCapabilities();
                }
            }
            
            // Start agent
            async function startAgent() {
                try {
                    showLoading('Starting AI Agent...');
                    const response = await fetch('/api/start', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                        updateStatus();
                        showMessage('AI Agent started successfully', 'success');
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
                    showLoading('Stopping AI Agent...');
                    const response = await fetch('/api/stop', { method: 'POST' });
                    const data = await response.json();
                    if (data.success) {
                        updateStatus();
                        showMessage('AI Agent stopped successfully', 'success');
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
                    showLoading('Performing health check...');
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
            
            // Test Enterprise AI Developer
            async function testDeveloper() {
                try {
                    showLoading('Testing Enterprise AI Developer...');
                    const response = await fetch('/api/test-developer', { 
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ issueType: 'database', severity: 'high' })
                    });
                    const data = await response.json();
                    if (data.success) {
                        showMessage('Enterprise AI Developer test completed successfully', 'success');
                        updateStatus();
                    } else {
                        showMessage('Test failed: ' + data.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error testing developer: ' + error.message, 'error');
                }
            }
            
            // Generate insights
            async function generateInsights() {
                try {
                    showLoading('Generating AI insights...');
                    const response = await fetch('/api/insights');
                    const data = await response.json();
                    if (data.success) {
                        document.getElementById('insights').innerHTML = 
                            '<h3>AI Insights</h3><pre style="white-space: pre-wrap; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; color: #333;">' + 
                            data.data.insights + '</pre>';
                    } else {
                        showMessage('Failed to generate insights: ' + data.message, 'error');
                    }
                } catch (error) {
                    showMessage('Error generating insights: ' + error.message, 'error');
                }
            }
            
            // Load resolutions
            async function loadResolutions() {
                try {
                    const response = await fetch('/api/resolutions?limit=10');
                    const data = await response.json();
                    if (data.success) {
                        updateResolutions(data.data.resolutions);
                    }
                } catch (error) {
                    console.error('Error loading resolutions:', error);
                }
            }
            
            // Load capabilities
            async function loadCapabilities() {
                try {
                    const response = await fetch('/api/capabilities');
                    const data = await response.json();
                    if (data.success) {
                        updateCapabilities(data.data);
                    }
                } catch (error) {
                    console.error('Error loading capabilities:', error);
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
                        
                        // Update developer metrics
                        if (status.enterpriseDeveloper) {
                            const dev = status.enterpriseDeveloper;
                            document.getElementById('issuesResolved').textContent = dev.performance.issuesResolved;
                            document.getElementById('performanceImprovements').textContent = dev.performance.performanceImprovements;
                            document.getElementById('securityFixes').textContent = dev.performance.securityFixes;
                            document.getElementById('codeLinesFixed').textContent = dev.performance.codeLinesFixed;
                            document.getElementById('successRate').textContent = Math.round(dev.successRate) + '%';
                        }
                        
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
                    (issue.autoFixed ? '<br><span style="color: #4CAF50;">✅ Auto-fixed by Enterprise AI Developer</span>' : '') +
                    '</div>'
                ).join('');
            }
            
            // Update resolutions display
            function updateResolutions(resolutions) {
                const resolutionsEl = document.getElementById('resolutions');
                if (resolutions.length === 0) {
                    resolutionsEl.innerHTML = '<p>No resolutions yet</p>';
                    return;
                }
                
                resolutionsEl.innerHTML = resolutions.map(resolution => 
                    '<div class="resolution">' +
                    '<strong>' + resolution.issue.type + '</strong> - ' + resolution.solution + '<br>' +
                    '<small>Resolved by ' + resolution.developer + ' on ' + new Date(resolution.timestamp).toLocaleString() + '</small>' +
                    '</div>'
                ).join('');
            }
            
            // Update capabilities display
            function updateCapabilities(capabilities) {
                const capabilitiesEl = document.getElementById('capabilities');
                capabilitiesEl.innerHTML = capabilities.features.map(feature => 
                    '<div class="capability">' + feature + '</div>'
                ).join('');
            }
            
            // Show loading
            function showLoading(message) {
                showMessage(message + ' <span class="loading"></span>', 'info');
            }
            
            // Show message
            function showMessage(message, type) {
                const alertClass = 'alert-' + (type === 'error' ? 'error' : type === 'success' ? 'success' : 'info');
                const alert = document.createElement('div');
                alert.className = 'alert ' + alertClass;
                alert.innerHTML = message;
                
                document.querySelector('.container').insertBefore(alert, document.querySelector('.header').nextSibling);
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

// API Routes (same as before but with additional endpoints)
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

app.get('/api/resolutions', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const resolutions = aiAgent.enterpriseDeveloper.issueResolutionHistory.slice(-parseInt(limit));
    res.json({ success: true, data: { resolutions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/capabilities', async (req, res) => {
  try {
    const capabilities = {
      developer: aiAgent.enterpriseDeveloper.developerPersona,
      features: [
        'Automatic code analysis',
        'Enterprise-grade solutions',
        'Performance optimization',
        'Security hardening',
        'Configuration management',
        'Dependency updates',
        'Testing automation',
        'Documentation generation',
        'Learning from resolutions'
      ]
    };
    res.json({ success: true, data: capabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/test-developer', async (req, res) => {
  try {
    const { issueType = 'database', severity = 'high' } = req.body;
    const mockIssue = {
      type: issueType,
      severity: severity,
      message: `Test ${issueType} issue for Enterprise AI Developer`,
      timestamp: new Date(),
      testMode: true
    };
    
    const resolution = await aiAgent.enterpriseDeveloper.analyzeAndResolveIssue(mockIssue);
    res.json({ success: true, data: { resolution } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start dashboard server
const PORT = process.env.AI_DASHBOARD_PORT || 3002;
app.listen(PORT, () => {
  console.log(`🤖 Enterprise AI Developer Dashboard running on http://localhost:${PORT}`);
  console.log('📊 Monitor your Enterprise AI Developer at: http://localhost:' + PORT);
});
