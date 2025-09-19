"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle, AlertTriangle, Shield, User } from "lucide-react";

interface InvitationData {
  email: string;
  name: string;
  role: string;
  department: string;
  position: string;
  expiresAt: string;
}

function SetupPasswordContent() {
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    } else {
      setIsValidating(false);
      setIsValidToken(false);
    }
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      const response = await apiService.validateInvitationToken(token);
      
      if (response.success && response.data) {
        setIsValidToken(true);
        setInvitationData(response.data.invitation);
      } else {
        setIsValidToken(false);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setIsValidToken(false);
    } finally {
      setIsValidating(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.acceptInvitation(token, password);
      
      if (response.success && response.data) {
        toast.success("Password set successfully!", {
          description: "Welcome to Clutch! You are now logged in."
        });

        // Store the user data and token
        const { token: authToken, user } = response.data;
        
        // Set the auth token
        localStorage.setItem("clutch-admin-token", authToken);
        
        // Set the user data
        localStorage.setItem("clutch-admin-user", JSON.stringify(user));
        
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        toast.error("Failed to set password", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error("Password setup error:", error);
      toast.error("Failed to set password", {
        description: "Please check your connection and try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; score: number } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { strength: "Weak", color: "text-destructive", score };
    if (score <= 4) return { strength: "Medium", color: "text-warning", score };
    return { strength: "Strong", color: "text-success", score };
  };

  const passwordStrength = getPasswordStrength(password);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-lg font-semibold mb-2">Validating Invitation</h2>
              <p className="text-muted-foreground">Please wait while we verify your invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This invitation link is invalid, expired, or has already been used. 
                Please contact your administrator for a new invitation.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-2xs">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-sans">Set Up Your Account</CardTitle>
            <CardDescription className="font-sans">
              Welcome to Clutch! Please create a secure password to complete your account setup.
            </CardDescription>
          </CardHeader>
        
        <CardContent>
          {invitationData && (
            <div className="mb-6 p-4 bg-muted rounded-[0.625rem]">
              <h3 className="font-medium mb-2 flex items-center gap-2 font-sans">
                <User className="h-4 w-4" />
                Account Details
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground font-sans">
                <p><strong>Name:</strong> {invitationData.name}</p>
                <p><strong>Email:</strong> {invitationData.email}</p>
                <p><strong>Role:</strong> {invitationData.role}</p>
                <p><strong>Department:</strong> {invitationData.department}</p>
                <p><strong>Position:</strong> {invitationData.position}</p>
              </div>
            </div>
          )}

          <form onSubmit={handlePasswordSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  className={`pr-12 ${errors.password ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-12 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password strength:</span>
                    <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength.score <= 2 ? 'bg-destructive/100' :
                        passwordStrength.score <= 4 ? 'bg-warning/100' : 'bg-success/100'
                      }`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className={`pr-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-12 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  Passwords match
                </div>
              )}
              
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Special characters recommended</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up account...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground font-sans">
            <p>By completing this setup, you agree to our terms of service and privacy policy.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-lg font-semibold mb-2">Loading...</h2>
              <p className="text-muted-foreground">Please wait while we load the setup page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SetupPasswordContent />
    </Suspense>
  );
}
