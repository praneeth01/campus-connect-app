
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  LogOut,
  BookOpen,
  CalendarDays,
  Clock,
  Briefcase,
  Lock,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';

const COURSES = [
    { id: "cde", name: "Certificate in Data Engineering", price: 25000, duration: "3 Months", schedule: "Sat 9am - 1pm" },
    { id: "cva", name: "Certificate in Visual Analytics", price: 25000, duration: "3 Months", schedule: "Sat 2pm - 6pm" },
    { id: "ccse", name: "Certificate in Cyber Security Essentials", price: 25000, duration: "3 Months", schedule: "Sun 9am - 1pm" },
    { id: "deal", name: "Data Engineering Associate Level", price: 50000, duration: "6 Months", schedule: "Sat 9am - 1pm" },
    { id: "vaal", name: "Visual Analytics Associate Level", price: 50000, duration: "6 Months", schedule: "Sat 2pm - 6pm" },
    { id: "csal", name: "Cyber Security Associate Level", price: 50000, duration: "6 Months", schedule: "Sun 9am - 1pm" },
    { id: "depl", name: "Data Engineering Professional Level", price: 75000, duration: "9 Months", schedule: "Sun 2pm - 6pm" },
    { id: "vapl", name: "Visual Analytics Professional Level", price: 75000, duration: "9 Months", schedule: "Sun 2pm - 6pm" },
    { id: "cspl", name: "Cyber Security Professional Level", price: 75000, duration: "9 Months", schedule: "Sun 2pm - 6pm" },
    { id: "fdp", name: "Freshers Development Program", price: 100000, duration: "12 Months", schedule: "Weekdays (Mon-Fri) 9am - 5pm" },
    { id: "csdp", name: "Corporate Stream Development Program", price: 120000, duration: "12 Months", schedule: "Weekends" },
];

const passwordSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = React.useState<any>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    try {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        const storedPhoto = sessionStorage.getItem('photoPreview');
        if (loggedInUser) {
            setStudent(JSON.parse(loggedInUser));
             if (storedPhoto) {
                setPhotoPreview(storedPhoto);
            }
        } else {
            router.push('/login');
        }
    } catch(e) {
         console.error("Could not get user data from session storage", e);
         router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    try {
        sessionStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('photoPreview');
    } catch (e) {
        console.error("Could not clear session storage", e);
    }
    router.push('/login');
  };
  
  const onChangePassword = (values: z.infer<typeof passwordSchema>) => {
    setIsUpdatingPassword(true);
    // Simulate API call
    setTimeout(() => {
        try {
            const storedUser = localStorage.getItem(`user_${student.nic}`);
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.password === values.currentPassword) {
                    const updatedUser = { ...user, password: values.newPassword };
                    localStorage.setItem(`user_${student.nic}`, JSON.stringify(updatedUser));
                    sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
                    toast({
                        title: 'Success',
                        description: 'Your password has been updated successfully.',
                    });
                    form.reset();
                } else {
                    toast({
                        title: 'Error',
                        description: 'Your current password is incorrect.',
                        variant: 'destructive',
                    });
                }
            }
        } catch (e) {
            toast({
                title: 'Error',
                description: 'An error occurred while changing your password.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    }, 1500);
  };


  if (!student) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }
  
  const studentCourses = (student.courses || []).map((courseId: string) => COURSES.find(c => c.id === courseId)).filter(Boolean);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
            <header className="flex items-center justify-between mb-8">
                 <Logo />
                 <div className="flex items-center gap-4">
                     <div className="text-right">
                         <p className="font-semibold text-lg">{student.fullName}</p>
                         <p className="text-sm text-muted-foreground">{student.nic}</p>
                     </div>
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={photoPreview || undefined} alt={student.fullName} />
                        <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" onClick={handleLogout}>
                        <LogOut className="h-5 w-5"/>
                        <span className="sr-only">Logout</span>
                    </Button>
                 </div>
            </header>

            <main className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl"><BookOpen className="text-primary"/>My Enrolled Courses</CardTitle>
                        <CardDescription>Here are the details for the courses you are currently enrolled in.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {studentCourses.length > 0 ? (
                             studentCourses.map((course: any) => (
                                <Card key={course.id} className="overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold font-headline mb-2">{course.name}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-primary" />
                                                <span><span className="font-semibold text-foreground">Duration:</span> {course.duration}</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-primary" />
                                                <span><span className="font-semibold text-foreground">Schedule:</span> {course.schedule}</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span><span className="font-semibold text-foreground">Next Class:</span> Tomorrow</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-primary/10 px-6 py-3">
                                        <p className="text-sm font-semibold text-primary">Status: Active</p>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <p>You are not enrolled in any courses yet.</p>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl"><Lock className="text-primary"/>Change Password</CardTitle>
                        <CardDescription>Update your account password here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-6 max-w-md">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter your current password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter a new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm your new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isUpdatingPassword}>
                                    {isUpdatingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    </div>
  );
}
