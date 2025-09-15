# Clutch Admin API Documentation

## Overview

The Clutch Admin application provides a comprehensive admin dashboard with real-time capabilities, authentication, and full CRUD operations across multiple business domains.

## Architecture

### Core Services

1. **ApiService** (`src/lib/api.ts`) - Core API communication service
2. **ProductionApi** (`src/lib/production-api.ts`) - Production API wrapper
3. **WebSocketService** (`src/lib/websocket.ts`) - Real-time communication
4. **AuthContext** (`src/contexts/auth-context.tsx`) - Authentication management
5. **RealtimeContext** (`src/contexts/realtime-context.tsx`) - Real-time data management

## Authentication

### Login Flow
```typescript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin"
    }
  }
}
```

### Token Management
- **Access Token**: Short-lived JWT for API requests
- **Refresh Token**: Long-lived token for token renewal
- **Storage**: Both localStorage and sessionStorage for redundancy
- **Auto-refresh**: Automatic token refresh on 401 responses

### Security Features
- CSRF protection with `X-Requested-With` header
- Automatic retry logic for failed requests
- Network error handling with exponential backoff
- Secure token storage and cleanup

## API Endpoints

### Users Management
```typescript
// Get all users
GET /api/v1/users

// Get user by ID
GET /api/v1/users/:id

// Create user
POST /api/v1/users
{
  "name": "User Name",
  "email": "user@example.com",
  "role": "admin"
}

// Update user
PUT /api/v1/users/:id
{
  "name": "Updated Name"
}

// Delete user
DELETE /api/v1/users/:id
```

### Fleet Management
```typescript
// Get all vehicles
GET /api/v1/fleet/vehicles

// Get vehicle by ID
GET /api/v1/fleet/vehicles/:id

// Create vehicle
POST /api/v1/fleet/vehicles
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "licensePlate": "ABC123"
}

// Update vehicle
PUT /api/v1/fleet/vehicles/:id

// Delete vehicle
DELETE /api/v1/fleet/vehicles/:id

// Optimize routes
POST /api/v1/fleet/optimize-routes
```

### Analytics & Reports
```typescript
// Get KPI metrics
GET /api/v1/dashboard/kpis

// Get analytics metrics
GET /api/v1/analytics/metrics

// Get user analytics
GET /api/v1/analytics/users?period=30d

// Get revenue analytics
GET /api/v1/analytics/revenue?period=30d

// Get fleet analytics
GET /api/v1/analytics/fleet?period=30d

// Get engagement analytics
GET /api/v1/analytics/engagement?period=30d

// Generate report
POST /api/v1/reports/generate
{
  "name": "Monthly Report",
  "type": "custom",
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}

// Export data
POST /api/v1/exports/:type
{
  "format": "csv"
}
```

### System Health
```typescript
// Get system health
GET /api/v1/system-health

// Get API performance metrics
GET /api/v1/system-health/api-performance

// Get audit logs
GET /api/v1/audit-trail
```

### Feature Flags
```typescript
// Get feature flags
GET /api/v1/feature-flags

// Update feature flag
PATCH /api/v1/feature-flags/:id
{
  "enabled": true
}

// Get A/B tests
GET /api/v1/feature-flags/ab-tests

// Get rollouts
GET /api/v1/feature-flags/rollouts
```

### Integrations
```typescript
// Get integrations
GET /api/v1/integrations

// Get integration templates
GET /api/v1/integrations?type=templates
```

## Real-time Features

### WebSocket Connection
```typescript
// WebSocket URL
wss://clutch-main-nk7x.onrender.com/ws

// Authentication message
{
  "type": "auth",
  "payload": {
    "token": "jwt-token"
  }
}

// Message types
{
  "type": "notification",
  "payload": {
    "message": "New notification",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}

{
  "type": "kpi_update",
  "payload": {
    "metrics": [...]
  }
}

{
  "type": "fleet_update",
  "payload": {
    "vehicles": [...]
  }
}
```

### Real-time Subscriptions
- **Notifications**: Real-time notification delivery
- **KPI Metrics**: Live dashboard updates
- **Fleet Updates**: Vehicle status changes
- **System Health**: Performance monitoring
- **User Activities**: Audit trail updates

## Error Handling

### Standard Error Response
```typescript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error"
  }
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error
- **502**: Bad Gateway
- **503**: Service Unavailable

### Retry Logic
- **Network Errors**: 3 retries with exponential backoff
- **401 Errors**: Automatic token refresh and retry
- **5xx Errors**: 3 retries with exponential backoff
- **Rate Limiting**: Respects Retry-After headers

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Fleet Vehicle
```typescript
interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'inactive';
  location?: {
    lat: number;
    lng: number;
  };
  driver?: string;
  createdAt: string;
  updatedAt: string;
}
```

### KPI Metric
```typescript
interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  trend: 'increase' | 'decrease' | 'stable';
  change: number;
  period: string;
  category: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  userId?: string;
  createdAt: string;
}
```

## Usage Examples

### Basic API Call
```typescript
import { productionApi } from '@/lib/production-api';

// Get users
const users = await productionApi.getUsers();

// Create user
const newUser = await productionApi.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
});
```

### Real-time Updates
```typescript
import { useRealtime } from '@/contexts/realtime-context';

function Dashboard() {
  const { subscribe, isConnected } = useRealtime();
  
  useEffect(() => {
    const unsubscribe = subscribe('kpi_update', (metrics) => {
      setMetrics(metrics);
    });
    
    return unsubscribe;
  }, [subscribe]);
  
  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {/* Dashboard content */}
    </div>
  );
}
```

### Authentication
```typescript
import { useAuth } from '@/contexts/auth-context';

function LoginForm() {
  const { login, user, isLoading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  if (user) {
    return <div>Welcome, {user.name}!</div>;
  }
  
  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
}
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual function testing
- **Integration Tests**: API service testing
- **Component Tests**: React component testing
- **Mock Data**: Comprehensive mock data for testing

### Test Coverage
- **API Service**: 100% coverage
- **Auth Context**: 100% coverage
- **Core Utilities**: 100% coverage
- **Components**: 80%+ coverage

## Deployment

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://clutch-main-nk7x.onrender.com
NEXT_PUBLIC_WS_URL=wss://clutch-main-nk7x.onrender.com/ws

# Build Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Build Process
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build application
npm run build

# Start production server
npm start
```

### Performance Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Aggressive caching strategies
- **CDN**: Static asset delivery via CDN

## Security Considerations

### Authentication Security
- JWT tokens with short expiration
- Refresh token rotation
- Secure token storage
- CSRF protection

### API Security
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

### Data Protection
- Encryption in transit (HTTPS/WSS)
- Secure headers
- Content Security Policy
- Privacy compliance

## Monitoring & Logging

### Application Monitoring
- Real-time performance metrics
- Error tracking and reporting
- User activity monitoring
- System health checks

### Logging
- Structured logging
- Error logging
- Audit trail
- Performance logging

## Support & Maintenance

### Error Reporting
- Automatic error reporting
- User feedback collection
- Performance monitoring
- System health alerts

### Updates & Maintenance
- Automated testing
- Continuous integration
- Regular security updates
- Performance optimization

---

For more detailed information, please refer to the source code documentation and inline comments.
