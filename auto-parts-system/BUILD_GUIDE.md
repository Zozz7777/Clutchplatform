# Build Guide - Clutch Auto Parts System

This guide explains how to build the executable (.exe) file for the Clutch Auto Parts System.

## Prerequisites

Before building the executable, ensure you have:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Quick Build (Windows)

### Method 1: Using the Build Script

1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```cmd
   cd C:\Users\zizo_\Desktop\clutch-main\auto-parts-system
   ```
3. Run the build script:
   ```cmd
   scripts\build-exe.bat
   ```

### Method 2: Manual Build

1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```cmd
   cd C:\Users\zizo_\Desktop\clutch-main\auto-parts-system
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Build the executable:
   ```cmd
   npm run build:win
   ```

## Build Process

The build process will:

1. **Install Dependencies**: Download and install all required packages
2. **Compile Application**: Bundle all source code and assets
3. **Create Installer**: Generate a Windows installer (.exe) file
4. **Output Location**: The executable will be created in the `dist` folder

## Output Files

After a successful build, you'll find:

- **`dist/Clutch Auto Parts System Setup.exe`** - The main installer
- **`dist/win-unpacked/`** - Unpacked application files
- **`dist/builder-effective-config.yaml`** - Build configuration

## Distribution

The generated `Clutch Auto Parts System Setup.exe` file can be:

1. **Distributed to Auto Parts Shops**: Send the installer to shops
2. **Installed on POS Systems**: Run the installer on Windows computers
3. **Network Deployment**: Deploy across multiple computers

## Installation Process

When shops run the installer:

1. **Welcome Screen**: Introduction to the system
2. **License Agreement**: Accept the terms
3. **Installation Directory**: Choose where to install
4. **Desktop Shortcut**: Option to create shortcuts
5. **Installation**: Copy files and create registry entries
6. **Completion**: Launch the application

## System Requirements

### Minimum Requirements
- **OS**: Windows 10 (64-bit) or higher
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 500 MB free space
- **CPU**: Intel Core i3 or equivalent
- **Network**: Internet connection for backend sync

### Recommended Requirements
- **OS**: Windows 11 (64-bit)
- **RAM**: 8 GB or more
- **Storage**: 2 GB free space
- **CPU**: Intel Core i5 or equivalent
- **Network**: Stable internet connection

## Troubleshooting

### Common Build Issues

#### 1. Node.js Not Found
```
ERROR: Node.js is not installed or not in PATH
```
**Solution**: Install Node.js from https://nodejs.org/

#### 2. npm Install Failed
```
ERROR: Failed to install dependencies
```
**Solutions**:
- Check internet connection
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install`

#### 3. Build Failed
```
ERROR: Build failed
```
**Solutions**:
- Check for syntax errors in source code
- Ensure all dependencies are installed
- Check available disk space
- Run `npm run lint` to check for code issues

#### 4. Executable Not Created
```
ERROR: Executable not found in dist folder
```
**Solutions**:
- Check build logs for specific errors
- Ensure electron-builder is installed
- Verify build configuration in package.json

### Performance Issues

#### Slow Build
- Close unnecessary applications
- Use SSD storage for faster I/O
- Increase available RAM

#### Large Executable Size
- The executable includes all dependencies
- Size is typically 200-400 MB
- This is normal for Electron applications

## Advanced Build Options

### Custom Build Configuration

Edit `package.json` to customize the build:

```json
{
  "build": {
    "appId": "com.clutch.autoparts",
    "productName": "Clutch Auto Parts System",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Build Variants

```cmd
# Build for Windows (NSIS installer)
npm run build:win

# Build portable version
npm run build:win -- --config.win.target=portable

# Build with custom output directory
npm run build:win -- --config.directories.output=custom-dist
```

## Development vs Production Builds

### Development Build
```cmd
npm run dev
```
- Includes debugging tools
- Hot reload enabled
- Larger file size
- Not suitable for distribution

### Production Build
```cmd
npm run build:win
```
- Optimized for performance
- No debugging tools
- Smaller file size
- Ready for distribution

## Security Considerations

### Code Signing (Optional)
For production distribution, consider code signing:

1. Obtain a code signing certificate
2. Configure electron-builder for signing
3. Sign the executable before distribution

### Antivirus False Positives
Some antivirus software may flag the executable:

- This is common with Electron applications
- Submit to antivirus vendors for whitelisting
- Provide clear installation instructions to users

## Support

### Getting Help

If you encounter issues:

1. Check this build guide
2. Review build logs for specific errors
3. Ensure all prerequisites are met
4. Contact the development team

### Build Logs

Build logs are displayed in the console. For detailed logs:

```cmd
npm run build:win -- --verbose
```

## Updates

### Application Updates
The system includes automatic update functionality:

- Checks for updates on startup
- Downloads and installs updates automatically
- Maintains user data during updates

### Build System Updates
Keep the build system updated:

```cmd
npm update electron-builder
npm update electron
```

## Conclusion

The Clutch Auto Parts System is designed to be easily built and distributed. The single executable file contains everything needed to run the application on Windows computers, making it perfect for deployment to auto parts shops.

For any questions or issues, refer to this guide or contact the development team.
