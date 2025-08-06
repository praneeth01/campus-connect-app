'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Mail,
  KeyRound,
  Flag,
  Briefcase,
  Users,
  Camera,
  BookOpen,
  ArrowRight,
  Edit,
  CalendarIcon,
  CheckCircle,
  Phone,
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

function ReviewDetail({ label, value, icon: Icon }: { label: string; value?: string | null; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || 'N/A'}</p>
      </div>
    </div>
  );
}


export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = React.useState<any>({});
  const [totalCost, setTotalCost] = React.useState(0);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    const data: any = {};
    searchParams.forEach((value, key) => {
      if (key === 'courses') {
        data[key] = value.split(',');
      } else {
        data[key] = value;
      }
    });
    setFormData(data);

    try {
        const storedPhoto = sessionStorage.getItem('photoPreview');
        if (storedPhoto) {
            setPhotoPreview(storedPhoto);
        }
    } catch (e) {
        console.error("Could not get photo from session storage", e);
    }
    

    const newTotal = (data.courses || []).reduce((acc: number, courseId: string) => {
        const course = COURSES.find((c) => c.id === courseId);
        return acc + (course?.price || 0);
    }, 0);
    setTotalCost(newTotal);

  }, [searchParams]);

  const handleEdit = () => {
    const query = new URLSearchParams(formData).toString();
    router.push(`/?${query}`);
  };

  const handleConfirmAndRegister = () => {
     const paymentUrl = `https://placeholder.payment-gateway.com/pay?amount=${totalCost}&email=${encodeURIComponent(formData.email)}`;
     router.push(`/payment?paymentUrl=${encodeURIComponent(paymentUrl)}`);
  };

  if (!formData.fullName) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <p>Loading review details...</p>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-5xl shadow-2xl">
        <CardHeader className="flex flex-col items-center space-y-4">
            <Logo />
            <CardTitle className="text-3xl font-bold text-center">Review Your Details</CardTitle>
            <CardDescription>Please review your registration details below before proceeding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-12">
            <div>
            <h3 className="text-xl font-semibold font-headline mb-4 flex items-center gap-2"><User className="text-primary"/>Personal Information</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6">
                <ReviewDetail label="Salutation" value={formData.salutation} icon={Users} />
                <ReviewDetail label="Full Name" value={formData.fullName} icon={User} />
                <ReviewDetail label="Date of Birth" value={formData.dob ? new Date(formData.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} icon={CalendarIcon} />
                <ReviewDetail label="Gender" value={formData.gender} icon={Users} />
                <ReviewDetail label="Civil Status" value={formData.civilStatus} icon={Briefcase} />
                <ReviewDetail label="Nationality" value={formData.nationality} icon={Flag} />
                <ReviewDetail label="NIC Number" value={formData.nic} icon={KeyRound} />
                <ReviewDetail label="Passport Number" value={formData.passport} icon={KeyRound} />
                <ReviewDetail label="Email Address" value={formData.email} icon={Mail} />

                <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Contact Number</p>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">{formData.contactNo}</p>
                            <span className="flex items-center text-sm text-green-600 font-medium">
                                <CheckCircle className="h-4 w-4 mr-1"/> Verified
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-xl font-semibold font-headline mb-4 flex items-center gap-2"><Camera className="text-primary"/>Photograph</h3>
                    <Separator />
                    <div className="pt-6">
                    {photoPreview ? (
                        <Image src={photoPreview} alt="Photo preview" width={128} height={128} className="h-48 w-48 rounded-lg object-cover border-2 border-primary/20 p-1" />
                    ) : (
                        <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                            <Camera className="mx-auto h-12 w-12 mb-2" />
                            <p>No photograph provided</p>
                        </div>
                    )}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold font-headline mb-4 flex items-center gap-2"><BookOpen className="text-primary"/>Selected Courses</h3>
                    <Separator />
                    <div className="pt-6 space-y-2">
                    {(formData.courses || []).map((courseId: string) => {
                        const course = COURSES.find(c => c.id === courseId);
                        return (
                            <div key={courseId} className="flex justify-between items-center p-3 rounded-md border">
                                <p className="text-sm">{course?.name}</p>
                                <p className="text-sm font-semibold text-primary">LKR {course?.price.toLocaleString()}</p>
                            </div>
                        )
                    })}
                     <FormMessage />
                    </div>
                </div>
            </div>
             <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button variant="outline" size="lg" className="w-full" onClick={handleEdit}>
                    <Edit className="mr-2"/> Edit Details
                </Button>
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-lg" onClick={handleConfirmAndRegister}>
                    Confirm & Register <ArrowRight className="ml-2" />
                </Button>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 rounded-b-lg">
            <div className="w-full flex justify-between items-center">
                <h3 className="text-xl font-bold font-headline">Total Cost:</h3>
                <p className="text-3xl font-bold text-primary">LKR {totalCost.toLocaleString()}</p>
            </div>
        </CardFooter>
        </Card>
    </div>
  );
}

// Dummy component to avoid build errors
function FormMessage() {
    return null;
}
