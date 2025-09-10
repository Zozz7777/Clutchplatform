# DNS Setup Guide for Your Clutch Email System

## 🌐 Complete DNS Configuration for yourclutch.com

This guide will help you configure all necessary DNS records for your Clutch Email System to work with your `yourclutch.com` domain.

---

## 📋 Required DNS Records

### **1. MX Records (Mail Exchange)**
These tell other email servers where to send emails for your domain.

```
Type: MX
Name: @
Value: mail.yourclutch.com
Priority: 10
TTL: 3600
```

```
Type: MX
Name: @
Value: smtp.yourclutch.com
Priority: 20
TTL: 3600
```

### **2. A Records (Email Server IP)**
Point your email subdomains to your server's IP address.

```
Type: A
Name: mail.yourclutch.com
Value: [YOUR_SERVER_IP]
TTL: 3600
```

```
Type: A
Name: smtp.yourclutch.com
Value: [YOUR_SERVER_IP]
TTL: 3600
```

```
Type: A
Name: imap.yourclutch.com
Value: [YOUR_SERVER_IP]
TTL: 3600
```

```
Type: A
Name: pop.yourclutch.com
Value: [YOUR_SERVER_IP]
TTL: 3600
```

### **3. CNAME Records**
Alias records for easier access.

```
Type: CNAME
Name: email.yourclutch.com
Value: mail.yourclutch.com
TTL: 3600
```

```
Type: CNAME
Name: webmail.yourclutch.com
Value: mail.yourclutch.com
TTL: 3600
```

### **4. TXT Records (Email Authentication)**

#### **SPF Record (Sender Policy Framework)**
```
Type: TXT
Name: @
Value: "v=spf1 mx a ip4:[YOUR_SERVER_IP] ~all"
TTL: 3600
```

#### **DKIM Record (DomainKeys Identified Mail)**
```
Type: TXT
Name: default._domainkey.yourclutch.com
Value: "v=DKIM1; k=rsa; p=[YOUR_DKIM_PUBLIC_KEY]"
TTL: 3600
```

#### **DMARC Record (Domain-based Message Authentication)**
```
Type: TXT
Name: _dmarc.yourclutch.com
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourclutch.com; ruf=mailto:dmarc@yourclutch.com; sp=quarantine; adkim=r; aspf=r;"
TTL: 3600
```

### **5. PTR Record (Reverse DNS)**
```
Type: PTR
Name: [YOUR_SERVER_IP_REVERSE]
Value: mail.yourclutch.com
```

---

## 🔧 Step-by-Step DNS Configuration

### **Step 1: Get Your Server IP Address**
1. Log into your server
2. Run: `curl ifconfig.me` or `wget -qO- ifconfig.me`
3. Note down the IP address

### **Step 2: Access Your DNS Provider**
1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS Management
3. Find the DNS records section

### **Step 3: Add MX Records**
1. Add the MX records listed above
2. Set priority 10 for primary mail server
3. Set priority 20 for backup mail server

### **Step 4: Add A Records**
1. Add all A records pointing to your server IP
2. Make sure all subdomains are covered

### **Step 5: Add CNAME Records**
1. Add the CNAME records for easier access
2. These provide alternative ways to access your email

### **Step 6: Add TXT Records**
1. Add SPF record first
2. Generate and add DKIM record
3. Add DMARC record

### **Step 7: Request PTR Record**
1. Contact your hosting provider
2. Request PTR record setup
3. Provide them with your domain name

---

## 🛠️ DNS Verification Tools

### **Online DNS Checkers:**
- [MXToolbox](https://mxtoolbox.com/)
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)

### **Command Line Tools:**
```bash
# Check MX records
dig MX yourclutch.com

# Check A records
dig A mail.yourclutch.com
dig A smtp.yourclutch.com

# Check TXT records
dig TXT yourclutch.com
dig TXT _dmarc.yourclutch.com

# Check PTR record
dig -x [YOUR_SERVER_IP]
```

---

## ⏰ DNS Propagation

### **Expected Timeline:**
- **Immediate**: Some DNS providers
- **5-15 minutes**: Most providers
- **24-48 hours**: Full global propagation
- **72 hours**: Maximum time for all networks

### **Testing Propagation:**
```bash
# Test from multiple locations
nslookup mail.yourclutch.com 8.8.8.8
nslookup mail.yourclutch.com 1.1.1.1
nslookup mail.yourclutch.com 208.67.222.222
```

---

## 🔒 Security Considerations

### **SPF Record Best Practices:**
- Use `~all` for testing, `-all` for production
- Include all authorized sending servers
- Keep the record under 255 characters

### **DMARC Policy:**
- Start with `p=none` for monitoring
- Move to `p=quarantine` after verification
- Use `p=reject` for maximum security

### **DKIM Setup:**
- Generate 2048-bit RSA keys
- Rotate keys regularly
- Monitor DKIM signing rates

---

## 🚨 Common Issues and Solutions

### **Issue 1: MX Records Not Propagating**
**Solution:**
- Wait 24-48 hours
- Check with multiple DNS providers
- Verify record syntax

### **Issue 2: Emails Going to Spam**
**Solution:**
- Ensure SPF record is correct
- Set up DKIM properly
- Configure DMARC policy
- Check PTR record

### **Issue 3: Cannot Send Emails**
**Solution:**
- Verify SMTP A record
- Check firewall settings
- Ensure port 587/465 is open

### **Issue 4: Cannot Receive Emails**
**Solution:**
- Verify MX records
- Check IMAP/POP3 A records
- Ensure ports 993/995 are open

---

## 📞 Support Information

### **DNS Provider Support:**
- **GoDaddy**: 1-866-938-1119
- **Namecheap**: Live chat available
- **Cloudflare**: Support tickets
- **Route53**: AWS support

### **Testing Commands:**
```bash
# Test email sending
telnet smtp.yourclutch.com 587

# Test email receiving
telnet imap.yourclutch.com 993

# Test webmail access
curl -I https://webmail.yourclutch.com
```

---

## ✅ DNS Configuration Checklist

- [ ] MX records added (priority 10, 20)
- [ ] A records for all email subdomains
- [ ] CNAME records for easy access
- [ ] SPF record configured
- [ ] DKIM record generated and added
- [ ] DMARC record configured
- [ ] PTR record requested from hosting provider
- [ ] DNS propagation verified
- [ ] Email authentication tested
- [ ] Spam score checked

---

## 🎯 Next Steps After DNS Setup

1. **Wait for DNS propagation** (24-48 hours)
2. **Test email functionality** using the test script
3. **Configure SSL certificates** for secure connections
4. **Set up email client** (Thunderbird, Outlook, etc.)
5. **Test webmail interface** at webmail.yourclutch.com
6. **Monitor email delivery** and spam scores
7. **Configure backup MX** if needed

---

**🎉 Once DNS is configured, your Clutch Email System will be fully functional with your own domain!**

The system will provide professional email addresses like `john@yourclutch.com` and integrate seamlessly with your Clutch admin panel.
