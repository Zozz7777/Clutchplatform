# 🎯 Employee Invitation System - Complete Implementation Plan

## 📋 **Current Status Analysis**

### ✅ **What's Already Working**
- **Backend Employee Management**: Complete CRUD operations in `/shared-backend/routes/employees.js`
- **Authentication System**: Working JWT-based authentication with employee support
- **Frontend HR Interface**: Basic employee management UI in `/clutch-admin/src/app/(dashboard)/hr/page.tsx`
- **Database Structure**: Employee records stored in `users` collection with `isEmployee: true`

### ❌ **What's Missing**
1. **Email Service**: No email sending capability
2. **Invitation System**: No invitation tokens or email templates
3. **Password Setup Flow**: No self-service password creation
4. **Frontend Invitation Form**: No UI to create employee invitations
5. **Invitation Management**: No tracking of invitation status

## 🎯 **Complete Implementation Plan**

### **Phase 1: Backend Email & Invitation System**

#### 1.1 Email Service Setup
- **File**: `/shared-backend/services/email-service.js`
- **Features**:
  - SMTP configuration (Gmail, SendGrid, or similar)
  - Email templates for invitations
  - Error handling and retry logic
  - Environment variable configuration

#### 1.2 Invitation System
- **File**: `/shared-backend/routes/employee-invitations.js`
- **Endpoints**:
  - `POST /api/v1/employees/invite` - Send employee invitation
  - `GET /api/v1/employees/invitations` - List pending invitations
  - `POST /api/v1/employees/accept-invitation` - Accept invitation and set password
  - `DELETE /api/v1/employees/invitations/:id` - Cancel invitation

#### 1.3 Database Schema Updates
- **Collection**: `employee_invitations`
- **Fields**:
  ```javascript
  {
    _id: ObjectId,
    email: String,
    name: String,
    role: String,
    department: String,
    position: String,
    permissions: Array,
    invitationToken: String,
    invitedBy: ObjectId,
    status: 'pending' | 'accepted' | 'expired' | 'cancelled',
    expiresAt: Date,
    createdAt: Date,
    acceptedAt: Date
  }
  ```

### **Phase 2: Frontend Invitation Interface**

#### 2.1 Employee Invitation Form
- **File**: `/clutch-admin/src/components/employee-invitation-form.tsx`
- **Features**:
  - Form fields: name, email, role, department, position, permissions
  - Role-based permission selection
  - Email validation
  - Success/error handling

#### 2.2 Invitation Management
- **File**: `/clutch-admin/src/app/(dashboard)/hr/invitations/page.tsx`
- **Features**:
  - List pending invitations
  - Resend invitations
  - Cancel invitations
  - Track invitation status

#### 2.3 Password Setup Page
- **File**: `/clutch-admin/src/app/setup-password/page.tsx`
- **Features**:
  - Token validation
  - Password creation form
  - Password strength validation
  - Auto-login after setup

### **Phase 3: Integration & Testing**

#### 3.1 API Integration
- Update existing HR page to use new invitation endpoints
- Integrate invitation form with backend
- Add invitation status tracking

#### 3.2 Testing
- Test complete invitation flow
- Test email delivery
- Test password setup process
- Test error handling

## 🔧 **Detailed Implementation Steps**

### **Step 1: Email Service Implementation**

```javascript
// /shared-backend/services/email-service.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      // SMTP configuration
    });
  }

  async sendEmployeeInvitation(invitationData) {
    const { email, name, role, department, invitationToken } = invitationData;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Welcome to Clutch - Set up your account`,
      html: this.getInvitationEmailTemplate({
        name,
        role,
        department,
        invitationLink: `${process.env.FRONTEND_URL}/setup-password?token=${invitationToken}`
      })
    };

    return await this.transporter.sendMail(mailOptions);
  }
}
```

### **Step 2: Invitation Backend Routes**

```javascript
// /shared-backend/routes/employee-invitations.js
router.post('/invite', authenticateToken, requireRole(['admin', 'hr']), async (req, res) => {
  try {
    const { email, name, role, department, position, permissions } = req.body;
    
    // Generate invitation token
    const invitationToken = jwt.sign(
      { email, type: 'employee_invitation' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Save invitation to database
    const invitation = {
      email: email.toLowerCase(),
      name,
      role,
      department,
      position,
      permissions,
      invitationToken,
      invitedBy: req.user.userId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
    };
    
    await invitationsCollection.insertOne(invitation);
    
    // Send invitation email
    await emailService.sendEmployeeInvitation(invitation);
    
    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: { invitationId: invitation._id }
    });
    
  } catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'INVITATION_FAILED',
      message: 'Failed to send invitation'
    });
  }
});
```

### **Step 3: Frontend Invitation Form**

```typescript
// /clutch-admin/src/components/employee-invitation-form.tsx
interface InvitationFormData {
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  permissions: string[];
}

export function EmployeeInvitationForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<InvitationFormData>({
    name: '',
    email: '',
    role: 'employee',
    department: '',
    position: '',
    permissions: ['read']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiService.inviteEmployee(formData);
      if (response.success) {
        toast.success('Invitation sent successfully!');
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

### **Step 4: Password Setup Flow**

```typescript
// /clutch-admin/src/app/setup-password/page.tsx
export default function SetupPasswordPage() {
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await apiService.validateInvitationToken(token);
      setIsValidToken(response.success);
    } catch (error) {
      setIsValidToken(false);
    }
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await apiService.setupEmployeePassword(token, password);
      if (response.success) {
        toast.success('Password set successfully! Logging you in...');
        // Auto-login and redirect to dashboard
      }
    } catch (error) {
      toast.error('Failed to set password');
    }
  };

  if (isValidToken === null) {
    return <div>Validating invitation...</div>;
  }

  if (isValidToken === false) {
    return <div>Invalid or expired invitation link</div>;
  }

  return (
    <form onSubmit={handlePasswordSetup}>
      {/* Password setup form */}
    </form>
  );
}
```

## 🚀 **Implementation Priority**

### **High Priority (Must Have)**
1. ✅ Email service setup
2. ✅ Backend invitation endpoints
3. ✅ Frontend invitation form
4. ✅ Password setup flow

### **Medium Priority (Should Have)**
1. 📧 Email templates
2. 📊 Invitation tracking
3. 🔄 Resend invitation functionality
4. ⏰ Invitation expiration handling

### **Low Priority (Nice to Have)**
1. 📱 Mobile-responsive email templates
2. 🔔 Email notifications for admins
3. 📈 Invitation analytics
4. 🎨 Custom email branding

## 🧪 **Testing Strategy**

### **Unit Tests**
- Email service functionality
- Invitation token generation/validation
- Password setup validation

### **Integration Tests**
- Complete invitation flow
- Email delivery
- Database operations

### **End-to-End Tests**
- Admin creates invitation
- Employee receives email
- Employee sets up password
- Employee can login

## 📝 **Next Steps**

1. **Immediate**: Implement email service and basic invitation system
2. **Short-term**: Create frontend invitation form and password setup
3. **Medium-term**: Add invitation management and tracking
4. **Long-term**: Enhance with analytics and advanced features

---

**Status**: Ready for implementation  
**Estimated Time**: 2-3 days for complete system  
**Dependencies**: Email service provider (Gmail, SendGrid, etc.)
