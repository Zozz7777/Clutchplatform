"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
// import { useTranslations } from "next-intl";

// Prevent static generation for this page
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Safe auth context access
  let login: (email: string, password: string) => Promise<boolean>;
  try {
    const authContext = useAuth();
    login = authContext.login;
  } catch (error) {
    console.warn('Auth context error:', error);
    login = async () => false; // Fallback function
  }
  
  const router = useRouter();
  
  // Fallback translation function
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'auth.login': 'Login',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.signingIn': 'Signing in...',
      'auth.invalidCredentials': 'Invalid email or password',
      'auth.loginError': 'Login failed. Please try again.',
      'auth.enterEmail': 'Enter your email',
      'auth.enterPassword': 'Enter your password',
      'auth.showPassword': 'Show password',
      'auth.hidePassword': 'Hide password',
      'auth.forgotPassword': 'Forgot your password?',
      'auth.rememberMe': 'Remember me',
      'auth.noAccount': "Don't have an account?",
      'auth.signUp': 'Sign up',
      'auth.welcomeBack': 'Welcome back',
      'auth.signInToAccount': 'Sign in to your account',
      'auth.continue': 'Continue',
      'auth.or': 'or',
      'auth.withGoogle': 'Continue with Google',
      'auth.withMicrosoft': 'Continue with Microsoft',
      'auth.withApple': 'Continue with Apple',
      'auth.terms': 'Terms of Service',
      'auth.privacy': 'Privacy Policy',
      'auth.agreeTo': 'By continuing, you agree to our',
      'auth.and': 'and'
    };
    return translations[key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/dashboard");
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.errorOccurred');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
      <Card className="w-full max-w-md shadow-sm border border-border rounded-[0.625rem] bg-card">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-[0.625rem]">
              <img
                src="/logo.png"
                alt="Clutch"
                width={80}
                height={80}
                className="object-contain max-w-full max-h-full"
                onError={(e) => {
                  // Hide the image and show text fallback
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-2xl font-bold text-primary">CLUTCH</div>';
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-card-foreground font-sans">{t('auth.clutchAdmin')}</CardTitle>
            <CardDescription className="text-muted-foreground font-sans text-base">
              {t('auth.signInToDrive')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@yourclutch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 text-base border border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.enterPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 pr-12 text-base border border-border bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-destructive bg-destructive/10">
                <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              size="lg"
              className="w-full h-12 text-base font-medium focus:ring-2 focus:ring-ring focus:ring-offset-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.signingIn')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}

// Error boundary component
class LoginErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Login page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
          <Card className="w-full max-w-md shadow-sm border border-border rounded-[0.625rem] bg-card">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-[0.625rem]">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold text-foreground">Login Error</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Something went wrong while loading the login page. Please refresh the page.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
                variant="default"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LoginErrorBoundary>
      <LoginForm />
    </LoginErrorBoundary>
  );
}
