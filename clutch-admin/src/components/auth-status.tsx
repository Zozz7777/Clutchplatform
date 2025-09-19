"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AriaLiveRegion, ScreenReaderText } from '@/components/accessibility/aria-live-region';

export function AuthStatus() {
  const [tokenStatus, setTokenStatus] = useState<{ hasToken: boolean; tokenPreview: string }>({ hasToken: false, tokenPreview: 'none' });
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'error'>('idle');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    updateTokenStatus();
  }, []);

  const updateTokenStatus = () => {
    const status = apiService.getTokenStatus();
    setTokenStatus(status);
  };

  const verifyToken = async () => {
    setVerificationStatus('checking');
    try {
      const response = await apiService.verifyToken();
      if (response.success && response.data?.valid) {
        setVerificationStatus('valid');
      } else {
        setVerificationStatus('invalid');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setVerificationStatus('error');
    }
    setLastChecked(new Date());
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'valid':
        return <Badge variant="default" className="bg-success/100">Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-warning/100">Error</Badge>;
      case 'checking':
        return <Badge variant="secondary" className="bg-primary/100">Checking...</Badge>;
      default:
        return <Badge variant="outline">Not Checked</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <AriaLiveRegion 
        message={`Authentication status: ${verificationStatus === 'valid' ? 'Valid token' : verificationStatus === 'invalid' ? 'Invalid token' : verificationStatus === 'error' ? 'Error checking token' : 'Not checked'}`}
        priority="polite"
      />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Authentication Status
          <ScreenReaderText>Current authentication token status and verification</ScreenReaderText>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Token Status:</span>
            {tokenStatus.hasToken ? (
              <Badge variant="default">Present</Badge>
            ) : (
              <Badge variant="destructive">Missing</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Token Preview:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {tokenStatus.tokenPreview}
            </code>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification:</span>
            {getStatusBadge()}
          </div>
          
          {lastChecked && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Checked:</span>
              <span className="text-xs text-muted-foreground">
                {lastChecked.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={updateTokenStatus} 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button 
            onClick={verifyToken} 
            variant="default" 
            size="sm"
            className="flex-1"
            disabled={!tokenStatus.hasToken || verificationStatus === 'checking'}
          >
            {verificationStatus === 'checking' ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            Verify
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>This component tests the authentication headers by:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Checking token storage (localStorage/sessionStorage)</li>
            <li>Displaying token preview for debugging</li>
            <li>Verifying token with backend API</li>
            <li>Showing real-time auth status</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
