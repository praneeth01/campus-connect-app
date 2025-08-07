'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Printer, FileText, ArrowLeft, Loader2 } from 'lucide-react';

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
  TableFooter
} from '@/components/ui/table';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';

export default function InvoicePage() {
    const router = useRouter();
    const [invoiceData, setInvoiceData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    
    React.useEffect(() => {
        try {
            const dataString = sessionStorage.getItem('registrationFormData');
            if (dataString) {
                setInvoiceData(JSON.parse(dataString));
            } else {
                router.push('/'); // Redirect if no data found
            }
        } catch (e) {
            console.error('Failed to parse invoice data', e);
            router.push('/');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const handlePrint = () => {
        window.print();
    };

    const handleBackToHome = () => {
        try {
            sessionStorage.removeItem('registrationFormData');
            sessionStorage.removeItem('photoPreview');
        } catch (e) {
            console.error('Could not clear session storage', e);
        }
        router.push('/login');
    }

    if (isLoading || !invoiceData) {
        return (
             <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Your Invoice...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-end print:hidden">
                    <Button variant="outline" onClick={handleBackToHome}>
                        <ArrowLeft className="mr-2"/> Back to Login
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2" /> Print Invoice
                    </Button>
                </div>
                <Card className="w-full shadow-lg" id="invoice-content">
                    <CardHeader className="bg-muted/30 p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                            <div>
                                <Logo />
                                <p className="text-muted-foreground mt-2">
                                    No. 123, Galle Road, Colombo 03, Sri Lanka
                                </p>
                            </div>
                            <div className="text-right">
                                <CardTitle className="text-4xl font-bold text-primary">INVOICE</CardTitle>
                                <p className="text-muted-foreground">Invoice #: INV-{String(Date.now()).slice(-6)}</p>
                                <p className="text-muted-foreground">Date: {new Date(invoiceData.paymentDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <p className="text-[12rem] font-black text-green-500/10 rotate-[-15deg] select-none">PAID</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
                                <p className="font-bold text-primary">{invoiceData.fullName}</p>
                                <p className="text-muted-foreground">{invoiceData.email}</p>
                                <p className="text-muted-foreground">{invoiceData.contactNo}</p>
                                <p className="text-muted-foreground">NIC: {invoiceData.nic}</p>
                            </div>
                        </div>
                        
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60%]">Course Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoiceData.courses.map((course: any) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.name}</TableCell>
                                        <TableCell className="text-right">LKR {course.price.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell className="text-right font-bold text-lg">Total Amount</TableCell>
                                    <TableCell className="text-right font-bold text-lg text-primary">LKR {invoiceData.totalCost.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                        
                        <Separator className="my-8" />
                        
                        <div className="text-center text-muted-foreground text-sm">
                            <p>Thank you for your payment!</p>
                            <p>This is a computer-generated invoice and does not require a signature.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                @media print {
                    body {
                        background: #fff;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                    #invoice-content {
                        box-shadow: none;
                        border: none;
                    }
                }
            `}</style>
        </div>
    );
}
