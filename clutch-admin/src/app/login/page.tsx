"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const { login } = useAuth();
  const t = useTranslations() as any;
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

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
