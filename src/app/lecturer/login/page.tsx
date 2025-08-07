
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Lock, ArrowRight, Loader2, Shield } from 'lucide-react';

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

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LecturerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setIsLoggingIn(true);
    
    setTimeout(() => {
      try {
        const storedLecturer = localStorage.getItem(`lecturer_${values.username}`);
        if (storedLecturer) {
          const lecturer = JSON.parse(storedLecturer);
          if (lecturer.status === 'disabled') {
            toast({
              title: 'Account Disabled',
              description: 'Your account has been disabled. Please contact an administrator.',
              variant: 'destructive',
            });
            setIsLoggingIn(false);
            return;
          }
          if (lecturer.password === values.password) {
            toast({
              title: 'Lecturer Login Successful',
              description: 'Redirecting to the lecturer dashboard...',
            });
            sessionStorage.setItem('isLecturerLoggedIn', 'true');
            router.push('/lecturer/dashboard');
          } else {
             toast({
              title: 'Error',
              description: 'Invalid lecturer credentials.',
              variant: 'destructive',
            });
            setIsLoggingIn(false);
          }
        } else {
            toast({
              title: 'Error',
              description: 'Invalid lecturer credentials.',
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
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="flex flex-col items-center space-y-4 text-center">
          <Logo />
          <CardTitle className="text-3xl font-bold flex items-center gap-2"><Shield />Lecturer Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access the lecturer dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="lecturer.username"
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
