'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, Apple, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [autoFocus, setAutoFocus] = useState(false);

  useEffect(() => {
    // Set autofocus after component mounts
    setAutoFocus(true);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formState.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formState.password) {
      newErrors.password = 'Password is required';
    } else if (formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Add your authentication logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      router.push('/chat');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      // Add your social login logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      router.push('/chat');
    } catch (error) {
      toast({
        title: "Error",
        description: \`Failed to sign in with \${provider}\`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-gray-800/50 p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-400">Sign in to continue to Helia AI</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-transparent text-white hover:bg-white/10"
            onClick={() => handleSocialLogin('Google')}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-transparent text-white hover:bg-white/10"
            onClick={() => handleSocialLogin('Apple')}
            disabled={isLoading}
          >
            <Apple className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800/50 px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={cn(
                  "pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500",
                  "focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                  errors.email && "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                )}
                value={formState.email}
                onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                autoFocus={autoFocus}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={cn(
                  "pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500",
                  "focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                  errors.password && "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                )}
                value={formState.password}
                onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
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
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formState.rememberMe}
                onCheckedChange={(checked) => 
                  setFormState(prev => ({ ...prev, rememberMe: checked }))
                }
                className="border-gray-700 data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-gray-400 cursor-pointer select-none"
              >
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-sm text-primary hover:text-primary/90"
              onClick={() => router.push('/forgot-password')}
            >
              Forgot password?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Button
            variant="link"
            className="text-primary hover:text-primary/90 p-0"
            onClick={() => router.push('/signup')}
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
}
