const fs = require('fs');
const path = require('path');

/**
 * SSL/TLS Configuration
 */

const sslConfig = {
  // SSL Certificate paths
  key: process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'private-key.pem'),
  cert: process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'certificate.pem'),
  ca: process.env.SSL_CA_PATH || path.join(__dirname, 'certs', 'ca-bundle.pem'),
  
  // SSL Options
  options: {
    secureProtocol: 'TLSv1_2_method',
    ciphers: [
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA384'
    ].join(':'),
    honorCipherOrder: true,
    secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3
  },
  
  // HSTS Configuration
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Certificate validation
  validateCertificates: () => {
    try {
      const keyExists = fs.existsSync(sslConfig.key);
      const certExists = fs.existsSync(sslConfig.cert);
      const caExists = fs.existsSync(sslConfig.ca);
      
      return {
        valid: keyExists && certExists,
        keyExists,
        certExists,
        caExists,
        message: keyExists && certExists ? 'SSL certificates are valid' : 'SSL certificates missing'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
};

module.exports = sslConfig;
