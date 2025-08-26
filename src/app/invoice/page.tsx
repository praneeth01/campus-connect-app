
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Mail,
  KeyRound,
  BookOpen,
  ArrowRight,
  Receipt,
  Loader2,
  ArrowLeft,
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
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as UiTableFooter,
} from '@/components/ui/table';
import Link from 'next/link';
import { Suspense } from 'react';


const COURSES = [
    { id: "cde", name: "Certificate in Data Engineering", price: 25000 },
    { id: "cva", name: "Certificate in Visual Analytics", price: 25000 },
    { id: "ccse", name: "Certificate in Cyber Security Essentials", price: 25000 },
    { id: "deal", name: "Data Engineering Associate Level", price: 50000 },
    { id: "vaal", name: "Visual Analytics Associate Level", price: 50000 },
    { id: "csal", name: "Cyber Security Associate Level", price: 50000 },
    { id: "depl", name: "Data Engineering Professional Level", price: 75000 },
    { id: "vapl", name: "Visual Analytics Professional Level", price: 75000 },
    { id: "cspl", name: "Cyber Security Professional Level", price: 75000 },
    { id: "fdp", name: "Freshers Development Program", price: 100000 },
    { id: "csdp", name: "Corporate Stream Development Program", price: 120000 },
];

function InvoiceDisplay() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [student, setStudent] = React.useState<any>(null);
  const [totalCost, setTotalCost] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
        const nic = searchParams.get('nic');
        if (nic) {
            const studentData = localStorage.getItem(`user_${nic}`);
            if (studentData) {
                const studentJson = JSON.parse(studentData);
                setStudent(studentJson);

                const newTotal = (studentJson.courses || []).reduce((acc: number, courseId: string) => {
                    const course = COURSES.find((c) => c.id === courseId);
                    return acc + (course?.price || 0);
                }, 0);
                setTotalCost(newTotal);

            } else {
                toast({ title: "Error", description: "Could not find student data.", variant: "destructive" });
                router.push('/dashboard');
            }
        } else {
             toast({ title: "Error", description: "No student specified.", variant: "destructive" });
             router.push('/dashboard');
        }
    } catch(e) {
        console.error("Could not process invoice", e);
        router.push('/dashboard');
    } finally {
        setIsLoading(false);
    }
  }, [searchParams, router, toast]);

  const handlePayNow = () => {
    // This is where you would integrate with a real payment gateway.
    // For now, we'll just show a toast message.
    toast({
        title: "Payment Gateway",
        description: "This is a placeholder. No real payment will be processed.",
    });
  };

  if (isLoading || !student) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Invoice...</p>
        </div>
    )
  }

  const selectedStudentCourses = (student.courses || []).map((courseId: string) => {
      return COURSES.find(c => c.id === courseId);
  }).filter(Boolean); // Filter out any undefined courses

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="absolute top-4 left-4">
            <Button asChild variant="outline">
              <Link href="/dashboard"><ArrowLeft className="mr-2"/> Back to Dashboard</Link>
            </Button>
        </div>
        <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-8 bg-muted/30">
            <div>
                <Logo />
                <CardTitle className="text-4xl font-bold text-primary mt-4">Invoice</CardTitle>
                <CardDescription>Thank you for your registration.</CardDescription>
            </div>
            <div className="text-right">
                <h3 className="font-bold text-lg">{student.fullName}</h3>
                <p className="text-sm text-muted-foreground">{student.nic}</p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
                <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            </div>
        </CardHeader>
        <CardContent className="p-8">
            <p className="text-muted-foreground mb-4">Please find the details of your course registration fees below.</p>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[70%]">Course Name</TableHead>
                    <TableHead className="text-right">Amount (LKR)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {selectedStudentCourses.map((course: any) => (
                        <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell className="text-right">{course.price.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                 <UiTableFooter>
                    <TableRow className="text-lg">
                    <TableCell className="font-bold">Total Amount</TableCell>
                    <TableCell className="text-right font-bold text-primary">LKR {totalCost.toLocaleString()}</TableCell>
                    </TableRow>
                </UiTableFooter>
            </Table>
        </CardContent>
        <CardFooter className="bg-muted/30 p-8 flex justify-end">
            <Button size="lg" className="text-lg" onClick={handlePayNow}>
                Pay Now <ArrowRight className="ml-2" />
            </Button>
        </CardFooter>
        </Card>
    </div>
  );
}


export default function InvoicePage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen w-full flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Page...</p>
            </div>
        }>
            <InvoiceDisplay />
        </Suspense>
    )
}
