'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowLeft, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Link from "next/link";
import SocialAuth from "@/components/auth/social-auth";

const commonEmailDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com'];

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', color: '' };
    if (password.length < 8) return { strength: 'Weak', color: 'bg-red-500' };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strength <= 2) return { strength: 'Weak', color: 'bg-red-500' };
    if (strength === 3) return { strength: 'Medium', color: 'bg-yellow-500' };
    return { strength: 'Strong', color: 'bg-green-500' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Handle email suggestions
    if (name === 'email' && !value.includes('@')) {
      const suggestions = commonEmailDomains.map(domain => `${value}${domain}`);
      setEmailSuggestions(suggestions);
    } else {
      setEmailSuggestions([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Check if email exists using sign-in attempt
      const { error: checkError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false, // This ensures we only check if the user exists
        }
      });

      if (!checkError) {
        setErrors({
          email: 'This email is already registered. Please sign in instead.',
        });
        setIsLoading(false);
        return;
      }

      // Proceed with signup if email doesn't exist
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Send welcome email
      const response = await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send welcome email');
      }

      setErrors({
        success: 'Please check your email for the confirmation link.',
      });

      // Don't redirect immediately, let user see the success message
      setTimeout(() => {
        router.push('/login');
      }, 5000);

    } catch (error) {
      setErrors({
        general: error.message || 'An error occurred during sign up.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Button
        type="button"
        variant="ghost"
        className="absolute left-4 top-4 text-gray-400 hover:text-white"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <Card className="w-full max-w-md bg-gray-800/50 shadow-xl backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">Create Account</CardTitle>
          <CardDescription className="text-gray-400 text-center">Join Helia AI and start chatting with our AI companions</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500",
                    "focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                    errors.fullName && "border-red-500 focus:ring-red-500/50"
                  )}
                  autoFocus
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-4 w-4" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500",
                    "focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                    errors.email && "border-red-500 focus:ring-red-500/50"
                  )}
                />
              </div>
              {emailSuggestions.length > 0 && (
                <div className="absolute z-10 w-full max-w-md bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                  {emailSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, email: suggestion }));
                        setEmailSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-4 w-4" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500",
                    "focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                    errors.password && "border-red-500 focus:ring-red-500/50"
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-500 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all", passwordStrength.color)} style={{ width: formData.password ? '100%' : '0%' }} />
                  </div>
                  <p className={cn(
                    "text-sm",
                    passwordStrength.strength === 'Strong' && "text-green-500",
                    passwordStrength.strength === 'Medium' && "text-yellow-500",
                    passwordStrength.strength === 'Weak' && "text-red-500"
                  )}>
                    {passwordStrength.strength} Password
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-4 w-4" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500",
                    "focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                    errors.confirmPassword && "border-red-500 focus:ring-red-500/50"
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-500 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-4 w-4" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Success/Error Messages */}
            {errors.success && (
              <Alert className="bg-green-900/20 border-green-900">
                <Check className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">{errors.success}</AlertDescription>
              </Alert>
            )}
            {errors.general && (
              <Alert className="bg-red-900/20 border-red-900">
                <X className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-500">{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800/50 px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <SocialAuth onSuccess={() => router.push('/chat')} />
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="text-primary hover:text-primary/90 p-0"
              onClick={() => router.push('/login')}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
