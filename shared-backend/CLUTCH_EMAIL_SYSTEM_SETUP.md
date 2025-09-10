# Clutch Email System Setup Guide

## 🚀 Complete Email Infrastructure for Clutch Domain

This guide will help you set up a complete email system for Clutch with your own domain, similar to Gmail but integrated into your admin panel.

---

## 📋 System Overview

### **What We're Building:**
- **Email Server**: SMTP/IMAP/POP3 support
- **Web Interface**: Gmail-like email client
- **Admin Panel**: Email management dashboard
- **Domain Integration**: @clutch.com email addresses
- **Security**: SSL/TLS encryption
- **Storage**: MongoDB-based email storage

### **Features:**
- ✅ Email account creation and management
- ✅ Send/receive emails with attachments
- ✅ Folder management (Inbox, Sent, Drafts, etc.)
- ✅ Contact management
- ✅ Email search and filtering
- ✅ Email signatures
- ✅ Admin dashboard with statistics
- ✅ Mobile-responsive web interface

---

## 🌐 DNS Configuration

### **Required DNS Records for clutch.com:**

Add these records to your domain's DNS settings:

#### **1. MX Records (Mail Exchange)**
```
Type: MX
Name: @
Value: clutch.com
Priority: 10
```

#### **2. A Records (Email Server)**
```
Type: A
Name: mail.clutch.com
Value: [YOUR_SERVER_IP]
TTL: 3600
```

```
Type: A
Name: smtp.clutch.com
Value: [YOUR_SERVER_IP]
TTL: 3600
```

```
Type: A
Name: imap.clutch.com
Value: [YOUR_SERVER_IP]
TTL: 3600
```

#### **3. CNAME Records**
```
Type: CNAME
Name: email.clutch.com
Value: mail.clutch.com
TTL: 3600
```

#### **4. TXT Records (SPF, DKIM, DMARC)**
```
Type: TXT
Name: @
Value: "v=spf1 mx a ip4:[YOUR_SERVER_IP] ~all"
TTL: 3600
```

```
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@clutch.com"
TTL: 3600
```

#### **5. PTR Record (Reverse DNS)**
```
Type: PTR
Name: [YOUR_SERVER_IP_REVERSE]
Value: mail.clutch.com
```

---

## 🔧 Server Configuration

### **Environment Variables**

Add these to your `.env` file:

```bash
# Clutch Email System Configuration
CLUTCH_EMAIL_DOMAIN=clutch.com
CLUTCH_SMTP_HOST=smtp.clutch.com
CLUTCH_SMTP_PORT=587
CLUTCH_SMTP_SECURE=false
CLUTCH_SMTP_USER=noreply@clutch.com
CLUTCH_SMTP_PASS=your_secure_password

CLUTCH_IMAP_HOST=imap.clutch.com
CLUTCH_IMAP_PORT=993
CLUTCH_IMAP_SECURE=true
CLUTCH_IMAP_USER=noreply@clutch.com
CLUTCH_IMAP_PASS=your_secure_password

# Email Server Settings
EMAIL_STORAGE_LIMIT=1073741824  # 1GB per user
EMAIL_MAX_ATTACHMENT_SIZE=10485760  # 10MB
EMAIL_SERVER_NAME=Clutch Email Server
```

### **SSL Certificate Setup**

1. **Obtain SSL Certificate:**
   ```bash
   # Using Let's Encrypt
   sudo certbot certonly --standalone -d mail.clutch.com -d smtp.clutch.com -d imap.clutch.com
   ```

2. **Certificate Paths:**
   ```bash
   SSL_CERT_PATH=/etc/letsencrypt/live/mail.clutch.com/fullchain.pem
   SSL_KEY_PATH=/etc/letsencrypt/live/mail.clutch.com/privkey.pem
   ```

---

## 📧 Email Server Installation

### **1. Install Required Software**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### **2. Install Email Server Software**

```bash
# Install Postfix (SMTP Server)
sudo apt-get install -y postfix

# Install Dovecot (IMAP/POP3 Server)
sudo apt-get install -y dovecot-core dovecot-imapd dovecot-pop3d

# Install SpamAssassin
sudo apt-get install -y spamassassin spamc
```

### **3. Configure Postfix**

Edit `/etc/postfix/main.cf`:

```conf
# Basic Settings
myhostname = mail.clutch.com
mydomain = clutch.com
myorigin = $mydomain

# Network Settings
inet_interfaces = all
inet_protocols = ipv4

# Mailbox Settings
home_mailbox = Maildir/
mailbox_command =

# Authentication
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous

# TLS Settings
smtpd_tls_cert_file = /etc/letsencrypt/live/mail.clutch.com/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/mail.clutch.com/privkey.pem
smtpd_tls_security_level = may
smtpd_tls_protocols = !SSLv2, !SSLv3

# Relay Settings
relay_domains = clutch.com
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain

# Security
smtpd_helo_required = yes
smtpd_helo_restrictions = permit_mynetworks, reject_invalid_helo_hostname, reject_non_fqdn_helo_hostname
```

### **4. Configure Dovecot**

Edit `/etc/dovecot/conf.d/10-mail.conf`:

```conf
mail_location = maildir:~/Maildir
mail_privileged_group = mail
mail_access_groups = mail
```

