
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, User, Users, Mail, Phone, KeyRound, Loader2, Shield, BookOpen, Trash2, PlusCircle, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const lecturerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


const COURSES = [
    { id: "cde", name: "Certificate in Data Engineering" },
    { id: "cva", name: "Certificate in Visual Analytics" },
    { id: "ccse", name: "Certificate in Cyber Security Essentials" },
    { id: "deal", name: "Data Engineering Associate Level" },
    { id: "vaal", name: "Visual Analytics Associate Level" },
    { id: "csal", name: "Cyber Security Associate Level" },
    { id: "depl", name: "Data Engineering Professional Level" },
    { id: "vapl", name: "Visual Analytics Professional Level" },
    { id: "cspl", name: "Cyber Security Professional Level" },
    { id: "fdp", name: "Freshers Development Program" },
    { id: "csdp", name: "Corporate Stream Development Program" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = React.useState<any[]>([]);
  const [lecturers, setLecturers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filteredStudents, setFilteredStudents] = React.useState<any[]>([]);
  const [courseFilter, setCourseFilter] = React.useState<string>("all");
  const [studentToDelete, setStudentToDelete] = React.useState<any | null>(null);
  const [lecturerToDelete, setLecturerToDelete] = React.useState<any | null>(null);

  const form = useForm<z.infer<typeof lecturerSchema>>({
    resolver: zodResolver(lecturerSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  React.useEffect(() => {
    try {
      const isAdmin = sessionStorage.getItem('isAdminLoggedIn');
      if (!isAdmin) {
        router.push('/admin/login');
        return;
      }

      // Retrieve all student and lecturer data from localStorage
      const registeredStudents = [];
      const createdLecturers = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            if (key.startsWith('user_')) {
                const studentData = localStorage.getItem(key);
                if (studentData) {
                    const student = JSON.parse(studentData);
                    // Ensure status exists
                    if (!student.hasOwnProperty('status')) {
                        student.status = 'active';
                    }
                    registeredStudents.push(student);
                }
            } else if (key.startsWith('lecturer_')) {
                const lecturerData = localStorage.getItem(key);
                if (lecturerData) {
                    const lecturer = JSON.parse(lecturerData);
                    if (!lecturer.hasOwnProperty('status')) {
                        lecturer.status = 'active';
                    }
                    createdLecturers.push(lecturer);
                }
            }
        }
      }
      setStudents(registeredStudents);
      setFilteredStudents(registeredStudents);
      setLecturers(createdLecturers);
    } catch (e) {
      console.error("Could not get user data from storage", e);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    if (courseFilter === "all") {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(student => student.courses.includes(courseFilter)));
    }
  }, [courseFilter, students]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('isAdminLoggedIn');
    } catch (e) {
      console.error("Could not clear session storage", e);
    }
    router.push('/admin/login');
  };
  
  const handleDeleteStudent = () => {
    if (!studentToDelete) return;
    try {
        localStorage.removeItem(`user_${studentToDelete.nic}`);

        const updatedStudents = students.filter(s => s.nic !== studentToDelete.nic);
        setStudents(updatedStudents);
        // setFilteredStudents is handled by the useEffect
        toast({ title: "Success", description: `Student account "${studentToDelete.fullName}" has been deleted.` });

    } catch (e) {
        console.error("Error deleting student data", e);
    } finally {
        setStudentToDelete(null);
    }
  };

  const handleDeleteLecturer = () => {
    if (!lecturerToDelete) return;
    try {
        localStorage.removeItem(`lecturer_${lecturerToDelete.username}`);
        const updatedLecturers = lecturers.filter(l => l.username !== lecturerToDelete.username);
        setLecturers(updatedLecturers);
        toast({ title: "Success", description: `Lecturer account "${lecturerToDelete.username}" has been deleted.` });
    } catch (e) {
        console.error("Error deleting lecturer data", e);
        toast({ title: "Error", description: "Failed to delete lecturer account.", variant: "destructive" });
    } finally {
        setLecturerToDelete(null);
    }
  };

  const onLecturerCreate = (values: z.infer<typeof lecturerSchema>) => {
      try {
        if(localStorage.getItem(`lecturer_${values.username}`)) {
            toast({ title: "Error", description: "A lecturer with this username already exists.", variant: "destructive" });
            return;
        }

        const newLecturer = { ...values, status: 'active' };
        localStorage.setItem(`lecturer_${values.username}`, JSON.stringify(newLecturer));
        setLecturers([...lecturers, newLecturer]);
        toast({ title: "Success", description: `Lecturer account "${values.username}" created successfully.` });
        form.reset();
      } catch (e) {
        console.error("Error creating lecturer account", e);
        toast({ title: "Error", description: "An error occurred while creating the account.", variant: "destructive" });
      }
  };

  const toggleStudentStatus = (studentNic: string) => {
    try {
        const student = students.find(s => s.nic === studentNic);
        if (student) {
            const newStatus = student.status === 'active' ? 'disabled' : 'active';
            const updatedStudent = { ...student, status: newStatus };

            localStorage.setItem(`user_${studentNic}`, JSON.stringify(updatedStudent));

            const updatedStudents = students.map(s => s.nic === studentNic ? updatedStudent : s);
            setStudents(updatedStudents);
        }
    } catch (e) {
        console.error("Error toggling student status", e);
    }
  };

  const toggleLecturerStatus = (lecturerUsername: string) => {
     try {
        const lecturer = lecturers.find(l => l.username === lecturerUsername);
        if (lecturer) {
            const newStatus = lecturer.status === 'active' ? 'disabled' : 'active';
            const updatedLecturer = { ...lecturer, status: newStatus };

            localStorage.setItem(`lecturer_${lecturerUsername}`, JSON.stringify(updatedLecturer));

            const updatedLecturers = lecturers.map(l => l.username === lecturerUsername ? updatedLecturer : l);
            setLecturers(updatedLecturers);
        }
    } catch (e) {
        console.error("Error toggling lecturer status", e);
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-4">
           <Logo />
           <h1 className="text-xl font-semibold flex items-center gap-2"><Shield />Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-lg">Admin</p>
          </div>
          <Avatar className="h-12 w-12">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 grid gap-8">
         <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the student account
                    for <span className="font-bold">{studentToDelete?.fullName}</span> and remove their data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete student
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={!!lecturerToDelete} onOpenChange={(open) => !open && setLecturerToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Delete Lecturer Account?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the lecturer account for <span className="font-bold">{lecturerToDelete?.username}</span>. They will no longer be able to log in.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteLecturer} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete account
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Registered Students ({filteredStudents.length})</CardTitle>
                            <CardDescription>
                            View and manage all registered student accounts.
                            </CardDescription>
                        </div>
                        <div className="w-full sm:w-64">
                            <Select value={courseFilter} onValueChange={setCourseFilter}>
                                <SelectTrigger>
                                    <BookOpen className="mr-2"/>
                                    <SelectValue placeholder="Filter by course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {COURSES.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <TableRow key={student.nic} className={student.status === 'disabled' ? 'opacity-50' : ''}>
                            <TableCell>
                                <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{student.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{student.nic}</p>
                                </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground"/>
                                <span>{student.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground"/>
                                <span>{student.contactNo}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {student.courses.map((courseId: string) => (
                                    <Badge key={courseId} variant="secondary">{courseId.toUpperCase()}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                             <TableCell>
                                <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>{student.status}</Badge>
                             </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-4">
                                     <div className="flex items-center space-x-2">
                                        <Switch 
                                            id={`student-status-${student.nic}`} 
                                            checked={student.status === 'active'}
                                            onCheckedChange={() => toggleStudentStatus(student.nic)}
                                        />
                                        <Label htmlFor={`student-status-${student.nic}`}>{student.status === 'active' ? 'Enabled' : 'Disabled'}</Label>
                                    </div>
                                    <Button variant="destructive" size="icon" onClick={() => setStudentToDelete(student)}>
                                        <Trash2 className="h-4 w-4"/>
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                            No students found for the selected filter.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Lecturer Management</CardTitle>
                        <CardDescription>Create and manage lecturer accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onLecturerCreate)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lecturer Username</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                <Input placeholder="e.g., john.doe" {...field} className="pl-10"/>
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
                                                <Input type="password" placeholder="********" {...field} className="pl-10"/>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    <PlusCircle className="mr-2"/> Create Lecturer
                                </Button>
                            </form>
                        </Form>
                        <Separator />
                        <div>
                             <h4 className="text-sm font-medium text-muted-foreground mb-2">Existing Lecturers ({lecturers.length})</h4>
                             <div className="space-y-2">
                                {lecturers.length > 0 ? (
                                    lecturers.map(lecturer => (
                                        <div key={lecturer.username} className={`flex items-center justify-between p-2 border rounded-md ${lecturer.status === 'disabled' ? 'opacity-50' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{lecturer.username[0].toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm">{lecturer.username}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`lecturer-status-${lecturer.username}`}
                                                    checked={lecturer.status === 'active'}
                                                    onCheckedChange={() => toggleLecturerStatus(lecturer.username)}
                                                />
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setLecturerToDelete(lecturer)}>
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No lecturer accounts created yet.</p>
                                )}
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
