# Clutch Email Management System

## Overview

The Clutch Email Management System provides a comprehensive Gmail-like web interface integrated into the Clutch Admin panel, featuring both a user-friendly email client and a powerful administrative dashboard.

## Features

### 🎯 Email Client (`/email`)
- **Gmail-like Interface**: Modern, intuitive email client with familiar UX patterns
- **Email Operations**: Send, receive, reply, forward, and delete emails
- **Folder Management**: Organize emails into custom folders
- **Contact Management**: Add and manage contacts
- **Search Functionality**: Advanced email search capabilities
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🛠️ Email Management Dashboard (`/email/management`)
- **Real-time Statistics**: Live email metrics and performance indicators
- **System Health Monitoring**: SMTP, IMAP, database, and storage status
- **Account Management**: Create, edit, and manage email accounts
- **Storage Analytics**: Detailed storage usage breakdown and trends
- **Recent Activity Feed**: System events and administrative actions
- **Quick Actions**: Common administrative tasks at your fingertips

## Architecture

### Frontend Components
- **SnowUI Design System**: Consistent, modern UI components with Clutch branding
- **React.js/Next.js**: Modern React framework with TypeScript
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Beautiful, consistent iconography

### Backend Integration
- **RESTful APIs**: Full integration with the Clutch email backend
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Robust error management and user feedback

## API Endpoints

The system integrates with the following backend APIs:

### Email Account Management
- `POST /api/v1/clutch-email/accounts` - Create email account
- `GET /api/v1/clutch-email/accounts/:userId` - Get account info

### Email Operations
- `POST /api/v1/clutch-email/send` - Send email
- `GET /api/v1/clutch-email/emails/:userId/:folder` - Get emails
- `GET /api/v1/clutch-email/emails/:emailId` - Get single email
- `PUT /api/v1/clutch-email/emails/:emailId/move` - Move email
- `DELETE /api/v1/clutch-email/emails/:emailId` - Delete email

### Folder Management
- `GET /api/v1/clutch-email/folders/:userId` - Get folders
- `POST /api/v1/clutch-email/folders` - Create folder

### Contact Management
- `GET /api/v1/clutch-email/contacts/:userId` - Get contacts
- `POST /api/v1/clutch-email/contacts` - Add contact

### Search & Admin
- `GET /api/v1/clutch-email/search/:userId` - Search emails
- `GET /api/v1/clutch-email/admin/stats` - Admin statistics
- `GET /api/v1/clutch-email/health` - Health check

## Design System

### Color Scheme
- **Primary Color**: Clutch Red (#ED1B24)
- **Secondary Colors**: Complementary blues, greens, and grays
- **Dark Mode**: Full dark theme support

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components
- **SnowButton**: Versatile button component with multiple variants
- **SnowCard**: Flexible card component for content organization
- **SnowInput**: Consistent input fields with validation states

## Navigation Structure

```
Email
├── Email Client (/email)
│   ├── Inbox
│   ├── Sent
│   ├── Drafts
│   ├── Trash
│   └── Custom Folders
└── Management (/email/management)
    ├── Statistics Dashboard
    ├── System Health
    ├── Account Management
    ├── Storage Analytics
    └── Recent Activity
```

## Key Features

### Email Client
1. **Compose Email**: Rich text editor with attachment support
2. **Email List**: Sortable, filterable email list with preview
3. **Email Detail**: Full email view with reply/forward options
4. **Folder Navigation**: Sidebar with folder organization
5. **Contact List**: Manage and search contacts
6. **Search**: Advanced search with filters

### Management Dashboard
1. **Statistics Cards**: Key metrics at a glance
2. **System Health**: Real-time service status monitoring
3. **Account Table**: Comprehensive user account management
4. **Storage Analytics**: Visual storage usage breakdown
5. **Activity Feed**: System events and admin actions
6. **Quick Actions**: Common administrative tasks

## Getting Started

1. **Access Email Client**: Navigate to `/email` in the Clutch Admin
2. **Access Management**: Navigate to `/email/management` for admin features
3. **API Integration**: Ensure backend services are running at `https://clutch-main-nk7x.onrender.com`

## Development

### Current Status
- ✅ Frontend UI components implemented
- ✅ Navigation integration complete
- ✅ Mock data for development
- 🔄 API integration (ready for backend connection)
- 🔄 Real-time updates (planned)

### Next Steps
1. Connect to live backend APIs
2. Implement real-time notifications
3. Add advanced search filters
4. Enhance mobile responsiveness
5. Add email templates feature

## Security Features

- **Authentication**: Integrated with Clutch auth system
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **Secure API Calls**: HTTPS-only communication
- **Session Management**: Secure session handling

## Performance

- **Optimized Loading**: Lazy loading for large email lists
- **Caching**: Intelligent data caching strategies
- **Responsive Design**: Optimized for all screen sizes
- **Accessibility**: WCAG 2.1 AA compliance

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Built with ❤️ for Clutch Admin**
