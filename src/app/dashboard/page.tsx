
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  LogOut,
  CalendarDays,
  Clock,
  Briefcase,
  Lock,
  Loader2,
  BookOpen,
  CheckCircle,
  XCircle,
  FileText,
  Award,
  HelpCircle,
  Settings,
  Bell,
  BarChart2,
  Download,
  Mail,
  MessageSquare,
  Receipt,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

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
            // Fetch the latest student data from localStorage to get attendance updates
            const userJson = JSON.parse(loggedInUser);
            const latestData = localStorage.getItem(`user_${userJson.nic}`);
            if (latestData) {
              setStudent(JSON.parse(latestData));
            } else {
              setStudent(userJson);
            }

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
  
  const calculateAttendance = () => {
      if (!student || !student.attendance || student.attendance.length === 0) {
          return 0;
      }
      const presentDays = student.attendance.filter((a: any) => a.status === 'present').length;
      return (presentDays / student.attendance.length) * 100;
  };

  if (!student) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }
  
  const attendancePercentage = calculateAttendance();
  
  // Sample Data
  const sampleData = {
      batch: 'Data Engineering - DE24-1',
      room: 'Room 302',
      nextClass: { date: '2024-08-10T10:00:00', topic: 'Advanced SQL' },
      instructor: 'Dr. Evelyn Reed',
      assignments: [
          { id: 1, title: 'SQL Query Optimization', due: '2024-08-15', status: 'Submitted', grade: 'A' },
          { id: 2, title: 'Data Warehouse Design', due: '2024-08-22', status: 'Pending', grade: null },
      ],
      announcements: [
          { id: 1, text: 'Guest lecture on "Big Data Technologies" on Aug 18th.' },
          { id: 2, text: 'Class on Aug 12th is moved to Room 204.' },
      ],
      performance: {
          lastTest: '88%',
          feedback: 'Excellent progress in data modeling concepts.'
      },
      studyMaterials: [
        { id: 1, name: 'Lecture 5 Notes - SQL.pdf', url: '#' },
        { id: 2, name: 'Data Warehousing Basics.pdf', url: '#' },
      ]
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
             <Logo />
             <div className="flex items-center gap-4">
                 <div className="text-right">
                     <p className="font-semibold text-lg">{student.fullName}</p>
                     <p className="text-sm text-muted-foreground">{student.nic}</p>
                 </div>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={photoPreview || undefined} alt={student.fullName} />
                    <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5"/>
                    <span className="sr-only">Logout</span>
                </Button>
             </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 grid gap-8">
            {/* Welcome Section */}
            <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="text-3xl">Welcome back, {student.salutation} {student.fullName.split(' ')[0]}!</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                        {sampleData.batch} | Classroom: {sampleData.room}
                    </CardDescription>
                </CardHeader>
            </Card>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Schedule Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CalendarDays className="text-primary"/>Class Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg border bg-muted/50">
                                <p className="font-semibold text-lg">Next Class: {sampleData.nextClass.topic}</p>
                                <p className="text-muted-foreground">
                                    {new Date(sampleData.nextClass.date).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-sm text-muted-foreground">Instructor: {sampleData.instructor}</p>
                            </div>
                            <Button variant="outline" className="w-full">
                                <CalendarDays className="mr-2"/> View Full Calendar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Assignments Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/>Assignments & Homework</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {sampleData.assignments.map(a => (
                                    <li key={a.id} className="flex items-center justify-between p-3 rounded-md border">
                                        <div>
                                            <p className="font-semibold">{a.title}</p>
                                            <p className="text-sm text-muted-foreground">Due: {new Date(a.due).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {a.grade && <Badge variant="secondary">Grade: {a.grade}</Badge>}
                                            <Badge variant={a.status === 'Submitted' ? 'default' : 'destructive'}>{a.status}</Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Announcements & Study Materials */}
                     <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bell className="text-primary"/>Announcements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {sampleData.announcements.map(an => (
                                        <li key={an.id} className="flex items-start gap-3">
                                            <Bell className="h-4 w-4 mt-1 text-primary/70"/>
                                            <p className="text-sm text-muted-foreground">{an.text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/>Study Materials</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {sampleData.studyMaterials.map(m => (
                                         <li key={m.id}>
                                            <a href={m.url} className="flex items-center justify-between p-3 rounded-md border text-sm font-medium hover:bg-muted/50 transition-colors">
                                                {m.name}
                                                <Download className="h-4 w-4 text-primary"/>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Attendance & Performance */}
                     <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2"><BarChart2 className="text-primary"/>Progress Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold">Overall Attendance</p>
                                    <p className="font-bold text-primary">{attendancePercentage.toFixed(1)}%</p>
                                </div>
                                 <Progress value={attendancePercentage} className="h-2.5" />
                                <Button variant="link" className="p-0 h-auto mt-1">View Details</Button>
                            </div>
                             <Separator />
                            <div>
                                <p className="font-semibold">Last Test Score</p>
                                <p className="text-2xl font-bold text-primary">{sampleData.performance.lastTest}</p>
                                <p className="text-sm text-muted-foreground italic">"{sampleData.performance.feedback}"</p>
                            </div>
                        </CardContent>
                    </Card>

                     {/* Support & Contact */}
                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary"/>Support & Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                           <Button variant="outline" className="w-full"><Mail className="mr-2"/>Contact Instructor</Button>
                           <Button variant="outline" className="w-full"><MessageSquare className="mr-2"/>Raise a Query</Button>
                        </CardContent>
                    </Card>

                     {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings className="text-primary"/>Profile & Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-4">
                                    <FormField control={form.control} name="currentPassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField control={form.control} name="newPassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isUpdatingPassword} className="w-full">
                                        {isUpdatingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Update Password'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  );
}
