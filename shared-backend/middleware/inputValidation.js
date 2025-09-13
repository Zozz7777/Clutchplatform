/**
 * Input Validation Middleware
 * Validates and sanitizes request inputs
 */

const { body, validationResult } = require('express-validator');

// Validation schemas
const validationSchemas = {
  bookingUpdate: [
    body('bookingId').isString().notEmpty().withMessage('Booking ID is required'),
    body('status').isString().notEmpty().withMessage('Status is required'),
    body('mechanicName').optional().isString(),
    body('estimatedTime').optional().isString()
  ],
  notification: [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['info', 'warning', 'error', 'success'])
  ],
  payment: [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').isString().notEmpty().withMessage('Currency is required'),
    body('paymentMethod').isString().notEmpty().withMessage('Payment method is required'),
    body('bookingId').optional().isString()
  ],
  subscription: [
    body('planId').isString().notEmpty().withMessage('Plan ID is required'),
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('paymentMethod').isString().notEmpty().withMessage('Payment method is required')
  ],
  paymentPlan: [
    body('name').isString().notEmpty().withMessage('Plan name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('interval').isIn(['monthly', 'yearly']).withMessage('Interval must be monthly or yearly')
  ],
  splitPayment: [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('splits').isArray().withMessage('Splits must be an array'),
    body('splits.*.userId').isString().notEmpty().withMessage('User ID is required for each split'),
    body('splits.*.amount').isNumeric().withMessage('Split amount must be a number')
  ],
  invoice: [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.name').isString().notEmpty().withMessage('Item name is required'),
    body('items.*.price').isNumeric().withMessage('Item price must be a number'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1')
  ],
  template: [
    body('name').isString().notEmpty().withMessage('Template name is required'),
    body('type').isString().notEmpty().withMessage('Template type is required'),
    body('category').optional().isString(),
    body('subject').optional().isString(),
    body('content').isString().notEmpty().withMessage('Template content is required'),
    body('variables').optional().isArray()
  ],
  refund: [
    body('transactionId').isString().notEmpty().withMessage('Transaction ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('reason').isString().notEmpty().withMessage('Refund reason is required')
  ],
  maintenanceSchedule: [
    body('vehicleId').isString().notEmpty().withMessage('Vehicle ID is required'),
    body('services').isArray().withMessage('Services must be an array'),
    body('preferredDate').isISO8601().withMessage('Preferred date must be a valid date')
  ],
  dynamicPricing: [
    body('serviceId').isString().notEmpty().withMessage('Service ID is required'),
    body('basePrice').isNumeric().withMessage('Base price must be a number'),
    body('factors').isObject().withMessage('Factors must be an object')
  ],
  maintenancePrediction: [
    body('vehicleData').isObject().withMessage('Vehicle data must be an object'),
    body('historicalData').optional().isArray().withMessage('Historical data must be an array')
  ],
  reportRequest: [
    body('reportType').isString().notEmpty().withMessage('Report type is required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Format must be json, csv, or pdf')
  ],
  sentimentAnalysis: [
    body('text').isString().notEmpty().withMessage('Text is required'),
    body('context').optional().isString().withMessage('Context must be a string')
  ],
  exportRequest: [
    body('dataType').isString().notEmpty().withMessage('Data type is required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('format').isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel')
  ],
  setupIntent: [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('paymentMethod').isString().notEmpty().withMessage('Payment method is required')
  ],
  chatCompletion: [
    body('messages').isArray().withMessage('Messages must be an array'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
    body('messages.*.content').isString().notEmpty().withMessage('Message content is required'),
    body('model').optional().isString().withMessage('Model must be a string'),
    body('temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2')
  ],
  dashboardRequest: [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('widgets').isArray().withMessage('Widgets must be an array'),
    body('timeRange').optional().isObject().withMessage('Time range must be an object')
  ],
  paymentConfirmation: [
    body('paymentIntentId').isString().notEmpty().withMessage('Payment intent ID is required'),
    body('bookingId').isString().notEmpty().withMessage('Booking ID is required')
  ],
  // B2B Service Validation Schemas
  whitelabel: [
    body('clientId').isString().notEmpty().withMessage('Client ID is required'),
    body('clientName').isString().notEmpty().withMessage('Client name is required'),
    body('branding').isObject().withMessage('Branding must be an object'),
    body('branding.logo').optional().isURL().withMessage('Logo must be a valid URL'),
    body('branding.colors').optional().isObject().withMessage('Colors must be an object'),
    body('branding.companyName').optional().isString().withMessage('Company name must be a string'),
    body('features').isArray().withMessage('Features must be an array')
  ],
  apiKey: [
    body('clientId').isString().notEmpty().withMessage('Client ID is required'),
    body('keyName').isString().notEmpty().withMessage('Key name is required'),
    body('permissions').isArray().withMessage('Permissions must be an array'),
    body('rateLimit').optional().isInt({ min: 1 }).withMessage('Rate limit must be a positive integer'),
    body('expiresAt').optional().isISO8601().withMessage('Expiration date must be a valid date')
  ],
  webhook: [
    body('clientId').isString().notEmpty().withMessage('Client ID is required'),
    body('name').isString().notEmpty().withMessage('Webhook name is required'),
    body('url').isURL().withMessage('Webhook URL must be a valid URL'),
    body('events').isArray().withMessage('Events must be an array')
  ],
  integration: [
    body('clientId').isString().notEmpty().withMessage('Client ID is required'),
    body('name').isString().notEmpty().withMessage('Integration name is required'),
    body('type').isString().notEmpty().withMessage('Integration type is required'),
    body('config').isObject().withMessage('Configuration must be an object')
  ],
  customReport: [
    body('clientId').isString().notEmpty().withMessage('Client ID is required'),
    body('reportName').isString().notEmpty().withMessage('Report name is required'),
    body('type').isString().notEmpty().withMessage('Report type is required'),
    body('schedule').isString().notEmpty().withMessage('Schedule is required'),
    body('recipients').isArray().withMessage('Recipients must be an array'),
    body('format').optional().isIn(['pdf', 'excel', 'csv', 'json']).withMessage('Format must be pdf, excel, csv, or json')
  ],
  // Analytics Validation Schemas
  analytics: [
    body('name').isString().notEmpty().withMessage('Analytics name is required'),
    body('type').isString().notEmpty().withMessage('Analytics type is required'),
    body('config').isObject().withMessage('Configuration must be an object')
  ],
  analyticsUpdate: [
    body('name').optional().isString().withMessage('Analytics name must be a string'),
    body('type').optional().isString().withMessage('Analytics type must be a string'),
    body('config').optional().isObject().withMessage('Configuration must be an object')
  ],
  predictiveModel: [
    body('name').isString().notEmpty().withMessage('Model name is required'),
    body('type').isString().notEmpty().withMessage('Model type is required'),
    body('algorithm').isString().notEmpty().withMessage('Algorithm is required'),
    body('parameters').isObject().withMessage('Parameters must be an object')
  ],
  predictionRequest: [
    body('modelId').isString().notEmpty().withMessage('Model ID is required'),
    body('inputData').isObject().withMessage('Input data must be an object'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  reportGeneration: [
    body('reportId').isString().notEmpty().withMessage('Report ID is required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('format').optional().isIn(['pdf', 'excel', 'csv', 'json']).withMessage('Format must be pdf, excel, csv, or json')
  ],
  kpi: [
    body('name').isString().notEmpty().withMessage('KPI name is required'),
    body('target').isNumeric().withMessage('Target must be a number'),
    body('unit').isString().notEmpty().withMessage('Unit is required'),
    body('frequency').isString().notEmpty().withMessage('Frequency is required')
  ],
  kpiValue: [
    body('value').isNumeric().withMessage('Value must be a number'),
    body('date').isISO8601().withMessage('Date must be a valid date'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  biQuery: [
    body('query').isString().notEmpty().withMessage('Query is required'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object')
  ],
  biExecution: [
    body('queryId').isString().notEmpty().withMessage('Query ID is required'),
    body('executionOptions').optional().isObject().withMessage('Execution options must be an object')
  ],
  dataExport: [
    body('dataType').isString().notEmpty().withMessage('Data type is required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('format').isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel')
  ],
  exportSchedule: [
    body('dataType').isString().notEmpty().withMessage('Data type is required'),
    body('schedule').isString().notEmpty().withMessage('Schedule is required'),
    body('recipients').isArray().withMessage('Recipients must be an array'),
    body('format').isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel')
  ],
  // Partner Mobile Validation Schemas
  inventoryItem: [
    body('name').isString().notEmpty().withMessage('Item name is required'),
    body('category').isString().notEmpty().withMessage('Category is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('sku').optional().isString().withMessage('SKU must be a string')
  ],
  service: [
    body('name').isString().notEmpty().withMessage('Service name is required'),
    body('category').isString().notEmpty().withMessage('Service category is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  // Clutch Mobile Validation Schemas
  vehicle: [
    body('make').isString().notEmpty().withMessage('Make is required'),
    body('model').isString().notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
    body('vin').isString().notEmpty().withMessage('VIN is required'),
    body('mileage').isInt({ min: 0 }).withMessage('Mileage must be a non-negative integer'),
    body('color').optional().isString().withMessage('Color must be a string'),
    body('licensePlate').optional().isString().withMessage('License plate must be a string')
  ],
  booking: [
    body('serviceId').isString().notEmpty().withMessage('Service ID is required'),
    body('preferredDate').isISO8601().withMessage('Preferred date must be a valid date'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  order: [
    body('parts').isArray().withMessage('Parts must be an array'),
    body('parts.*.partId').isString().notEmpty().withMessage('Part ID is required for each part'),
    body('parts.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1 for each part'),
    body('shippingAddress').isObject().withMessage('Shipping address must be an object'),
    body('paymentMethod').isString().notEmpty().withMessage('Payment method is required')
  ],
  // Communication Validation Schemas
  communication: [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('type').isString().notEmpty().withMessage('Type is required'),
    body('recipients').isArray().withMessage('Recipients must be an array')
  ],
  communicationUpdate: [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('content').optional().isString().withMessage('Content must be a string'),
    body('type').optional().isString().withMessage('Type must be a string'),
    body('recipients').optional().isArray().withMessage('Recipients must be an array')
  ],
  message: [
    body('content').isString().notEmpty().withMessage('Message content is required'),
    body('recipientId').isString().notEmpty().withMessage('Recipient ID is required'),
    body('type').optional().isIn(['text', 'file', 'image']).withMessage('Type must be text, file, or image')
  ],
  meeting: [
    body('title').isString().notEmpty().withMessage('Meeting title is required'),
    body('startTime').isISO8601().withMessage('Start time must be a valid date'),
    body('endTime').isISO8601().withMessage('End time must be a valid date'),
    body('participants').isArray().withMessage('Participants must be an array')
  ],
  announcement: [
    body('title').isString().notEmpty().withMessage('Announcement title is required'),
    body('content').isString().notEmpty().withMessage('Announcement content is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high')
  ],
  document: [
    body('title').isString().notEmpty().withMessage('Document title is required'),
    body('type').isString().notEmpty().withMessage('Document type is required'),
    body('content').isString().notEmpty().withMessage('Document content is required')
  ],
  poll: [
    body('question').isString().notEmpty().withMessage('Poll question is required'),
    body('options').isArray({ min: 2 }).withMessage('Poll must have at least 2 options'),
    body('expiresAt').optional().isISO8601().withMessage('Expiration date must be a valid date')
  ],
  vote: [
    body('optionId').isString().notEmpty().withMessage('Option ID is required')
  ],
  event: [
    body('title').isString().notEmpty().withMessage('Event title is required'),
    body('startTime').isISO8601().withMessage('Start time must be a valid date'),
    body('endTime').isISO8601().withMessage('End time must be a valid date'),
    body('location').optional().isString().withMessage('Location must be a string')
  ],
  rsvp: [
    body('status').isIn(['attending', 'not_attending', 'maybe']).withMessage('Status must be attending, not_attending, or maybe')
  ],
  // Legal Validation Schemas
  legal: [
    body('title').isString().notEmpty().withMessage('Legal document title is required'),
    body('type').isString().notEmpty().withMessage('Legal document type is required'),
    body('content').isString().notEmpty().withMessage('Legal document content is required')
  ],
  legalUpdate: [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('type').optional().isString().withMessage('Type must be a string'),
    body('content').optional().isString().withMessage('Content must be a string')
  ],
  contract: [
    body('title').isString().notEmpty().withMessage('Contract title is required'),
    body('parties').isArray({ min: 2 }).withMessage('Contract must have at least 2 parties'),
    body('terms').isString().notEmpty().withMessage('Contract terms are required'),
    body('effectiveDate').isISO8601().withMessage('Effective date must be a valid date')
  ],
  contractSignature: [
    body('signature').isString().notEmpty().withMessage('Signature is required'),
    body('signedAt').isISO8601().withMessage('Signature date must be a valid date')
  ],
  policy: [
    body('title').isString().notEmpty().withMessage('Policy title is required'),
    body('category').isString().notEmpty().withMessage('Policy category is required'),
    body('content').isString().notEmpty().withMessage('Policy content is required'),
    body('effectiveDate').isISO8601().withMessage('Effective date must be a valid date')
  ],
  compliance: [
    body('title').isString().notEmpty().withMessage('Compliance title is required'),
    body('type').isString().notEmpty().withMessage('Compliance type is required'),
    body('requirements').isArray().withMessage('Requirements must be an array'),
    body('deadline').isISO8601().withMessage('Deadline must be a valid date')
  ],
  audit: [
    body('scope').isString().notEmpty().withMessage('Audit scope is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date')
  ],
  case: [
    body('title').isString().notEmpty().withMessage('Case title is required'),
    body('type').isString().notEmpty().withMessage('Case type is required'),
    body('description').isString().notEmpty().withMessage('Case description is required'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priority must be low, medium, high, or urgent')
  ],
  caseStatus: [
    body('status').isString().notEmpty().withMessage('Status is required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  riskAssessment: [
    body('title').isString().notEmpty().withMessage('Risk assessment title is required'),
    body('riskType').isString().notEmpty().withMessage('Risk type is required'),
    body('probability').isIn(['low', 'medium', 'high']).withMessage('Probability must be low, medium, or high'),
    body('impact').isIn(['low', 'medium', 'high']).withMessage('Impact must be low, medium, or high')
  ],
  riskLevel: [
    body('riskLevel').isIn(['low', 'medium', 'high', 'critical']).withMessage('Risk level must be low, medium, high, or critical'),
    body('mitigation').optional().isString().withMessage('Mitigation must be a string')
  ],
  // Project Validation Schemas
  projectUpdate: [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('status').optional().isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled']).withMessage('Status must be planning, active, on_hold, completed, or cancelled'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date')
  ],
  risk: [
    body('title').isString().notEmpty().withMessage('Risk title is required'),
    body('description').isString().notEmpty().withMessage('Risk description is required'),
    body('probability').isIn(['low', 'medium', 'high']).withMessage('Probability must be low, medium, or high'),
    body('impact').isIn(['low', 'medium', 'high']).withMessage('Impact must be low, medium, or high')
  ],
  riskUpdate: [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('probability').optional().isIn(['low', 'medium', 'high']).withMessage('Probability must be low, medium, or high'),
    body('impact').optional().isIn(['low', 'medium', 'high']).withMessage('Impact must be low, medium, or high')
  ],
  task: [
    body('title').isString().notEmpty().withMessage('Task title is required'),
    body('description').isString().notEmpty().withMessage('Task description is required'),
    body('assigneeId').isString().notEmpty().withMessage('Assignee ID is required'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high')
  ],
  taskUpdate: [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('assigneeId').optional().isString().withMessage('Assignee ID must be a string'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high')
  ],
  milestone: [
    body('title').isString().notEmpty().withMessage('Milestone title is required'),
    body('description').isString().notEmpty().withMessage('Milestone description is required'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
    body('deliverables').optional().isArray().withMessage('Deliverables must be an array')
  ],
  milestoneUpdate: [
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
    body('deliverables').optional().isArray().withMessage('Deliverables must be an array')
  ],
  teamMember: [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('role').isString().notEmpty().withMessage('Role is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date')
  ],
  projectSettings: [
    body('settings').isObject().withMessage('Settings must be an object'),
    body('notifications').optional().isObject().withMessage('Notifications must be an object')
  ],
  // Partner Validation Schemas
  partner: [
    body('name').isString().notEmpty().withMessage('Partner name is required'),
    body('type').isString().notEmpty().withMessage('Partner type is required'),
    body('contactInfo').isObject().withMessage('Contact info must be an object'),
    body('services').isArray().withMessage('Services must be an array')
  ],
  partnerUpdate: [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('type').optional().isString().withMessage('Type must be a string'),
    body('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
    body('services').optional().isArray().withMessage('Services must be an array')
  ],
  imageAnalysis: [
    body('imageUrl').isURL().withMessage('Image URL must be a valid URL'),
    body('analysisType').isString().notEmpty().withMessage('Analysis type is required')
  ],
  alertRequest: [
    body('alertType').isString().notEmpty().withMessage('Alert type is required'),
    body('conditions').isObject().withMessage('Conditions must be an object'),
    body('actions').isArray().withMessage('Actions must be an array')
  ],

  // ==================== ANALYTICS VALIDATION SCHEMAS ====================
  analytics: [
    body('type').isString().notEmpty().withMessage('Analytics type is required'),
    body('name').isString().notEmpty().withMessage('Analytics name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'archived']).withMessage('Status must be active, inactive, or archived'),
    body('visibility').optional().isIn(['public', 'private', 'role_based', 'department_based']).withMessage('Invalid visibility option')
  ],
  analyticsUpdate: [
    body('type').optional().isString().notEmpty().withMessage('Analytics type is required'),
    body('name').optional().isString().notEmpty().withMessage('Analytics name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'archived']).withMessage('Status must be active, inactive, or archived'),
    body('visibility').optional().isIn(['public', 'private', 'role_based', 'department_based']).withMessage('Invalid visibility option')
  ],
  predictiveModel: [
    body('name').isString().notEmpty().withMessage('Model name is required'),
    body('type').isString().notEmpty().withMessage('Model type is required'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object'),
    body('trainingData').optional().isArray().withMessage('Training data must be an array')
  ],
  predictionRequest: [
    body('modelId').isString().notEmpty().withMessage('Model ID is required'),
    body('inputData').isObject().withMessage('Input data is required'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  customReport: [
    body('name').isString().notEmpty().withMessage('Report name is required'),
    body('type').isString().notEmpty().withMessage('Report type is required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('scheduling').optional().isObject().withMessage('Scheduling must be an object')
  ],
  reportGeneration: [
    body('reportId').isString().notEmpty().withMessage('Report ID is required'),
    body('format').optional().isIn(['pdf', 'excel', 'csv', 'json']).withMessage('Invalid format'),
    body('filters').optional().isObject().withMessage('Filters must be an object')
  ],
  kpi: [
    body('name').isString().notEmpty().withMessage('KPI name is required'),
    body('category').isString().notEmpty().withMessage('KPI category is required'),
    body('target').isNumeric().withMessage('Target must be a number'),
    body('unit').optional().isString().withMessage('Unit must be a string')
  ],
  kpiValue: [
    body('value').isNumeric().withMessage('Value must be a number'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  biQuery: [
    body('query').isString().notEmpty().withMessage('Query is required'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object'),
    body('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Invalid format')
  ],
  biExecution: [
    body('queryId').isString().notEmpty().withMessage('Query ID is required'),
    body('parameters').optional().isObject().withMessage('Parameters must be an object'),
    body('schedule').optional().isObject().withMessage('Schedule must be an object')
  ],
  dataExport: [
    body('dataType').isString().notEmpty().withMessage('Data type is required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('format').isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel')
  ],
  exportSchedule: [
    body('dataType').isString().notEmpty().withMessage('Data type is required'),
    body('schedule').isObject().withMessage('Schedule is required'),
    body('recipients').isArray().withMessage('Recipients must be an array'),
    body('format').isIn(['json', 'csv', 'excel']).withMessage('Format must be json, csv, or excel')
  ],

  // ==================== FINANCE VALIDATION SCHEMAS ====================
  invoiceUpdate: [
    body('invoiceNumber').optional().isString().notEmpty().withMessage('Invoice number is required'),
    body('clientId').optional().isString().notEmpty().withMessage('Client ID is required'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
    body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status')
  ],
  recurringInvoice: [
    body('invoiceNumber').isString().notEmpty().withMessage('Invoice number is required'),
    body('clientId').isString().notEmpty().withMessage('Client ID is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('frequency').isIn(['weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
  ],
  recurringInvoiceUpdate: [
    body('invoiceNumber').optional().isString().notEmpty().withMessage('Invoice number is required'),
    body('clientId').optional().isString().notEmpty().withMessage('Client ID is required'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('frequency').optional().isIn(['weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    body('status').optional().isIn(['active', 'paused', 'cancelled']).withMessage('Invalid status')
  ],
  financeSettings: [
    body('currency').optional().isString().notEmpty().withMessage('Currency is required'),
    body('taxRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
    body('paymentTerms').optional().isInt({ min: 1 }).withMessage('Payment terms must be a positive integer'),
    body('lateFeeRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Late fee rate must be between 0 and 100')
  ],

  // ==================== HR VALIDATION SCHEMAS ====================
  employee: [
    // Handle both flat and nested structures
    body('firstName').optional().isString().notEmpty().withMessage('First name is required'),
    body('lastName').optional().isString().notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('department').optional().isString().notEmpty().withMessage('Department is required'),
    body('position').optional().isString().notEmpty().withMessage('Position is required'),
    body('hireDate').optional().isISO8601().withMessage('Hire date must be a valid ISO date'),
    body('salary').optional().isNumeric().withMessage('Salary must be a number'),
    
    // Nested structure validation (for backward compatibility)
    body('basicInfo.firstName').optional().isString().notEmpty().withMessage('First name is required'),
    body('basicInfo.lastName').optional().isString().notEmpty().withMessage('Last name is required'),
    body('basicInfo.email').optional().isEmail().withMessage('Valid email is required'),
    body('basicInfo.phone').optional().isString().withMessage('Phone must be a string'),
    body('employment.department').optional().isString().notEmpty().withMessage('Department is required'),
    body('employment.position').optional().isString().notEmpty().withMessage('Position is required'),
    body('employment.hireDate').optional().isISO8601().withMessage('Hire date must be a valid ISO date'),
    body('compensation.salary').optional().isNumeric().withMessage('Salary must be a number'),
    
    // Custom validation to ensure at least one structure is provided
    (req, res, next) => {
      const hasFlatStructure = req.body.firstName || req.body.lastName || req.body.email;
      const hasNestedStructure = req.body.basicInfo || req.body.employment || req.body.compensation;
      
      if (!hasFlatStructure && !hasNestedStructure) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Employee data is required',
          details: [{ msg: 'Either flat structure or nested structure must be provided' }]
        });
      }
      next();
    }
  ],
  employeeUpdate: [
    // Handle both flat and nested structures
    body('firstName').optional().isString().notEmpty().withMessage('First name is required'),
    body('lastName').optional().isString().notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('department').optional().isString().notEmpty().withMessage('Department is required'),
    body('position').optional().isString().notEmpty().withMessage('Position is required'),
    body('hireDate').optional().isISO8601().withMessage('Hire date must be a valid ISO date'),
    body('salary').optional().isNumeric().withMessage('Salary must be a number'),
    body('status').optional().isIn(['active', 'inactive', 'terminated', 'on_leave']).withMessage('Invalid status'),
    
    // Nested structure validation (for backward compatibility)
    body('basicInfo.firstName').optional().isString().notEmpty().withMessage('First name is required'),
    body('basicInfo.lastName').optional().isString().notEmpty().withMessage('Last name is required'),
    body('basicInfo.email').optional().isEmail().withMessage('Valid email is required'),
    body('basicInfo.phone').optional().isString().withMessage('Phone must be a string'),
    body('employment.department').optional().isString().notEmpty().withMessage('Department is required'),
    body('employment.position').optional().isString().notEmpty().withMessage('Position is required'),
    body('employment.hireDate').optional().isISO8601().withMessage('Hire date must be a valid ISO date'),
    body('employment.status').optional().isIn(['active', 'inactive', 'terminated', 'on_leave']).withMessage('Invalid status'),
    body('compensation.salary').optional().isNumeric().withMessage('Salary must be a number')
  ],
  leaveRequest: [
    body('employeeId').isString().notEmpty().withMessage('Employee ID is required'),
    body('leaveType').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'other']).withMessage('Invalid leave type'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    body('reason').isString().notEmpty().withMessage('Reason is required')
  ],
  performanceReview: [
    body('employeeId').isString().notEmpty().withMessage('Employee ID is required'),
    body('reviewerId').isString().notEmpty().withMessage('Reviewer ID is required'),
    body('reviewDate').isISO8601().withMessage('Review date must be a valid ISO date'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comments').isString().notEmpty().withMessage('Comments are required')
  ],

  // Additional HR validation schemas
  department: [
    body('name').isString().notEmpty().withMessage('Department name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('managerId').optional().isString().withMessage('Manager ID must be a string'),
    body('budget').optional().isNumeric().withMessage('Budget must be a number')
  ],
  departmentUpdate: [
    body('name').optional().isString().notEmpty().withMessage('Department name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('managerId').optional().isString().withMessage('Manager ID must be a string'),
    body('budget').optional().isNumeric().withMessage('Budget must be a number'),
    body('status').optional().isIn(['active', 'inactive', 'archived']).withMessage('Invalid status')
  ],
  jobPosting: [
    body('title').isString().notEmpty().withMessage('Job title is required'),
    body('department').isString().notEmpty().withMessage('Department is required'),
    body('description').isString().notEmpty().withMessage('Job description is required'),
    body('requirements').isArray().withMessage('Requirements must be an array'),
    body('salaryRange.min').isNumeric().withMessage('Minimum salary must be a number'),
    body('salaryRange.max').isNumeric().withMessage('Maximum salary must be a number'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('type').optional().isIn(['full_time', 'part_time', 'contract', 'internship']).withMessage('Invalid job type')
  ],
  jobPostingUpdate: [
    body('title').optional().isString().notEmpty().withMessage('Job title is required'),
    body('department').optional().isString().notEmpty().withMessage('Department is required'),
    body('description').optional().isString().notEmpty().withMessage('Job description is required'),
    body('requirements').optional().isArray().withMessage('Requirements must be an array'),
    body('salaryRange.min').optional().isNumeric().withMessage('Minimum salary must be a number'),
    body('salaryRange.max').optional().isNumeric().withMessage('Maximum salary must be a number'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('type').optional().isIn(['full_time', 'part_time', 'contract', 'internship']).withMessage('Invalid job type'),
    body('status').optional().isIn(['draft', 'published', 'closed', 'archived']).withMessage('Invalid status')
  ],
  candidate: [
    body('firstName').isString().notEmpty().withMessage('First name is required'),
    body('lastName').isString().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('resume').optional().isString().withMessage('Resume must be a string'),
    body('coverLetter').optional().isString().withMessage('Cover letter must be a string'),
    body('source').optional().isString().withMessage('Source must be a string')
  ],
  candidateUpdate: [
    body('firstName').optional().isString().notEmpty().withMessage('First name is required'),
    body('lastName').optional().isString().notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('resume').optional().isString().withMessage('Resume must be a string'),
    body('coverLetter').optional().isString().withMessage('Cover letter must be a string'),
    body('source').optional().isString().withMessage('Source must be a string'),
    body('status').optional().isIn(['new', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected']).withMessage('Invalid status')
  ],
  application: [
    body('jobPostingId').isString().notEmpty().withMessage('Job posting ID is required'),
    body('resume').optional().isString().withMessage('Resume must be a string'),
    body('coverLetter').optional().isString().withMessage('Cover letter must be a string'),
    body('expectedSalary').optional().isNumeric().withMessage('Expected salary must be a number'),
    body('availability').optional().isISO8601().withMessage('Availability must be a valid ISO date')
  ],
  interview: [
    body('interviewerId').isString().notEmpty().withMessage('Interviewer ID is required'),
    body('scheduledDate').isISO8601().withMessage('Scheduled date must be a valid ISO date'),
    body('type').optional().isIn(['phone', 'video', 'in_person', 'technical', 'final']).withMessage('Invalid interview type'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],

  // ==================== CRM VALIDATION SCHEMAS ====================
  customer: [
    body('name').isString().notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('company').optional().isString().withMessage('Company must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'prospect', 'lead']).withMessage('Invalid status')
  ],
  customerUpdate: [
    body('name').optional().isString().notEmpty().withMessage('Customer name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('company').optional().isString().withMessage('Company must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'prospect', 'lead']).withMessage('Invalid status')
  ],
  lead: [
    body('name').isString().notEmpty().withMessage('Lead name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('company').optional().isString().withMessage('Company must be a string'),
    body('source').optional().isString().withMessage('Source must be a string'),
    body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).withMessage('Invalid status')
  ],
  deal: [
    body('title').isString().notEmpty().withMessage('Deal title is required'),
    body('customerId').isString().notEmpty().withMessage('Customer ID is required'),
    body('value').isNumeric().withMessage('Deal value must be a number'),
    body('stage').isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
    body('expectedCloseDate').isISO8601().withMessage('Expected close date must be a valid ISO date')
  ],

  // Additional CRM validation schemas
  interaction: [
    body('type').isIn(['call', 'email', 'meeting', 'visit', 'other']).withMessage('Invalid interaction type'),
    body('subject').isString().notEmpty().withMessage('Subject is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO date'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('outcome').optional().isString().withMessage('Outcome must be a string')
  ],
  interactionUpdate: [
    body('type').optional().isIn(['call', 'email', 'meeting', 'visit', 'other']).withMessage('Invalid interaction type'),
    body('subject').optional().isString().notEmpty().withMessage('Subject is required'),
    body('description').optional().isString().notEmpty().withMessage('Description is required'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('outcome').optional().isString().withMessage('Outcome must be a string')
  ],
  note: [
    body('title').isString().notEmpty().withMessage('Note title is required'),
    body('content').isString().notEmpty().withMessage('Note content is required'),
    body('type').optional().isIn(['general', 'follow_up', 'important', 'private']).withMessage('Invalid note type'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  noteUpdate: [
    body('title').optional().isString().notEmpty().withMessage('Note title is required'),
    body('content').optional().isString().notEmpty().withMessage('Note content is required'),
    body('type').optional().isIn(['general', 'follow_up', 'important', 'private']).withMessage('Invalid note type'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  document: [
    body('name').isString().notEmpty().withMessage('Document name is required'),
    body('type').isIn(['contract', 'proposal', 'invoice', 'receipt', 'other']).withMessage('Invalid document type'),
    body('fileUrl').isString().notEmpty().withMessage('File URL is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
  ],
  opportunity: [
    body('title').isString().notEmpty().withMessage('Opportunity title is required'),
    body('customerId').isString().notEmpty().withMessage('Customer ID is required'),
    body('value').isNumeric().withMessage('Opportunity value must be a number'),
    body('stage').isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
    body('expectedCloseDate').isISO8601().withMessage('Expected close date must be a valid ISO date'),
    body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100')
  ],
  opportunityUpdate: [
    body('title').optional().isString().notEmpty().withMessage('Opportunity title is required'),
    body('customerId').optional().isString().notEmpty().withMessage('Customer ID is required'),
    body('value').optional().isNumeric().withMessage('Opportunity value must be a number'),
    body('stage').optional().isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
    body('expectedCloseDate').optional().isISO8601().withMessage('Expected close date must be a valid ISO date'),
    body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100')
  ],
  leadUpdate: [
    body('name').optional().isString().notEmpty().withMessage('Lead name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('company').optional().isString().withMessage('Company must be a string'),
    body('source').optional().isString().withMessage('Source must be a string'),
    body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).withMessage('Invalid status')
  ],
  leadConversion: [
    body('customerData').isObject().withMessage('Customer data is required'),
    body('opportunityData').optional().isObject().withMessage('Opportunity data must be an object'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  crmSettings: [
    body('leadScoring').optional().isObject().withMessage('Lead scoring must be an object'),
    body('salesStages').optional().isArray().withMessage('Sales stages must be an array'),
    body('followUpReminders').optional().isObject().withMessage('Follow-up reminders must be an object'),
    body('emailTemplates').optional().isObject().withMessage('Email templates must be an object')
  ],

  // ==================== PROJECT MANAGEMENT VALIDATION SCHEMAS ====================
  project: [
    body('name').isString().notEmpty().withMessage('Project name is required'),
    body('description').isString().notEmpty().withMessage('Project description is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    body('status').optional().isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
  ],
  projectUpdate: [
    body('name').optional().isString().notEmpty().withMessage('Project name is required'),
    body('description').optional().isString().notEmpty().withMessage('Project description is required'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    body('status').optional().isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
  ],
  task: [
    body('title').isString().notEmpty().withMessage('Task title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('projectId').isString().notEmpty().withMessage('Project ID is required'),
    body('assignedTo').optional().isString().withMessage('Assigned to must be a string'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('status').optional().isIn(['todo', 'in_progress', 'review', 'completed']).withMessage('Invalid status')
  ],
  milestone: [
    body('title').isString().notEmpty().withMessage('Milestone title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('projectId').isString().notEmpty().withMessage('Project ID is required'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid ISO date'),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'overdue']).withMessage('Invalid status')
  ],

  // Additional Project Management validation schemas
  taskUpdate: [
    body('title').optional().isString().notEmpty().withMessage('Task title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('projectId').optional().isString().notEmpty().withMessage('Project ID is required'),
    body('assignedTo').optional().isString().withMessage('Assigned to must be a string'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('status').optional().isIn(['todo', 'in_progress', 'review', 'completed']).withMessage('Invalid status')
  ],
  milestoneUpdate: [
    body('title').optional().isString().notEmpty().withMessage('Milestone title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('projectId').optional().isString().notEmpty().withMessage('Project ID is required'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'overdue']).withMessage('Invalid status')
  ],
  risk: [
    body('title').isString().notEmpty().withMessage('Risk title is required'),
    body('description').isString().notEmpty().withMessage('Risk description is required'),
    body('probability').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid probability level'),
    body('impact').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid impact level'),
    body('mitigation').optional().isString().withMessage('Mitigation must be a string'),
    body('owner').optional().isString().withMessage('Owner must be a string')
  ],
  riskUpdate: [
    body('title').optional().isString().notEmpty().withMessage('Risk title is required'),
    body('description').optional().isString().notEmpty().withMessage('Risk description is required'),
    body('probability').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid probability level'),
    body('impact').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid impact level'),
    body('mitigation').optional().isString().withMessage('Mitigation must be a string'),
    body('owner').optional().isString().withMessage('Owner must be a string'),
    body('status').optional().isIn(['open', 'mitigated', 'closed', 'occurred']).withMessage('Invalid status')
  ],
  teamMember: [
    body('userId').isString().notEmpty().withMessage('User ID is required'),
    body('role').isIn(['project_manager', 'team_lead', 'team_member', 'stakeholder']).withMessage('Invalid role'),
    body('responsibilities').optional().isArray().withMessage('Responsibilities must be an array'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
  ],
  projectSettings: [
    body('defaultRoles').optional().isArray().withMessage('Default roles must be an array'),
    body('workflowStages').optional().isArray().withMessage('Workflow stages must be an array'),
    body('notificationSettings').optional().isObject().withMessage('Notification settings must be an object'),
    body('reportingSettings').optional().isObject().withMessage('Reporting settings must be an object')
  ],

  // ==================== PARTNER MANAGEMENT VALIDATION SCHEMAS ====================
  partner: [
    body('name').isString().notEmpty().withMessage('Partner name is required'),
    body('type').isIn(['repair_center', 'parts_shop', 'towing_service', 'insurance_provider', 'fleet_operator', 'other']).withMessage('Invalid partner type'),
    body('contact.primaryContact.name').isString().notEmpty().withMessage('Primary contact name is required'),
    body('contact.primaryContact.email').isEmail().withMessage('Valid primary contact email is required'),
    body('contact.primaryContact.phone').isString().notEmpty().withMessage('Primary contact phone is required'),
    body('business.legalName').isString().notEmpty().withMessage('Legal name is required')
  ],
  partnerUpdate: [
    body('name').optional().isString().notEmpty().withMessage('Partner name is required'),
    body('type').optional().isIn(['repair_center', 'parts_shop', 'towing_service', 'insurance_provider', 'fleet_operator', 'other']).withMessage('Invalid partner type'),
    body('contact.primaryContact.name').optional().isString().notEmpty().withMessage('Primary contact name is required'),
    body('contact.primaryContact.email').optional().isEmail().withMessage('Valid primary contact email is required'),
    body('contact.primaryContact.phone').optional().isString().notEmpty().withMessage('Primary contact phone is required'),
    body('business.legalName').optional().isString().notEmpty().withMessage('Legal name is required'),
    body('status').optional().isIn(['pending', 'active', 'suspended', 'terminated', 'inactive']).withMessage('Invalid status')
  ],

  // ==================== COMMUNICATION VALIDATION SCHEMAS ====================
  message: [
    body('recipients').isArray().withMessage('Recipients must be an array'),
    body('subject').isString().notEmpty().withMessage('Subject is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('type').optional().isIn(['email', 'sms', 'notification']).withMessage('Invalid message type'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
  ],
  announcement: [
    body('title').isString().notEmpty().withMessage('Announcement title is required'),
    body('content').isString().notEmpty().withMessage('Announcement content is required'),
    body('audience').isArray().withMessage('Audience must be an array'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid ISO date')
  ],
  meeting: [
    body('title').isString().notEmpty().withMessage('Meeting title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('participants').isArray().withMessage('Participants must be an array'),
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO date'),
    body('endTime').isISO8601().withMessage('End time must be a valid ISO date'),
    body('location').optional().isString().withMessage('Location must be a string')
  ],

  // Additional Communication validation schemas
  communication: [
    body('type').isIn(['announcement', 'notification', 'update', 'alert']).withMessage('Invalid communication type'),
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('audience').isArray().withMessage('Audience must be an array'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('scheduledDate').optional().isISO8601().withMessage('Scheduled date must be a valid ISO date')
  ],
  communicationUpdate: [
    body('type').optional().isIn(['announcement', 'notification', 'update', 'alert']).withMessage('Invalid communication type'),
    body('title').optional().isString().notEmpty().withMessage('Title is required'),
    body('content').optional().isString().notEmpty().withMessage('Content is required'),
    body('audience').optional().isArray().withMessage('Audience must be an array'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('scheduledDate').optional().isISO8601().withMessage('Scheduled date must be a valid ISO date'),
    body('status').optional().isIn(['draft', 'scheduled', 'sent', 'cancelled']).withMessage('Invalid status')
  ],
  poll: [
    body('question').isString().notEmpty().withMessage('Question is required'),
    body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
    body('audience').isArray().withMessage('Audience must be an array'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    body('allowMultipleVotes').optional().isBoolean().withMessage('Allow multiple votes must be a boolean')
  ],
  vote: [
    body('optionId').isString().notEmpty().withMessage('Option ID is required'),
    body('comment').optional().isString().withMessage('Comment must be a string')
  ],
  event: [
    body('title').isString().notEmpty().withMessage('Event title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('audience').isArray().withMessage('Audience must be an array'),
    body('type').optional().isIn(['meeting', 'training', 'celebration', 'workshop', 'other']).withMessage('Invalid event type')
  ],
  rsvp: [
    body('response').isIn(['yes', 'no', 'maybe']).withMessage('Response must be yes, no, or maybe'),
    body('comment').optional().isString().withMessage('Comment must be a string')
  ],

  // ==================== LEGAL VALIDATION SCHEMAS ====================
  legalDocument: [
    body('title').isString().notEmpty().withMessage('Document title is required'),
    body('type').isIn(['contract', 'policy', 'agreement', 'compliance', 'other']).withMessage('Invalid document type'),
    body('content').isString().notEmpty().withMessage('Document content is required'),
    body('parties').isArray().withMessage('Parties must be an array'),
    body('effectiveDate').isISO8601().withMessage('Effective date must be a valid ISO date'),
    body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid ISO date')
  ],
  legalDocumentUpdate: [
    body('title').optional().isString().notEmpty().withMessage('Document title is required'),
    body('type').optional().isIn(['contract', 'policy', 'agreement', 'compliance', 'other']).withMessage('Invalid document type'),
    body('content').optional().isString().notEmpty().withMessage('Document content is required'),
    body('parties').optional().isArray().withMessage('Parties must be an array'),
    body('effectiveDate').optional().isISO8601().withMessage('Effective date must be a valid ISO date'),
    body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid ISO date'),
    body('status').optional().isIn(['draft', 'pending_review', 'active', 'expired', 'terminated', 'archived']).withMessage('Invalid status')
  ],

  // Additional Legal validation schemas
  legal: [
    body('type').isIn(['contract', 'policy', 'agreement', 'compliance', 'case', 'other']).withMessage('Invalid legal type'),
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('assignedTo').optional().isString().withMessage('Assigned to must be a string')
  ],
  legalUpdate: [
    body('type').optional().isIn(['contract', 'policy', 'agreement', 'compliance', 'case', 'other']).withMessage('Invalid legal type'),
    body('title').optional().isString().notEmpty().withMessage('Title is required'),
    body('description').optional().isString().notEmpty().withMessage('Description is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('assignedTo').optional().isString().withMessage('Assigned to must be a string'),
    body('status').optional().isIn(['draft', 'in_progress', 'review', 'approved', 'rejected', 'closed']).withMessage('Invalid status')
  ],
  contract: [
    body('title').isString().notEmpty().withMessage('Contract title is required'),
    body('parties').isArray({ min: 2 }).withMessage('At least 2 parties are required'),
    body('terms').isString().notEmpty().withMessage('Contract terms are required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    body('value').optional().isNumeric().withMessage('Contract value must be a number'),
    body('type').optional().isIn(['service', 'employment', 'partnership', 'purchase', 'other']).withMessage('Invalid contract type')
  ],
  contractSignature: [
    body('signature').isString().notEmpty().withMessage('Signature is required'),
    body('signatureDate').isISO8601().withMessage('Signature date must be a valid ISO date'),
    body('witness').optional().isString().withMessage('Witness must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  policy: [
    body('title').isString().notEmpty().withMessage('Policy title is required'),
    body('content').isString().notEmpty().withMessage('Policy content is required'),
    body('category').isIn(['hr', 'finance', 'operations', 'security', 'compliance', 'other']).withMessage('Invalid policy category'),
    body('effectiveDate').isISO8601().withMessage('Effective date must be a valid ISO date'),
    body('reviewDate').optional().isISO8601().withMessage('Review date must be a valid ISO date'),
    body('version').optional().isString().withMessage('Version must be a string')
  ],
  compliance: [
    body('title').isString().notEmpty().withMessage('Compliance title is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('regulation').isString().notEmpty().withMessage('Regulation is required'),
    body('deadline').isISO8601().withMessage('Deadline must be a valid ISO date'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('assignedTo').optional().isString().withMessage('Assigned to must be a string')
  ],
  audit: [
    body('auditType').isIn(['internal', 'external', 'regulatory', 'compliance']).withMessage('Invalid audit type'),
    body('scope').isString().notEmpty().withMessage('Audit scope is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
    body('auditor').isString().notEmpty().withMessage('Auditor is required'),
    body('findings').optional().isArray().withMessage('Findings must be an array')
  ],
  case: [
    body('title').isString().notEmpty().withMessage('Case title is required'),
    body('description').isString().notEmpty().withMessage('Case description is required'),
    body('type').isIn(['litigation', 'arbitration', 'mediation', 'regulatory', 'other']).withMessage('Invalid case type'),
    body('parties').isArray({ min: 1 }).withMessage('At least one party is required'),
    body('filingDate').optional().isISO8601().withMessage('Filing date must be a valid ISO date'),
    body('court').optional().isString().withMessage('Court must be a string'),
    body('caseNumber').optional().isString().withMessage('Case number must be a string')
  ],
  caseStatus: [
    body('status').isIn(['open', 'pending', 'in_progress', 'settled', 'closed', 'appealed']).withMessage('Invalid case status'),
    body('update').isString().notEmpty().withMessage('Status update is required'),
    body('date').isISO8601().withMessage('Status date must be a valid ISO date'),
    body('nextAction').optional().isString().withMessage('Next action must be a string'),
    body('nextActionDate').optional().isISO8601().withMessage('Next action date must be a valid ISO date')
  ],
  riskAssessment: [
    body('title').isString().notEmpty().withMessage('Risk assessment title is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('riskType').isIn(['legal', 'compliance', 'operational', 'financial', 'reputational']).withMessage('Invalid risk type'),
    body('probability').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid probability level'),
    body('impact').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid impact level'),
    body('mitigation').optional().isString().withMessage('Mitigation must be a string'),
    body('owner').optional().isString().withMessage('Owner must be a string')
  ],
  riskLevel: [
    body('riskLevel').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
    body('reason').isString().notEmpty().withMessage('Reason for risk level change is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO date'),
    body('reviewer').isString().notEmpty().withMessage('Reviewer is required')
  ]
};

// Validation middleware
const validate = (schemaName) => {
  const schema = validationSchemas[schemaName];
    if (!schema) {
    throw new Error(`Validation schema '${schemaName}' not found`);
  }
  
  return [
    ...schema,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
          error: 'VALIDATION_ERROR',
        message: 'Validation failed',
          details: errors.array()
      });
    }
    next();
    }
  ];
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          // Remove HTML tags and trim whitespace
          req.body[key] = req.body[key].replace(/<[^>]*>/g, '').trim();
        }
      });
    }
    
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].replace(/<[^>]*>/g, '').trim();
        }
      });
    }

    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = req.params[key].replace(/<[^>]*>/g, '').trim();
        }
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validate,
  sanitizeInput,
  validationSchemas
};
