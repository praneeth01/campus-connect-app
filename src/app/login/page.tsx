
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Lock, ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { normalizeNic } from '@/lib/nic-normalizer';

const loginSchema = z.object({
  nic: z.string().min(1, { message: 'NIC number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nic: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setIsLoggingIn(true);
    // Simulate API call for login
    setTimeout(() => {
      try {
        const normalizedNic = normalizeNic(values.nic);
        if (!normalizedNic) {
            toast({
                title: "Error",
                description: "Invalid NIC number format.",
                variant: "destructive",
            });
            setIsLoggingIn(false);
            return;
        }

        const storedUser = localStorage.getItem(`user_${normalizedNic}`);
        if (storedUser) {
          const user = JSON.parse(storedUser);
           if (user.status === 'disabled') {
            toast({
              title: 'Account Disabled',
              description: 'Your account has been disabled. Please contact an administrator.',
              variant: 'destructive',
            });
            setIsLoggingIn(false);
            return;
          }
          if (user.password === values.password) {
            toast({
              title: 'Login Successful',
              description: 'Redirecting to your dashboard...',
            });
            // In a real app, you'd set a session token here
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            router.push('/dashboard');
          } else {
            toast({
              title: 'Error',
              description: 'Invalid NIC number or password.',
              variant: 'destructive',
            });
            setIsLoggingIn(false);
          }
        } else {
          toast({
            title: 'Error',
            description: 'Invalid NIC number or password.',
            variant: 'destructive',
          });
          setIsLoggingIn(false);
        }
      } catch (e) {
          toast({
              title: 'Error',
              description: 'An error occurred during login.',
              variant: 'destructive',
            });
            setIsLoggingIn(false);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
       <div className="absolute top-4 right-4">
        <Button asChild variant="outline">
          <Link href="/">Register</Link>
        </Button>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="flex flex-col items-center space-y-4 text-center">
          <Logo />
          <CardTitle className="text-3xl font-bold">Student Login</CardTitle>
          <CardDescription>
            Enter your NIC number and password to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIC Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Your NIC Number"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-right">
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/forgot-password">Forgot Password?</Link>
                </Button>
              </div>
              <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
