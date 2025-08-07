
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Users, Mail, Phone, KeyRound, Loader2, Shield, BookOpen, CheckCircle, XCircle } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';


const COURSES = [
    { id: "cde", name: "Certificate in Data Engineering" },
    { id: "cva", name: "Certificate in Visual Analytics" },
    { id: "ccse", name: "Certificate in Cyber Security Essentials" },
    { id: "deal", name: "Data Engineering Associate Level" },
    { id: "vaal", name: "Visual Analytics Associate Level" },
    { id: "csal", name: "Cyber Security Associate Level" },
    { id: "depl", name: "Data Engineering Professional Level" },
    { id: "vapl", "name": "Visual Analytics Professional Level" },
    { id: "cspl", name: "Cyber Security Professional Level" },
    { id: "fdp", name: "Freshers Development Program" },
    { id: "csdp", name: "Corporate Stream Development Program" },
];

export default function LecturerDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [lecturer, setLecturer] = React.useState<any>(null);
  const [students, setStudents] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filteredStudents, setFilteredStudents] = React.useState<any[]>([]);
  const [courseFilter, setCourseFilter] = React.useState<string>("all");

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  React.useEffect(() => {
     try {
      const loggedInLecturer = sessionStorage.getItem('loggedInLecturer');
      if (!loggedInLecturer) {
        router.push('/lecturer/login');
        return;
      }
      const lecturerData = JSON.parse(loggedInLecturer);
      setLecturer(lecturerData);

      // Retrieve all student data from localStorage
      const allStudents = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_')) {
          const studentData = localStorage.getItem(key);
          if (studentData) {
            const student = JSON.parse(studentData);
            
            // Check if student is active and enrolled in one of the lecturer's courses
             if (student.status === 'active' && student.courses.some((courseId: string) => lecturerData.courses.includes(courseId))) {
                 // Initialize attendance if it doesn't exist
                if (!student.attendance) {
                    student.attendance = [];
                }
                allStudents.push(student);
            }
          }
        }
      }
      setStudents(allStudents);
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
      sessionStorage.removeItem('loggedInLecturer');
    } catch (e) {
      console.error("Could not clear session storage", e);
    }
    router.push('/lecturer/login');
  };

  const handleMarkAttendance = (studentNic: string, status: 'present' | 'absent') => {
    try {
        const studentToUpdate = students.find(s => s.nic === studentNic);
        if (studentToUpdate) {
            const todayAttendanceIndex = studentToUpdate.attendance.findIndex((att: any) => att.date === today);

            let updatedAttendance;
            if (todayAttendanceIndex > -1) {
                // Update existing entry for today
                updatedAttendance = [...studentToUpdate.attendance];
                updatedAttendance[todayAttendanceIndex] = { date: today, status };
            } else {
                // Add new entry for today
                updatedAttendance = [...studentToUpdate.attendance, { date: today, status }];
            }

            const updatedStudent = { ...studentToUpdate, attendance: updatedAttendance };

            localStorage.setItem(`user_${studentNic}`, JSON.stringify(updatedStudent));

            // Optimistically update the local state to re-render the UI
            setStudents(prevStudents => prevStudents.map(s => s.nic === studentNic ? updatedStudent : s));

            toast({
                title: 'Success',
                description: `Marked ${studentToUpdate.fullName} as ${status} for today.`,
            });
        }
    } catch (e) {
        console.error("Error marking attendance", e);
        toast({ title: "Error", description: "Failed to mark attendance.", variant: "destructive" });
    }
  };

  const getAttendanceStatusForToday = (student: any): 'present' | 'absent' | 'unmarked' => {
      const todayAttendance = student.attendance.find((att: any) => att.date === today);
      return todayAttendance ? todayAttendance.status : 'unmarked';
  }

  const getLecturerCourses = () => {
      if (!lecturer || !lecturer.courses) return [];
      return COURSES.filter(course => lecturer.courses.includes(course.id));
  };


  if (isLoading || !lecturer) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Lecturer Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-4">
           <Logo />
           <h1 className="text-xl font-semibold flex items-center gap-2"><Shield />Lecturer Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-lg">{lecturer.username}</p>
          </div>
          <Avatar className="h-12 w-12">
            <AvatarFallback>{lecturer.username[0].toUpperCase()}</AvatarFallback>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle>My Students ({filteredStudents.length})</CardTitle>
                    <CardDescription>
                      View your students and mark attendance for today ({new Date().toLocaleDateString()}).
                    </CardDescription>
                </div>
                <div className="w-full sm:w-64">
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger>
                            <BookOpen className="mr-2"/>
                            <SelectValue placeholder="Filter by your courses..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All My Courses</SelectItem>
                            {getLecturerCourses().map(course => (
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
                  <TableHead className="text-center">Attendance for Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const attendanceStatus = getAttendanceStatusForToday(student);
                    return (
                    <TableRow key={student.nic}>
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
                       <TableCell className="text-center">
                            <div className="flex justify-center items-center gap-2">
                                <Button
                                    size="sm"
                                    variant={attendanceStatus === 'present' ? 'default' : 'outline'}
                                    onClick={() => handleMarkAttendance(student.nic, 'present')}
                                >
                                    <CheckCircle className="mr-2"/> Present
                                </Button>
                                 <Button
                                    size="sm"
                                    variant={attendanceStatus === 'absent' ? 'destructive' : 'outline'}
                                    onClick={() => handleMarkAttendance(student.nic, 'absent')}
                                >
                                     <XCircle className="mr-2"/> Absent
                                </Button>
                            </div>
                            {attendanceStatus !== 'unmarked' && (
                                <Badge variant={attendanceStatus === 'present' ? 'default' : 'destructive'} className="mt-2">
                                    Status: {attendanceStatus}
                                </Badge>
                            )}
                       </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No students found for your assigned courses.
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
