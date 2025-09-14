# React Error #310 Debug Guide

This guide will help you identify which components are causing React Error #310.

## What's Been Added

1. **Enhanced Error Tracking**: The app now logs detailed information about React Error #310
2. **Component Tracking**: All components are tracked for hook usage
3. **Browser Console Logging**: Detailed error information is logged to the browser console

## How to Use

### 1. Open Browser Developer Tools
- Press `F12` or right-click → "Inspect"
- Go to the "Console" tab

### 2. Look for Error Messages
When React Error #310 occurs, you'll see detailed logs like:

```
🚨 REACT ERROR #310 DETECTED
├── Original Error: [error details]
├── Component Hook Tracker: [component names and hook counts]
├── Component Render Tracker: [render counts]
├── Stack Trace: [exact location of error]
└── Timestamp: [when error occurred]
```

### 3. Identify the Problematic Component
The logs will show:
- **Component Name**: Which component is causing the issue
- **Hook Count**: How many hooks are being called
- **Render Count**: How many times the component has rendered
- **Stack Trace**: Exact line where the error occurs

### 4. Debug Information Available
In the browser console, you can also access:
- `window.reactError310` - Last React Error #310 details
- `window.reactErrorTracker` - Component tracking information
- `window.autoTracker` - Hook and render counts

## Common Causes of React Error #310

1. **Conditional Hook Calls**: Hooks called inside if statements
2. **Early Returns**: Hooks called after return statements
3. **Loops**: Hooks called inside for/while loops
4. **Dynamic Hook Count**: Different number of hooks between renders

## Example Debug Output

```javascript
// In browser console:
console.log(window.reactError310)
// Shows:
{
  error: [...],
  url: "http://localhost:3000/login",
  timestamp: "2024-01-15T10:30:00.000Z",
  tracker: {
    componentHookTracker: {
      "LoginPage": 5,
      "AuthGuard": 3,
      "Header": 8
    },
    componentRenderTracker: {
      "LoginPage": 2,
      "AuthGuard": 1,
      "Header": 1
    }
  }
}
```

## Next Steps

1. **Run the app**: `npm run dev`
2. **Open browser console**: Press F12
3. **Navigate to login page**: Go to http://localhost:3000/login
4. **Look for error logs**: Check console for detailed error information
5. **Identify component**: Find which component has inconsistent hook counts
6. **Fix the component**: Ensure hooks are called unconditionally

## Files Modified

- `src/app/layout.tsx` - Added error tracking
- `src/app/(auth)/login/page.tsx` - Added error tracker wrapper
- `src/lib/react-error-tracker.ts` - Core tracking logic
- `src/components/debug/` - Debug components and utilities

## Disabling Debug Mode

To disable debug logging, set `NODE_ENV=production` or remove the debug imports from `layout.tsx`.
