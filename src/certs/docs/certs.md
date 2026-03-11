[Home](../../../README.md) > [System Modules Documentation](../../docs/modules.md) > [SSL Certificates Module Documentation]

# **SSL Certificates Module Documentation**

## **Introduction**

The SSL Certificates module is a fundamental component of the VUDEC system that provides the necessary security infrastructure for enabling HTTPS communication. This documentation aims to help new developers understand the purpose, structure, and proper usage of SSL certificates within the project.

## **Overview**

SSL (Secure Sockets Layer) certificates are digital files that authenticate the identity of a website and enable an encrypted connection. In the VUDEC application, these certificates ensure that data transmitted between clients and the server remains private and secure.

## **Directory Structure**

The SSL certificates are stored in the `src/certs` directory and include the following files:

| File | Size | Description |
|------|------|-------------|
| `SoftTribCertNest.pfx` | 5.8KB | PFX certificate bundle (contains both certificate and private key) |
| `cert.pem` | 6.1KB | Public certificate in PEM format |
| `key.pem` | 1.7KB | Private key in PEM format |
| `softtrib.pass` | 8.0B | Password file for the PFX certificate |

## **Certificate File Types**

### **PFX File (SoftTribCertNest.pfx)**
- **Format**: PKCS#12 (Personal Information Exchange)
- **Contains**: Both the certificate and its corresponding private key
- **Usage**: Used for configuring HTTPS in the NestJS application
- **Protection**: Password-protected (password stored in softtrib.pass)

### **PEM Files (cert.pem and key.pem)**
- **Format**: Base64 encoded DER certificates with header and footer lines
- **Purpose**:
  - `cert.pem`: Public certificate that verifies the server's identity
  - `key.pem`: Private key used to decrypt information encrypted with the public key
- **Usage**: Alternative format for configuring HTTPS in NestJS

## **Implementation in the Application**

The certificates are used in the main application bootstrap process to enable HTTPS. Below is an example of how these certificates are implemented in the code:

```typescript
// Excerpt from src/main.ts
async function configureHttpsServer(app: NestExpressApplication): Promise<https.Server> {
  // Check if HTTPS is enabled
  const httpsEnabled = process.env.HTTPS === 'true';
  
  if (httpsEnabled) {
    // Certificate path configuration
    const certPath = process.env.CERT_PFX || path.join(__dirname, '../certs/SoftTribCertNest.pfx');
    const passPath = process.env.CERT_PASS || path.join(__dirname, '../certs/softtrib.pass');
    
    // Reading certificate and password
    const certBuffer = fs.readFileSync(certPath);
    const passBuffer = fs.readFileSync(passPath);
    
    // Creating HTTPS server
    const httpsOptions = {
      pfx: certBuffer,
      passphrase: passBuffer.toString().trim()
    };
    
    return https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
  }
  
  // Return null or a default HTTP server if HTTPS is not enabled
  return null;
}
```

## **Environment Configuration**

The following environment variables are used to configure the SSL certificates:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `HTTPS` | Enables/disables HTTPS | `false` |
| `CERT_PFX` | Path to the PFX certificate file | `src/certs/SoftTribCertNest.pfx` |
| `CERT_PASS` | Path to the password file | `src/certs/softtrib.pass` |

## **Certificate Management**

### **Certificate Renewal**

SSL certificates have expiration dates and must be renewed periodically. The process typically involves:

1. Generating a Certificate Signing Request (CSR)
2. Submitting the CSR to a Certificate Authority (CA)
3. Receiving and installing the new certificate
4. Restarting the application to apply the new certificate

### **Development vs. Production Certificates**

- **Development**: The provided certificates are intended for development purposes only
- **Production**: In production environments, use certificates from trusted Certificate Authorities
- **Local Development**: For local development, self-signed certificates can be used

## **Creating Self-Signed Certificates for Development**

For local development, you can create self-signed certificates using OpenSSL with the following commands:

```bash
# Generate a private key
openssl genrsa -out key.pem 2048

# Create a certificate signing request (CSR)
openssl req -new -key key.pem -out csr.pem

# Generate the certificate
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

# Create a PFX bundle
openssl pkcs12 -export -out certificate.pfx -inkey key.pem -in cert.pem
```

## **Security Considerations**

- **Key Security**: Private keys should be kept secure and not shared
- **Password Protection**: PFX files should always be password-protected
- **Access Controls**: Restrict access to the certificate files
- **Environment Variables**: Use environment variables to store paths to certificates instead of hardcoding them
- **Version Control**: Avoid committing real certificates to version control systems

## **Troubleshooting**

### **Common Issues**

#### Certificate Not Found
- Ensure the certificate paths in environment variables are correct
- Check if the certificate files exist in the specified location

#### Invalid Certificate
- Verify the certificate is not expired
- Confirm the certificate is in the correct format

#### HTTPS Connection Issues
- Check if the environment variable `HTTPS` is set to `true`
- Verify that the certificate password is correct

## **Best Practices**

1. **Regular Renewal**: Set reminders to renew certificates before they expire
2. **Automated Testing**: Include HTTPS testing in your CI/CD pipeline
3. **Documentation**: Keep documentation of certificate details (issuance date, expiration date, issuing CA)
4. **Backup**: Maintain secure backups of certificates and private keys
5. **Monitoring**: Implement monitoring to alert when certificates are nearing expiration

## **Conclusion**

Understanding how SSL certificates are implemented and managed is crucial for maintaining the security of the VUDEC application. This documentation provides a foundation for new developers to work with the certificate module, ensuring secure communications between clients and the server. 