Edit `/etc/dovecot/conf.d/10-ssl.conf`:

```conf
ssl = yes
ssl_cert = </etc/letsencrypt/live/mail.clutch.com/fullchain.pem
ssl_key = </etc/letsencrypt/live/mail.clutch.com/privkey.pem
```

### **5. Restart Services**

```bash
sudo systemctl restart postfix
sudo systemctl restart dovecot
sudo systemctl enable postfix
sudo systemctl enable dovecot
```

---

## 🚀 Deploy Clutch Email System

### **1. Install Dependencies**

```bash
cd shared-backend
npm install nodemailer imap simple-imap
```

### **2. Initialize Email System**

```bash
# Start the email server
node -e "
const ClutchEmailServer = require('./services/clutch-email-server');
const server = new ClutchEmailServer();
server.initialize().then(() => {
  console.log('✅ Clutch Email Server initialized');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed to initialize:', err);
  process.exit(1);
});
"
```

### **3. Test Email System**

```bash
# Test SMTP connection
node scripts/test-email-system.js
```

---

## 📱 Web Interface Setup

### **1. Create Email Web Client**

The email system includes a web-based interface accessible at:
- **URL**: `https://mail.clutch.com`
- **Admin Panel**: `https://admin.clutch.com/email`

### **2. Features Available:**

#### **Email Management:**
- Compose and send emails
- Receive and read emails
- Folder organization
- Email search
- Contact management

#### **Admin Features:**
- User account management
- Email statistics
- System monitoring
- Storage management
- Security settings

---

## 🔒 Security Configuration

### **1. Firewall Setup**

```bash
# Allow email ports
sudo ufw allow 25/tcp   # SMTP
sudo ufw allow 587/tcp  # SMTP Submission
sudo ufw allow 993/tcp  # IMAP SSL
sudo ufw allow 995/tcp  # POP3 SSL
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Enable firewall
sudo ufw enable
```

### **2. Spam Protection**

```bash
# Configure SpamAssassin
sudo systemctl start spamassassin
sudo systemctl enable spamassassin

# Add to Postfix configuration
sudo postconf -e 'content_filter = spamassassin'
```

### **3. Rate Limiting**

```bash
# Install fail2ban
sudo apt-get install -y fail2ban

# Configure for email services
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

---

## 📊 Monitoring & Maintenance

### **1. Email Statistics**

Access via API: `GET /api/v1/clutch-email/admin/stats`

```json
{
  "success": true,
  "stats": {
    "totalEmails": 1250,
    "totalAccounts": 45,
    "emailsToday": 23,
    "storageUsed": 1073741824
  }
}
```

### **2. Health Monitoring**

```bash
# Check service status
sudo systemctl status postfix
sudo systemctl status dovecot
sudo systemctl status mongod

# Check email logs
sudo tail -f /var/log/mail.log
sudo tail -f /var/log/dovecot.log
```

### **3. Backup Strategy**

```bash
# Backup email database
mongodump --db clutch_email --out /backup/email_$(date +%Y%m%d)

# Backup email files
tar -czf /backup/maildir_$(date +%Y%m%d).tar.gz /home/*/Maildir/
```

---

## 🎯 API Endpoints

### **Core Email Operations:**

```bash
# Create email account
POST /api/v1/clutch-email/accounts
{
  "userId": "user123",
  "emailAddress": "john@clutch.com",
  "password": "secure_password",
  "displayName": "John Doe"
}

# Send email
POST /api/v1/clutch-email/send
{
  "from": "john@clutch.com",
  "to": ["recipient@example.com"],
  "subject": "Test Email",
  "body": "Hello from Clutch!",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"]
}

# Get emails
GET /api/v1/clutch-email/emails/user123/inbox?page=1&limit=20

# Search emails
GET /api/v1/clutch-email/search/user123?query=important&folder=inbox

# Manage folders
GET /api/v1/clutch-email/folders/user123
POST /api/v1/clutch-email/folders
{
  "userId": "user123",
  "name": "Work",
  "type": "custom"
}

# Manage contacts
GET /api/v1/clutch-email/contacts/user123
POST /api/v1/clutch-email/contacts
{
  "userId": "user123",
  "contact": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "company": "Example Corp"
  }
}
```

---

## 🚀 Next Steps

### **1. DNS Configuration**
- Add all required DNS records to your domain
- Wait for DNS propagation (24-48 hours)
- Verify DNS records with online tools

### **2. Server Setup**
- Deploy to your server with the provided configuration
- Install SSL certificates
- Configure firewall and security

### **3. Testing**
- Test email sending/receiving
- Verify web interface functionality
- Check admin panel access

### **4. Production Deployment**
- Set up monitoring and alerts
- Configure automated backups
- Implement rate limiting and spam protection

---

## 📞 Support

For technical support or questions about the Clutch Email System:

- **Documentation**: Check this guide and API documentation
- **Logs**: Review server logs for troubleshooting
- **Monitoring**: Use the admin dashboard for system health

---

**🎉 Congratulations! You now have a complete email system for Clutch with your own domain!**

The system provides Gmail-like functionality with full integration into your Clutch admin panel, giving you complete control over your email infrastructure.
