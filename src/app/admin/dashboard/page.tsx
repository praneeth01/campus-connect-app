'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Users, Mail, Phone, KeyRound, Loader2, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [students, setStudents] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const isAdmin = sessionStorage.getItem('isAdminLoggedIn');
      if (!isAdmin) {
        router.push('/admin/login');
        return;
      }

      // Retrieve all student data from localStorage
      const registeredStudents = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
          const studentData = localStorage.getItem(key);
          if (studentData) {
            registeredStudents.push(JSON.parse(studentData));
          }
        }
      }
      setStudents(registeredStudents);
    } catch (e) {
      console.error("Could not get user data from storage", e);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('isAdminLoggedIn');
    } catch (e) {
      console.error("Could not clear session storage", e);
    }
    router.push('/admin/login');
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Registered Students ({students.length})</CardTitle>
            <CardDescription>
              This is a list of all students who have registered through the portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>NIC / Username</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow key={student.nic}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.fullName}</p>
                            <p className="text-sm text-muted-foreground">{student.salutation}</p>
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
                          <div className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-muted-foreground"/>
                            <span>{student.nic}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-wrap gap-1">
                            {student.courses.map((courseId: string) => (
                               <Badge key={courseId} variant="secondary">{courseId.toUpperCase()}</Badge>
                            ))}
                         </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit Details</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No students have registered yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}