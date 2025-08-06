'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [totalCost, setTotalCost] = React.useState(0);
    const paymentUrl = searchParams.get('paymentUrl');

     React.useEffect(() => {
        if (paymentUrl) {
            const url = new URL(decodeURIComponent(paymentUrl));
            const amount = url.searchParams.get('amount');
            setTotalCost(Number(amount) || 0);
        }
    }, [paymentUrl]);

    const handlePayNow = () => {
        if (paymentUrl) {
            setIsProcessing(true);
            // Simulate API call to payment gateway
            setTimeout(() => {
                 window.location.href = decodeURIComponent(paymentUrl);
            }, 2000);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-md shadow-2xl text-center">
                <CardHeader className="flex flex-col items-center space-y-4">
                    <Logo />
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <CardTitle className="text-3xl font-bold">Registration Completed!</CardTitle>
                    <CardDescription>
                        Your registration details have been saved. Please proceed to payment to finalize your enrollment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handlePayNow} size="lg" className="w-full text-lg" disabled={!paymentUrl || isProcessing}>
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2" />
                                Proceed to Payment
                            </>
                        )}
                    </Button>
                     {!paymentUrl && <p className="text-sm text-destructive mt-4">Could not find payment information. Please go back and try again.</p>}
                </CardContent>
                 {totalCost > 0 && (
                    <CardFooter className="bg-muted/50 p-6 rounded-b-lg mt-6">
                        <div className="w-full flex justify-between items-center">
                            <h3 className="text-xl font-bold font-headline">Total Amount:</h3>
                            <p className="text-3xl font-bold text-primary">LKR {totalCost.toLocaleString()}</p>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
