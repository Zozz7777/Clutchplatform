# Clutch Admin - Enterprise Platform Management

A comprehensive enterprise platform for managing the entire Clutch automotive ecosystem. Built with Next.js 15, React, and Tailwind CSS.

## 🚀 Features

### Core Modules
- **Dashboard**: Real-time KPIs, monitoring, and quick actions
- **User Management**: B2C customers, B2B enterprise accounts, service providers
- **Fleet Management**: GPS tracking, OBD2 devices, fleet health monitoring
- **CRM**: Customer relationship management and interaction tracking
- **Chat & Messaging**: Real-time communication system
- **AI & ML Dashboard**: Predictive analytics and machine learning features
- **Enterprise B2B**: Multi-tenant management and white-label configuration
- **Finance**: Payment processing, billing, and subscription management
- **Legal**: Contract management and dispute resolution
- **HR**: Human resources and employee management
- **Feature Flags**: A/B testing and geographic rollouts
- **Communication**: Push notifications and support tickets
- **Analytics**: Business intelligence and reporting
- **Mobile App Management**: App operations and crash analytics
- **CMS**: Content management system
- **Marketing**: Campaign management and lead tracking
- **Project Management**: Task and resource management
- **Settings**: Global platform configuration
- **Reporting**: Detailed reports and analytics
- **Integrations**: Third-party API connections
- **Audit Trail**: Complete activity logging
- **API Documentation**: Interactive API docs
- **System Health**: Real-time monitoring
- **API Performance**: Endpoint monitoring and analytics

### User Roles & Permissions
- **Platform Administrators**: Full system access
- **Enterprise Clients**: B2B fleet management access
- **Service Providers**: Service-related tasks
- **Business Analysts**: Analytics and reporting
- **Customer Support**: CRM and communication
- **HR Managers**: Human resources management
- **Finance Officers**: Financial operations
- **Legal Team**: Legal and contract management

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API
- **API Integration**: Hybrid API service (Mock + Real backend)
- **Authentication**: Role-based access control
- **Real-time Updates**: WebSocket connections

## 🎨 Design System

The application follows a comprehensive design system defined in `design.json`:

- **Colors**: OKLCH color space for better color consistency
- **Typography**: Roboto font family
- **Spacing**: Consistent spacing scale
- **Shadows**: Subtle shadow system
- **Border Radius**: Rounded corners (0.625rem)
- **Dark Mode**: Full dark/light theme support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clutch-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [https://admin.yourclutch.com](https://admin.yourclutch.com)

### Demo Login Credentials

The application includes demo accounts for testing different user roles:

- **admin@yourclutch.com** - Platform Administrator (Full access)
- **hr@yourclutch.com** - HR Manager
- **finance@yourclutch.com** - Finance Officer
- **support@yourclutch.com** - Customer Support
- **analyst@yourclutch.com** - Business Analyst

*Note: Any password will work for demo purposes*

## 🏗️ Project Structure

```
clutch-admin/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── login/              # Authentication page
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components
│   │   └── layout/             # Layout components
│   ├── contexts/               # React contexts
│   ├── lib/                    # Utilities and services
│   │   ├── api.ts              # Real API service
│   │   ├── hybrid-api.ts       # Hybrid API service
│   │   ├── mock-api.ts         # Mock API service
│   │   ├── constants.ts        # App constants
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript type definitions
├── public/
│   └── logos/                  # Clutch brand assets
├── design.json                 # Design system configuration
└── tailwind.config.ts          # Tailwind CSS configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=https://clutch-main-nk7x.onrender.com
NEXT_PUBLIC_DOMAIN=yourclutch.com
NEXT_PUBLIC_ADMIN_DOMAIN=admin.yourclutch.com
```

### API Configuration

The application uses a hybrid API approach:

- **Development**: Uses mock data for faster development
- **Production**: Connects to real backend API
- **Fallback**: Automatically falls back to mock data if backend is unavailable

Configure API usage in `src/lib/hybrid-api.ts`:

```typescript
const API_CONFIG = {
  useMock: {
    users: true,        // Use mock data for users
    fleet: true,        // Use mock data for fleet
    systemHealth: false, // Use real API for system health
    // ... other endpoints
  },
  fallbackToMock: true, // Fallback to mock if real API fails
};
```

## 🎯 Key Features

### Real-time Updates
- Live fleet tracking
- Real-time KPI updates
- WebSocket connections for instant data sync

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### Accessibility
- WCAG 2.1 compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

### Performance
- Optimized bundle size
- Lazy loading for routes
- Efficient state management
- Caching strategies

## 🔐 Security

- Role-based access control (RBAC)
- JWT token authentication
- Secure API endpoints
- Input validation and sanitization
- XSS protection

## 📱 Mobile Support

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software owned by Clutch.

## 🆘 Support

For support and questions:
- Email: support@yourclutch.com
- Documentation: [docs.yourclutch.com](https://docs.yourclutch.com)
- Issues: Create an issue in the repository

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t clutch-admin .
docker run -p 3000:3000 clutch-admin
```

### Environment Setup

Ensure the following environment variables are set in production:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_DOMAIN`
- `NEXT_PUBLIC_ADMIN_DOMAIN`

---

**Built with ❤️ by the Clutch Team**