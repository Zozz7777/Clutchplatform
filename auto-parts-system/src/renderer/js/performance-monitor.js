// Performance Monitor for Clutch Auto Parts System
const performanceManager = require('./performance-manager');
const uiManager = require('./ui');

class PerformanceMonitor {
    constructor() {
        this.currentTab = 'monitoring';
        this.charts = {};
        this.isInitialized = false;
        this.monitoringData = [];
        this.maxDataPoints = 50;
        
        this.init();
    }

    async init() {
        await this.setupEventListeners();
        await this.initializeCharts();
        await this.startMonitoring();
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Action buttons
        const runTestsBtn = document.getElementById('run-performance-tests-btn');
        if (runTestsBtn) {
            runTestsBtn.addEventListener('click', () => {
                this.runPerformanceTests();
            });
        }

        const optimizeSystemBtn = document.getElementById('optimize-system-btn');
        if (optimizeSystemBtn) {
            optimizeSystemBtn.addEventListener('click', () => {
                this.optimizeSystem();
            });
        }

        const exportReportBtn = document.getElementById('export-performance-report-btn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => {
                this.exportPerformanceReport();
            });
        }

        // Test category cards
        const testCategoryCards = document.querySelectorAll('.test-category-card');
        testCategoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.runCategoryTest(e.currentTarget.dataset.category);
            });
        });

        // Optimization buttons
        const optimizeDatabaseBtn = document.getElementById('optimize-database-btn');
        if (optimizeDatabaseBtn) {
            optimizeDatabaseBtn.addEventListener('click', () => {
                this.optimizeDatabase();
            });
        }

        const optimizeMemoryBtn = document.getElementById('optimize-memory-btn');
        if (optimizeMemoryBtn) {
            optimizeMemoryBtn.addEventListener('click', () => {
                this.optimizeMemory();
            });
        }

        const optimizePerformanceBtn = document.getElementById('optimize-performance-btn');
        if (optimizePerformanceBtn) {
            optimizePerformanceBtn.addEventListener('click', () => {
                this.optimizePerformance();
            });
        }

        // Modal events
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Test Results Modal
        const testResultsModal = document.getElementById('test-results-modal');
        const testResultsModalClose = document.getElementById('test-results-modal-close');
        const testResultsClose = document.getElementById('test-results-close');
        const exportTestResultsBtn = document.getElementById('export-test-results-btn');

        if (testResultsModalClose) {
            testResultsModalClose.addEventListener('click', () => {
                this.closeTestResultsModal();
            });
        }

        if (testResultsClose) {
            testResultsClose.addEventListener('click', () => {
                this.closeTestResultsModal();
            });
        }

        if (exportTestResultsBtn) {
            exportTestResultsBtn.addEventListener('click', () => {
                this.exportTestResults();
            });
        }

        // Optimization Modal
        const optimizationModal = document.getElementById('optimization-modal');
        const optimizationModalClose = document.getElementById('optimization-modal-close');
        const optimizationCancel = document.getElementById('optimization-cancel');

        if (optimizationModalClose) {
            optimizationModalClose.addEventListener('click', () => {
                this.closeOptimizationModal();
            });
        }

        if (optimizationCancel) {
            optimizationCancel.addEventListener('click', () => {
                this.closeOptimizationModal();
            });
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });

        // Load tab data
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'monitoring':
                await this.loadMonitoringData();
                break;
            case 'testing':
                await this.loadTestingData();
                break;
            case 'optimization':
                await this.loadOptimizationData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
        }
    }

    async initializeCharts() {
        await this.initializeMemoryChart();
        await this.initializeResponseTimeChart();
        await this.initializeDatabaseQueriesChart();
        await this.initializeErrorRateChart();
        await this.initializePerformanceHistoryChart();
    }

    async initializeMemoryChart() {
        const canvas = document.getElementById('memory-usage-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.memoryUsage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'استخدام الذاكرة (MB)',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'MB'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'الوقت'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async initializeResponseTimeChart() {
        const canvas = document.getElementById('response-time-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.responseTime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'وقت الاستجابة (ms)',
                    data: [],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'ms'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'الوقت'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async initializeDatabaseQueriesChart() {
        const canvas = document.getElementById('database-queries-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.databaseQueries = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'استعلامات قاعدة البيانات',
                    data: [],
                    backgroundColor: 'rgba(255, 193, 7, 0.8)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'عدد الاستعلامات'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'الوقت'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async initializeErrorRateChart() {
        const canvas = document.getElementById('error-rate-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.errorRate = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'معدل الأخطاء',
                    data: [],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'عدد الأخطاء'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'الوقت'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async initializePerformanceHistoryChart() {
        const canvas = document.getElementById('performance-history-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.performanceHistory = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'استخدام الذاكرة',
                        data: [],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'وقت الاستجابة',
                        data: [],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'الذاكرة (MB)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'وقت الاستجابة (ms)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    async startMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000); // Update every 5 seconds
    }

    async updatePerformanceMetrics() {
        const report = performanceManager.getPerformanceReport();
        
        if (report && report.current) {
            this.updateOverviewStats(report.current);
            this.updateCharts(report.current);
            this.updatePerformanceAlerts(report);
        }
    }

    updateOverviewStats(metrics) {
        // Update load time
        const loadTime = document.getElementById('load-time');
        const loadTimeStatus = document.getElementById('load-time-status');
        if (loadTime) {
            loadTime.textContent = `${metrics.loadTime.toFixed(0)}ms`;
            if (loadTimeStatus) {
                loadTimeStatus.textContent = metrics.loadTime < 1000 ? 'جيد' : 'بطيء';
                loadTimeStatus.className = `stat-status ${metrics.loadTime < 1000 ? 'good' : 'warning'}`;
            }
        }

        // Update memory usage
        const memoryUsage = document.getElementById('memory-usage');
        const memoryStatus = document.getElementById('memory-status');
        if (memoryUsage) {
            const memoryMB = (metrics.memoryUsage / 1024 / 1024).toFixed(1);
            memoryUsage.textContent = `${memoryMB}MB`;
            if (memoryStatus) {
                memoryStatus.textContent = metrics.memoryUsage < 50 * 1024 * 1024 ? 'جيد' : 'عالي';
                memoryStatus.className = `stat-status ${metrics.memoryUsage < 50 * 1024 * 1024 ? 'good' : 'warning'}`;
            }
        }

        // Update database queries
        const databaseQueries = document.getElementById('database-queries');
        const databaseStatus = document.getElementById('database-status');
        if (databaseQueries) {
            databaseQueries.textContent = metrics.databaseQueries;
            if (databaseStatus) {
                databaseStatus.textContent = metrics.databaseQueries < 100 ? 'جيد' : 'عالي';
                databaseStatus.className = `stat-status ${metrics.databaseQueries < 100 ? 'good' : 'warning'}`;
            }
        }

        // Update API calls
        const apiCalls = document.getElementById('api-calls');
        const apiStatus = document.getElementById('api-status');
        if (apiCalls) {
            apiCalls.textContent = metrics.apiCalls;
            if (apiStatus) {
                apiStatus.textContent = metrics.apiCalls < 50 ? 'جيد' : 'عالي';
                apiStatus.className = `stat-status ${metrics.apiCalls < 50 ? 'good' : 'warning'}`;
            }
        }

        // Update response time
        const responseTime = document.getElementById('response-time');
        const responseStatus = document.getElementById('response-status');
        if (responseTime) {
            responseTime.textContent = `${metrics.responseTime.toFixed(0)}ms`;
            if (responseStatus) {
                responseStatus.textContent = metrics.responseTime < 500 ? 'جيد' : 'بطيء';
                responseStatus.className = `stat-status ${metrics.responseTime < 500 ? 'good' : 'warning'}`;
            }
        }

        // Update cache hit rate
        const cacheHitRate = document.getElementById('cache-hit-rate');
        const cacheStatus = document.getElementById('cache-status');
        if (cacheHitRate) {
            cacheHitRate.textContent = `${metrics.cacheHitRate.toFixed(1)}%`;
            if (cacheStatus) {
                cacheStatus.textContent = metrics.cacheHitRate > 70 ? 'جيد' : 'منخفض';
                cacheStatus.className = `stat-status ${metrics.cacheHitRate > 70 ? 'good' : 'warning'}`;
            }
        }
    }

    updateCharts(metrics) {
        const now = new Date().toLocaleTimeString();
        
        // Update memory usage chart
        if (this.charts.memoryUsage) {
            const memoryMB = metrics.memoryUsage / 1024 / 1024;
            this.updateChart(this.charts.memoryUsage, now, memoryMB);
        }

        // Update response time chart
        if (this.charts.responseTime) {
            this.updateChart(this.charts.responseTime, now, metrics.responseTime);
        }

        // Update database queries chart
        if (this.charts.databaseQueries) {
            this.updateChart(this.charts.databaseQueries, now, metrics.databaseQueries);
        }

        // Update error rate chart
        if (this.charts.errorRate) {
            this.updateChart(this.charts.errorRate, now, metrics.errorRate);
        }

        // Update performance history chart
        if (this.charts.performanceHistory) {
            const memoryMB = metrics.memoryUsage / 1024 / 1024;
            this.updateMultiDatasetChart(this.charts.performanceHistory, now, [memoryMB, metrics.responseTime]);
        }
    }

    updateChart(chart, label, data) {
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(data);
        
        if (chart.data.labels.length > this.maxDataPoints) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        
        chart.update('none');
    }

    updateMultiDatasetChart(chart, label, dataArray) {
        chart.data.labels.push(label);
        
        dataArray.forEach((data, index) => {
            chart.data.datasets[index].data.push(data);
        });
        
        if (chart.data.labels.length > this.maxDataPoints) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => {
                dataset.data.shift();
            });
        }
        
        chart.update('none');
    }

    updatePerformanceAlerts(report) {
        const alertsContainer = document.getElementById('performance-alerts-list');
        if (!alertsContainer) return;

        alertsContainer.innerHTML = '';

        if (report.recommendations && report.recommendations.length > 0) {
            report.recommendations.forEach(recommendation => {
                const alertElement = document.createElement('div');
                alertElement.className = 'alert-item warning';
                alertElement.innerHTML = `
                    <div class="alert-icon">⚠️</div>
                    <div class="alert-content">
                        <div class="alert-title">توصية تحسين</div>
                        <div class="alert-description">${recommendation}</div>
                    </div>
                `;
                alertsContainer.appendChild(alertElement);
            });
        } else {
            const noAlertsElement = document.createElement('div');
            noAlertsElement.className = 'no-alerts';
            noAlertsElement.innerHTML = `
                <div class="no-alerts-icon">✅</div>
                <div class="no-alerts-text">لا توجد مشاكل في الأداء</div>
            `;
            alertsContainer.appendChild(noAlertsElement);
        }
    }

    async loadMonitoringData() {
        // Monitoring data is loaded automatically via updatePerformanceMetrics
        console.log('Monitoring data loaded');
    }

    async loadTestingData() {
        // Load testing data
        console.log('Testing data loaded');
    }

    async loadOptimizationData() {
        const report = performanceManager.getPerformanceReport();
        
        if (report && report.recommendations) {
            this.renderOptimizationRecommendations(report.recommendations);
        }
    }

    renderOptimizationRecommendations(recommendations) {
        const container = document.getElementById('optimization-recommendations');
        if (!container) return;

        container.innerHTML = '';

        recommendations.forEach(recommendation => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation-item';
            recElement.innerHTML = `
                <div class="recommendation-icon">💡</div>
                <div class="recommendation-content">
                    <div class="recommendation-title">توصية تحسين</div>
                    <div class="recommendation-description">${recommendation}</div>
                </div>
            `;
            container.appendChild(recElement);
        });
    }

    async loadReportsData() {
        const report = performanceManager.getPerformanceReport();
        
        if (report) {
            this.renderCurrentPerformanceReport(report.current);
            this.renderAveragePerformanceReport(report.average);
            this.renderPerformanceComparison(report);
        }
    }

    renderCurrentPerformanceReport(currentMetrics) {
        const container = document.getElementById('current-performance-report');
        if (!container || !currentMetrics) return;

        container.innerHTML = `
            <div class="performance-metrics">
                <div class="metric-item">
                    <span class="metric-label">وقت التحميل:</span>
                    <span class="metric-value">${currentMetrics.loadTime.toFixed(0)}ms</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">استخدام الذاكرة:</span>
                    <span class="metric-value">${(currentMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">استعلامات قاعدة البيانات:</span>
                    <span class="metric-value">${currentMetrics.databaseQueries}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">استدعاءات API:</span>
                    <span class="metric-value">${currentMetrics.apiCalls}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">وقت الاستجابة:</span>
                    <span class="metric-value">${currentMetrics.responseTime.toFixed(0)}ms</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">معدل التخزين المؤقت:</span>
                    <span class="metric-value">${currentMetrics.cacheHitRate.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    renderAveragePerformanceReport(averageMetrics) {
        const container = document.getElementById('average-performance-report');
        if (!container || !averageMetrics) return;

        container.innerHTML = `
            <div class="performance-metrics">
                <div class="metric-item">
                    <span class="metric-label">متوسط استخدام الذاكرة:</span>
                    <span class="metric-value">${(averageMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">متوسط استعلامات قاعدة البيانات:</span>
                    <span class="metric-value">${averageMetrics.databaseQueries.toFixed(0)}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">متوسط استدعاءات API:</span>
                    <span class="metric-value">${averageMetrics.apiCalls.toFixed(0)}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">متوسط وقت الاستجابة:</span>
                    <span class="metric-value">${averageMetrics.responseTime.toFixed(0)}ms</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">متوسط معدل التخزين المؤقت:</span>
                    <span class="metric-value">${averageMetrics.cacheHitRate.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    renderPerformanceComparison(report) {
        const container = document.getElementById('performance-comparison');
        if (!container || !report.current || !report.average) return;

        const current = report.current;
        const average = report.average;

        container.innerHTML = `
            <div class="comparison-metrics">
                <div class="comparison-item">
                    <span class="comparison-label">استخدام الذاكرة:</span>
                    <span class="comparison-value ${current.memoryUsage > average.memoryUsage ? 'higher' : 'lower'}">
                        ${current.memoryUsage > average.memoryUsage ? 'أعلى' : 'أقل'} من المتوسط
                    </span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">وقت الاستجابة:</span>
                    <span class="comparison-value ${current.responseTime > average.responseTime ? 'higher' : 'lower'}">
                        ${current.responseTime > average.responseTime ? 'أبطأ' : 'أسرع'} من المتوسط
                    </span>
                </div>
                <div class="comparison-item">
                    <span class="comparison-label">معدل التخزين المؤقت:</span>
                    <span class="comparison-value ${current.cacheHitRate > average.cacheHitRate ? 'higher' : 'lower'}">
                        ${current.cacheHitRate > average.cacheHitRate ? 'أعلى' : 'أقل'} من المتوسط
                    </span>
                </div>
            </div>
        `;
    }

    async runPerformanceTests() {
        try {
            uiManager.showNotification('جاري تشغيل الاختبارات...', 'info');
            
            const results = await performanceManager.runPerformanceTests();
            
            this.renderTestResults(results);
            this.openTestResultsModal();
            
            uiManager.showNotification('تم إكمال الاختبارات بنجاح', 'success');
        } catch (error) {
            console.error('Error running performance tests:', error);
            uiManager.showNotification('خطأ في تشغيل الاختبارات', 'error');
        }
    }

    async runCategoryTest(category) {
        try {
            uiManager.showNotification(`جاري تشغيل اختبار ${category}...`, 'info');
            
            let results = [];
            
            switch (category) {
                case 'database':
                    results = [await performanceManager.testDatabasePerformance()];
                    break;
                case 'api':
                    results = [await performanceManager.testAPIPerformance()];
                    break;
                case 'memory':
                    results = [await performanceManager.testMemoryUsage()];
                    break;
                case 'cache':
                    results = [await performanceManager.testCachePerformance()];
                    break;
                case 'dom':
                    results = [await performanceManager.testDOMPerformance()];
                    break;
                case 'all':
                    results = await performanceManager.runPerformanceTests();
                    break;
            }
            
            this.renderTestResults(results);
            this.openTestResultsModal();
            
            uiManager.showNotification(`تم إكمال اختبار ${category} بنجاح`, 'success');
        } catch (error) {
            console.error(`Error running ${category} test:`, error);
            uiManager.showNotification(`خطأ في اختبار ${category}`, 'error');
        }
    }

    renderTestResults(results) {
        const summaryContainer = document.getElementById('test-results-summary');
        const detailsContainer = document.getElementById('test-results-details');
        
        if (summaryContainer) {
            const passedTests = results.filter(r => r.status === 'passed').length;
            const totalTests = results.length;
            
            summaryContainer.innerHTML = `
                <div class="test-summary">
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="stat-label">إجمالي الاختبارات:</span>
                            <span class="stat-value">${totalTests}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">الاختبارات الناجحة:</span>
                            <span class="stat-value success">${passedTests}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">الاختبارات الفاشلة:</span>
                            <span class="stat-value error">${totalTests - passedTests}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">معدل النجاح:</span>
                            <span class="stat-value">${((passedTests / totalTests) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (detailsContainer) {
            detailsContainer.innerHTML = '';
            
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = `test-result-item ${result.status}`;
                resultElement.innerHTML = `
                    <div class="test-result-header">
                        <div class="test-name">${this.getTestName(result.name)}</div>
                        <div class="test-status ${result.status}">${result.status === 'passed' ? 'نجح' : 'فشل'}</div>
                    </div>
                    <div class="test-result-details">
                        ${result.executionTime ? `<div class="detail-item">وقت التنفيذ: ${result.executionTime.toFixed(0)}ms</div>` : ''}
                        ${result.memoryIncrease ? `<div class="detail-item">زيادة الذاكرة: ${(result.memoryIncrease / 1024 / 1024).toFixed(1)}MB</div>` : ''}
                        ${result.recommendation ? `<div class="detail-item">التوصية: ${result.recommendation}</div>` : ''}
                        ${result.error ? `<div class="detail-item error">الخطأ: ${result.error}</div>` : ''}
                    </div>
                `;
                detailsContainer.appendChild(resultElement);
            });
        }
    }

    getTestName(testName) {
        const names = {
            'testDatabasePerformance': 'اختبار أداء قاعدة البيانات',
            'testAPIPerformance': 'اختبار أداء API',
            'testMemoryUsage': 'اختبار استخدام الذاكرة',
            'testCachePerformance': 'اختبار أداء التخزين المؤقت',
            'testDOMPerformance': 'اختبار أداء DOM'
        };
        return names[testName] || testName;
    }

    openTestResultsModal() {
        const modal = document.getElementById('test-results-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeTestResultsModal() {
        const modal = document.getElementById('test-results-modal');
        if (modal) modal.style.display = 'none';
    }

    async optimizeSystem() {
        this.openOptimizationModal();
        
        try {
            await this.runOptimizationSteps();
            uiManager.showNotification('تم تحسين النظام بنجاح', 'success');
        } catch (error) {
            console.error('Error optimizing system:', error);
            uiManager.showNotification('خطأ في تحسين النظام', 'error');
        } finally {
            this.closeOptimizationModal();
        }
    }

    async runOptimizationSteps() {
        const steps = [
            { name: 'تحسين قاعدة البيانات', action: () => performanceManager.optimizeDatabase() },
            { name: 'تحسين الذاكرة', action: () => performanceManager.optimizeMemoryUsage() },
            { name: 'تحسين التخزين المؤقت', action: () => performanceManager.setupCaching() },
            { name: 'تحسين الأداء', action: () => performanceManager.autoOptimize() }
        ];
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            this.updateOptimizationProgress((i + 1) / steps.length * 100, step.name);
            await step.action();
        }
    }

    updateOptimizationProgress(percentage, stepName) {
        const progressFill = document.getElementById('optimization-progress-fill');
        const progressText = document.getElementById('optimization-progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = stepName;
        }
    }

    openOptimizationModal() {
        const modal = document.getElementById('optimization-modal');
        if (modal) modal.style.display = 'flex';
    }

    closeOptimizationModal() {
        const modal = document.getElementById('optimization-modal');
        if (modal) modal.style.display = 'none';
    }

    async optimizeDatabase() {
        try {
            await performanceManager.optimizeDatabase();
            uiManager.showNotification('تم تحسين قاعدة البيانات بنجاح', 'success');
        } catch (error) {
            console.error('Error optimizing database:', error);
            uiManager.showNotification('خطأ في تحسين قاعدة البيانات', 'error');
        }
    }

    async optimizeMemory() {
        try {
            await performanceManager.optimizeMemoryUsage();
            uiManager.showNotification('تم تحسين الذاكرة بنجاح', 'success');
        } catch (error) {
            console.error('Error optimizing memory:', error);
            uiManager.showNotification('خطأ في تحسين الذاكرة', 'error');
        }
    }

    async optimizePerformance() {
        try {
            performanceManager.autoOptimize();
            uiManager.showNotification('تم تحسين الأداء بنجاح', 'success');
        } catch (error) {
            console.error('Error optimizing performance:', error);
            uiManager.showNotification('خطأ في تحسين الأداء', 'error');
        }
    }

    async exportPerformanceReport() {
        try {
            const report = performanceManager.getPerformanceReport();
            
            // Create Excel workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet([report.current, report.average]);
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الأداء');
            
            // Save file
            const fileName = `تقرير_الأداء_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            uiManager.showNotification('تم تصدير تقرير الأداء بنجاح', 'success');
        } catch (error) {
            console.error('Error exporting performance report:', error);
            uiManager.showNotification('خطأ في تصدير تقرير الأداء', 'error');
        }
    }

    async exportTestResults() {
        try {
            const results = await performanceManager.runPerformanceTests();
            
            // Create Excel workbook
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(results);
            
            XLSX.utils.book_append_sheet(workbook, worksheet, 'نتائج الاختبارات');
            
            // Save file
            const fileName = `نتائج_الاختبارات_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            uiManager.showNotification('تم تصدير نتائج الاختبارات بنجاح', 'success');
        } catch (error) {
            console.error('Error exporting test results:', error);
            uiManager.showNotification('خطأ في تصدير نتائج الاختبارات', 'error');
        }
    }

    destroy() {
        // Destroy all charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.charts = {};
    }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();
module.exports = performanceMonitor;
