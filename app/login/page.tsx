'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define form schema
const formSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSetupMode, setIsSetupMode] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });
  
  // Get the redirect path from URL query parameters
  const redirectPath = searchParams.get('from') || '/';

  // Check if we need to set up a password
  useEffect(() => {
    const checkPasswordSetup = async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'check-setup-only' })
        });
        
        // If we get a 500 error with message about initialization, we need to setup
        const data = await response.json();
        if (response.status === 500 && data.error === 'Authentication system not initialized') {
          setIsSetupMode(true);
        }
      } catch (error) {
        // If there's an error, assume we need to set up
        setIsSetupMode(true);
      }
    };
    
    checkPasswordSetup();
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      // Determine which API endpoint to use based on mode
      const endpoint = isSetupMode ? '/api/auth/setup' : '/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'Authentication failed');
        return;
      }
      
      if (isSetupMode) {
        toast.success('Password set successfully');
        setIsSetupMode(false);
        form.reset();
        return;
      }
      
      // If login is successful, store the token in a cookie
      document.cookie = `auth-token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      
      toast.success('Login successful');
      
      // Redirect to the original destination or the home page
      router.push(redirectPath);
      
    } catch (error) {
      toast.error('An error occurred during authentication');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isSetupMode ? 'Create Password' : 'Login to Household Manager'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSetupMode 
              ? 'Set up a password that everyone who needs access will know'
              : 'Enter the shared password to access the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={isSetupMode ? "Create a password" : "Enter password"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {isSetupMode ? 'Create Password' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {isSetupMode && (
            <p className="text-sm text-muted-foreground">
              This password will be shared with all authorized users.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}