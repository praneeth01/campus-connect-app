
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Mail,
  Home,
  FileText,
  DollarSign,
  CreditCard,
  Printer,
  Calendar,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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


export function InvoicePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [student, setStudent] = React.useState<any>(null);
  const [totalCost, setTotalCost] = React.useState(0);
  const [isPaying, setIsPaying] = React.useState(false);

  React.useEffect(() => {
    const nic = searchParams.get('nic');
    if (!nic) {
      toast({ title: 'Error', description: 'Student NIC not provided.', variant: 'destructive' });
      router.push('/dashboard');
      return;
    }

    try {
        const studentData = localStorage.getItem(`user_${nic}`);
        if(studentData) {
            const parsedStudent = JSON.parse(studentData);
            setStudent(parsedStudent);

            const newTotal = (parsedStudent.courses || []).reduce((acc: number, courseId: string) => {
                const course = COURSES.find((c) => c.id === courseId);
                return acc + (course?.price || 0);
            }, 0);
            setTotalCost(newTotal);

        } else {
             toast({ title: 'Error', description: 'Could not find student data.', variant: 'destructive' });
             router.push('/dashboard');
        }
    } catch (e) {
        console.error("Error fetching student data", e);
        toast({ title: 'Error', description: 'An error occurred while fetching student data.', variant: 'destructive' });
    }
  }, [searchParams, router, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handlePayment = () => {
    setIsPaying(true);
    // Simulate a payment process
    setTimeout(() => {
        toast({
            title: 'Payment Successful',
            description: 'Thank you for your payment!',
        });
        setIsPaying(false);
    }, 2000);
  }

  if (!student) {
    return null; // The suspense fallback in page.tsx will be shown
  }
  
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 14);


  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted p-4 sm:p-6 lg:p-8 print:bg-white print:p-0">
        <div className="absolute top-4 left-4 print:hidden">
            <Button asChild variant="outline">
                <Link href="/dashboard"><Home className="mr-2"/>Dashboard</Link>
            </Button>
        </div>
      <Card className="w-full max-w-4xl shadow-2xl print:shadow-none print:border-none">
        <CardHeader className="bg-muted/50 p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
             <div>
                <Logo />
                <h1 className="text-sm text-muted-foreground mt-2">
                    123 Learning Street, Colombo, Sri Lanka
                </h1>
             </div>
             <div className="text-right">
                <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
                <p className="text-muted-foreground">#INV-{student.nic.slice(-4)}-{today.getFullYear()}</p>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-semibold mb-2">Bill To:</h3>
                    <p className="font-bold text-lg">{student.fullName}</p>
                    <p>{student.email}</p>
                    <p>{student.contactNo}</p>
                </div>
                <div className="text-right">
                    <div className="grid grid-cols-2 gap-y-1">
                        <span className="font-semibold">Invoice Date:</span>
                        <span>{today.toLocaleDateString()}</span>
                        <span className="font-semibold">Due Date:</span>
                        <span>{dueDate.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Course Description</TableHead>
                    <TableHead className="text-right">Amount (LKR)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(student.courses || []).map((courseId: string) => {
                        const course = COURSES.find(c => c.id === courseId);
                        return (
                             <TableRow key={courseId}>
                                <TableCell className="font-medium">{course?.name}</TableCell>
                                <TableCell className="text-right">{course?.price.toLocaleString()}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            
            <Separator className="my-6"/>

            <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="font-semibold">Subtotal</span>
                        <span>LKR {totalCost.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold">Tax (0%)</span>
                        <span>LKR 0.00</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between text-xl font-bold text-primary">
                        <span>Total</span>
                        <span>LKR {totalCost.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground">
                <p>Thank you for your enrollment! If you have any questions, please contact us at info@campusconnect.edu.</p>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 rounded-b-lg flex justify-end gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2"/> Print Invoice
            </Button>
            <Button onClick={handlePayment} disabled={isPaying}>
                {isPaying ? <><CreditCard className="mr-2 animate-pulse"/>Processing...</> : <><CreditCard className="mr-2"/> Pay Now</>}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
