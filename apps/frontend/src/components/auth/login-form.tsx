'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas/auth.schema';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/contexts/session-context';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from '@/lib/toast';
import { getUserFromToken } from '@/utils/auth';
import { setToken, setRefreshToken } from '@/utils/cookies';
import { useLoginMutation } from '@/generated/graphql';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(
    searchParams.get('error') || '',
  );

  const [login] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (formData: LoginFormData) => {
    setServerError('');

    try {
      const { data } = await login({
        variables: { input: formData },
      });

      if (!data?.login) {
        toast.error('Failed to login', 'Authentication failed');
        return;
      }

      const { accessToken, refreshToken } = data.login;

      setToken(accessToken);
      setRefreshToken(refreshToken);

      const jwtUser = getUserFromToken(accessToken);
      if (jwtUser) {
        setUser(jwtUser);
      }

      toast.success('Success', 'Logged in successfully');
      router.push('/dashboard');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid email or password';
      setServerError(message);
      toast.error('Error logging in', message);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <p className="text-center text-sm">Enter your credentials to sign in</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {serverError && (
            <div className="text-sm text-red-500 text-center">
              {serverError}
            </div>
          )}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            <a
              href="/forgot-password"
              className="underline underline-offset-4 hover:text-primary"
            >
              Forgot your password?
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
