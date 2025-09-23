# Clutch Admin - Complete System Documentation

## Overview
Clutch Admin is a comprehensive Next.js-based administrative dashboard for the Clutch platform. It provides a unified interface for managing all aspects of the Clutch ecosystem including HR, fleet management, finance, analytics, and more.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Pages Documentation](#pages-documentation)
5. [Components Documentation](#components-documentation)
6. [Widgets Documentation](#widgets-documentation)
7. [Contexts & Hooks](#contexts--hooks)
8. [API Integration](#api-integration)
9. [Internationalization](#internationalization)
10. [Authentication & Authorization](#authentication--authorization)
11. [Design System](#design-system)
12. [Deployment](#deployment)

## Architecture Overview

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Authentication**: JWT-based with role-based access control
- **Real-time**: WebSocket integration for live updates

### Key Features
- **Multi-tenant Dashboard**: Supports multiple organizations
- **Role-based Access Control**: Granular permissions system
- **Real-time Updates**: Live data synchronization
- **Internationalization**: Full Arabic/English support with RTL
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching capability

## Technology Stack

### Core Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **TypeScript**: Static type checking

### External Services
- **MongoDB**: Primary database
- **Redis**: Caching and session storage
- **WebSocket**: Real-time communication
- **Email Services**: SendGrid integration

## Project Structure

```
clutch-admin/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard pages
│   │   ├── login/             # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── widgets/          # Dashboard widgets
│   │   └── layout/           # Layout components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utility libraries
│   └── messages/             # Internationalization files
├── public/                   # Static assets
├── design.json              # Design system configuration
└── package.json             # Dependencies and scripts
```

## Pages Documentation

### Dashboard Pages
Located in `src/app/(dashboard)/`

#### Core Pages
- **dashboard/page.tsx**: Main dashboard with overview widgets
- **hr/page.tsx**: Human resources management with careers system
- **fleet/page.tsx**: Fleet management and monitoring
- **finance/page.tsx**: Financial management and reporting
- **analytics/page.tsx**: Business intelligence and analytics
- **reports/page.tsx**: Report generation and management

#### Management Pages
- **users/page.tsx**: User management and administration
- **assets/page.tsx**: Asset tracking and management
- **vendors/page.tsx**: Vendor relationship management
- **projects/page.tsx**: Project management and tracking

#### System Pages
- **settings/page.tsx**: System configuration and settings
- **monitoring/page.tsx**: System health and performance monitoring
- **audit-trail/page.tsx**: Audit logging and compliance
- **system-health/page.tsx**: Infrastructure health monitoring

#### Specialized Pages
- **ai-ml/page.tsx**: AI/ML model management
- **crm/page.tsx**: Customer relationship management
- **cms/page.tsx**: Content management system
- **marketing/page.tsx**: Marketing campaign management
- **support/page.tsx**: Customer support management
- **legal/page.tsx**: Legal compliance and documentation

### Authentication Pages
- **login/page.tsx**: User authentication
- **setup-password/page.tsx**: Password setup for new users

## Components Documentation

### UI Components (`src/components/ui/`)
Base components built on Radix UI primitives:

- **Button**: Customizable button component
- **Card**: Container component for content sections
- **Input**: Form input component
- **Select**: Dropdown selection component
- **Table**: Data table component
- **Modal**: Overlay dialog component
- **Badge**: Status indicator component
- **Toast**: Notification component

### Layout Components (`src/components/layout/`)
- **main-layout.tsx**: Main application layout wrapper
- **header.tsx**: Top navigation header
- **sidebar.tsx**: Left navigation sidebar

### Specialized Components
- **job-posting-overlay.tsx**: Job posting creation/editing modal
- **recruitment-tab.tsx**: Recruitment management interface
- **language-switcher.tsx**: Language selection component
- **theme-toggle.tsx**: Dark/light mode toggle

## Widgets Documentation

### Analytics Widgets (`src/components/widgets/`)
- **revenue-widget.tsx**: Revenue tracking and forecasting
- **user-activity-widget.tsx**: User engagement metrics
- **system-performance-widget.tsx**: System health indicators
- **error-distribution.tsx**: Error tracking and analysis
- **incident-cost.tsx**: Incident impact assessment
- **sla-compliance.tsx**: Service level agreement monitoring

### Business Intelligence Widgets
- **portfolio-risk-dashboard.tsx**: Risk assessment dashboard
- **predictive-kpi-alerts.tsx**: KPI forecasting and alerts
- **root-cause-analytics.tsx**: Problem analysis tools
- **confidence-intervals.tsx**: Statistical analysis widgets

### Operations Widgets
- **operational-sla-dashboard.tsx**: SLA monitoring
- **mission-critical-task-escalator.tsx**: Task prioritization
- **auto-healing-playbooks.tsx**: Automated recovery systems
- **live-ops-map.tsx**: Real-time operations visualization

### Security Widgets
- **global-security-center.tsx**: Security monitoring hub
- **identity-threat-detection.tsx**: Threat detection systems
- **zero-trust-audit-card.tsx**: Security compliance monitoring
- **fraud-escalation-workflow.tsx**: Fraud detection and response

### AI/ML Widgets
- **ai-recommendation-feed.tsx**: AI-powered recommendations
- **ai-powered-anomaly-detection.tsx**: Anomaly detection systems
- **model-governance-panel.tsx**: ML model management
- **business-value-attribution.tsx**: AI value measurement

## Contexts & Hooks

### React Contexts (`src/contexts/`)
- **auth-context.tsx**: Authentication state management
- **language-context.tsx**: Internationalization state
- **realtime-context.tsx**: WebSocket connection management

### Custom Hooks (`src/hooks/`)
- **use-translations.ts**: Translation hook for i18n

## API Integration

### API Service (`src/lib/api.ts`)
Centralized API service for backend communication:
- Authentication endpoints
- CRUD operations for all entities
- Real-time data synchronization
- Error handling and retry logic

### Key API Methods
- **Authentication**: Login, logout, token refresh
- **User Management**: CRUD operations for users
- **HR Operations**: Employee and recruitment management
- **Fleet Management**: Vehicle and asset operations
- **Analytics**: Data aggregation and reporting
- **System Operations**: Health checks and monitoring

## Internationalization

### Language Support
- **English**: Primary language
- **Arabic**: Full RTL support with proper text direction

### Translation Files (`src/messages/`)
- **en.json**: English translations
- **ar.json**: Arabic translations

### Implementation
- **next-intl**: Internationalization framework
- **RTL Support**: Automatic text direction switching
- **Dynamic Loading**: Language switching without page reload

## Authentication & Authorization

### Authentication Flow
1. **Login**: JWT token generation
2. **Token Storage**: Secure token management
3. **Route Protection**: Protected route middleware
4. **Session Management**: Automatic token refresh

### Role-Based Access Control
- **Admin**: Full system access
- **Manager**: Department-level access
- **Employee**: Limited access based on role
- **Viewer**: Read-only access

### Permission System
- **Granular Permissions**: Feature-level access control
- **Dynamic Permissions**: Runtime permission checking
- **Audit Trail**: Permission usage logging

## Design System

### Design Tokens (`design.json`)
- **Colors**: Primary, secondary, semantic colors
- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation system
- **Borders**: Border radius and styles
- **Motion**: Animation durations and easing

### Component Standards
- **Consistent Styling**: Design system compliance
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive Design**: Mobile-first approach
- **Theme Support**: Dark/light mode compatibility

## Deployment

### Build Process
```bash
npm run build    # Production build
npm run start    # Production server
npm run dev      # Development server
```

### Environment Variables
- **NEXT_PUBLIC_API_URL**: Backend API URL
- **NEXT_PUBLIC_WS_URL**: WebSocket URL
- **NEXTAUTH_SECRET**: Authentication secret
- **NEXTAUTH_URL**: Application URL

### Production Considerations
- **Static Generation**: Optimized for performance
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Code splitting and optimization
- **Error Monitoring**: Production error tracking

## Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Testing**: Unit and integration tests

### Component Development
- **Reusability**: Generic, reusable components
- **Props Interface**: Clear TypeScript interfaces
- **Documentation**: JSDoc comments for complex components
- **Accessibility**: ARIA labels and keyboard navigation

### Performance Optimization
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Memoization**: React.memo for expensive components
- **Bundle Optimization**: Tree shaking and dead code elimination

## Troubleshooting

### Common Issues
1. **Build Errors**: Check TypeScript types and imports
2. **Runtime Errors**: Verify API endpoints and data flow
3. **Styling Issues**: Ensure Tailwind classes are correct
4. **Authentication**: Check token validity and permissions

### Debug Tools
- **React DevTools**: Component inspection
- **Next.js DevTools**: Performance monitoring
- **Browser DevTools**: Network and console debugging
- **TypeScript**: Compile-time error checking

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request with description

### Code Review Checklist
- [ ] TypeScript types are correct
- [ ] Components are accessible
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] Design system compliance
- [ ] Performance considerations
