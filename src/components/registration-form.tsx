"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarIcon,
  User,
  Mail,
  KeyRound,
  Flag,
  Briefcase,
  Users,
  Camera,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';


import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";

const SALUTATIONS = ["Mr.", "Mrs.", "Miss", "Dr.", "Rev."];
const CIVIL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const NATIONALITIES = ["Sri Lankan", "Foreigner"];
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

const formSchema = z
  .object({
    salutation: z.string().min(1, { message: "Salutation is required." }),
    fullName: z
      .string()
      .min(3, { message: "Full name must be at least 3 characters." }),
    dob: z.date({ required_error: "Date of birth is required." }),
    gender: z.enum(["male", "female"], {
      required_error: "Please select a gender.",
    }),
    civilStatus: z.string({ required_error: "Civil status is required." }),
    nationality: z
      .string({ required_error: "Nationality is required." }),
    nic: z.string().min(1, { message: "NIC number is required." }),
    passport: z.string().optional(),
    email: z.string().email({ message: "Please enter a valid email address." }),
    contactNo: z.string().min(10, { message: "Please enter a valid contact number." }),
    photo: z.any().refine((files) => files?.length == 1, 'Photograph is required.'),
    courses: z
      .array(z.string())
      .refine((value) => value.some((item) => item), {
        message: "You have to select at least one course.",
      }),
  });

export function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [totalCost, setTotalCost] = React.useState(0);
  const [isVerifyingPhone, setIsVerifyingPhone] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = React.useState(false);
  const [otp, setOtp] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salutation: "",
      fullName: "",
      gender: undefined,
      civilStatus: "",
      nationality: "Sri Lankan",
      nic: "",
      passport: "",
      email: "",
      contactNo: "",
      courses: [],
    },
  });

  const contactNoValue = form.watch('contactNo');

  React.useEffect(() => {
    // Reset verification status if phone number changes
    setIsPhoneVerified(false);
    setOtpSent(false);
  }, [contactNoValue]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has('fullName')) {
        const values: any = {};
        let isVerifiedFromParams = false;
        params.forEach((value, key) => {
            if (key === 'dob' && value) {
                values[key] = new Date(value);
            } else if (key === 'courses' && value) {
                values[key] = value.split(',');
            } else if (key === 'photo') {
                // don't set photo from params as it's a file object
            } else if (key === 'isPhoneVerified') {
                isVerifiedFromParams = value === 'true';
            }
            else {
                values[key] = value;
            }
        });
        
        try {
            const storedPhoto = sessionStorage.getItem('photoPreview');
            if(storedPhoto) {
                setPhotoPreview(storedPhoto);
                 // We need to set a value for the photo field in the form
                // to satisfy the validation, even though we're not using the file object directly.
                // A dummy file object or a simple truthy value would work.
                const dataTransfer = new DataTransfer();
                const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
                dataTransfer.items.add(file);
                values['photo'] = dataTransfer.files;
            }
        } catch(e) {
            console.error("Could not get photo from session storage", e)
        }
        
        form.reset(values);
        if (isVerifiedFromParams) {
          setIsPhoneVerified(true);
        }
    }
  }, [searchParams, form]);


  const selectedCourses = form.watch("courses");

  React.useEffect(() => {
    const newTotal = selectedCourses.reduce((acc, courseId) => {
      const course = COURSES.find((c) => c.id === courseId);
      return acc + (course?.price || 0);
    }, 0);
    setTotalCost(newTotal);
  }, [selectedCourses]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("photo", event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        try {
            sessionStorage.setItem('photoPreview', result);
        } catch(e) {
            console.error("Could not save photo to session storage", e);
             toast({ title: "Error", description: "Could not save photo. It might be too large.", variant: "destructive" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyPhone = () => {
    setIsVerifyingPhone(true);
    setTimeout(() => {
      setIsVerifyingPhone(false);
      setOtpSent(true);
      toast({ title: "OTP Sent", description: "An OTP has been sent to your mobile." });
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp === "123456") { // Dummy OTP
      setIsPhoneVerified(true);
      setOtpSent(false);
      toast({ title: "Success", description: "Phone number verified successfully.", variant: 'default' });
    } else {
      toast({ title: "Error", description: "Invalid OTP. Please try again.", variant: "destructive" });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new URLSearchParams();
    
    Object.entries(values).forEach(([key, value]) => {
        if (key === 'photo') return;
        if (value) {
            if (Array.isArray(value)) {
                formData.append(key, value.join(','));
            } else if (value instanceof Date) {
                 formData.append(key, value.toISOString());
            }
            else {
                formData.append(key, value.toString());
            }
        }
    });

    formData.append('isPhoneVerified', 'true');

    router.push(`/review?${formData.toString()}`);
  }

  return (
    <Card className="w-full shadow-2xl transition-all duration-500 hover:shadow-primary/20">
      <CardHeader className="flex flex-col items-center space-y-4">
        <Logo />
        <CardTitle className="text-3xl font-bold text-center">Student Registration Portal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <div>
              <h3 className="text-xl font-semibold font-headline mb-4 flex items-center gap-2"><User className="text-primary"/>Personal Information</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <FormField
                  control={form.control}
                  name="salutation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salutation</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><Users className="mr-2" />{field.value || "Select Salutation"}</SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SALUTATIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="male" /></FormControl>
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="female" /></FormControl>
                            <FormLabel className="font-normal">Female</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="civilStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                           <SelectTrigger><Briefcase className="mr-2" />{field.value || "Select Civil Status"}</SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CIVIL_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                           <SelectTrigger><Flag className="mr-2" />{field.value || "Select Nationality"}</SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NATIONALITIES.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIC Number</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="National Identity Card" {...field} className="pl-10"/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Number</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Passport Number" {...field} className="pl-10"/>
                         </div>
                      </FormControl>
                       <FormDescription>
                        (Optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <div className="relative flex-grow">
                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                             <Input placeholder="you@example.com" {...field} className="pl-10" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="contactNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <div className="flex flex-col sm:flex-row gap-2">
                             <div className="relative flex-grow">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="07XXXXXXXX" {...field} disabled={otpSent || isPhoneVerified} className="pl-10" />
                            </div>
                            {!isPhoneVerified && (
                              <Button type="button" onClick={handleVerifyPhone} disabled={isVerifyingPhone || otpSent || !contactNoValue} className="bg-accent hover:bg-accent/90">
                                {isVerifyingPhone && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isVerifyingPhone ? 'Sending...' : 'Verify Phone'}
                              </Button>
                            )}
                             {isPhoneVerified && <p className="flex items-center text-green-600 font-semibold"><CheckCircle className="mr-2"/> Verified</p>}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {otpSent && (
                        <div className="mt-4 p-4 border rounded-lg bg-secondary/50 animate-in fade-in-50 slide-in-from-top-5 duration-500">
                            <p className="text-sm text-muted-foreground mb-2">Enter the 6-digit OTP sent to your mobile.</p>
                            <div className="flex gap-2">
                                <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6}/>
                                <Button type="button" onClick={handleVerifyOtp}>Verify OTP</Button>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-xl font-semibold font-headline mb-4 flex items-center gap-2"><Camera className="text-primary"/>Photograph</h3>
                    <Separator />
                    <div className="pt-6">
                        <FormField
                        control={form.control}
                        name="photo"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <div
                                onClick={() => photoInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                {photoPreview ? (
                                    <Image src={photoPreview} alt="Photo preview" width={128} height={128} className="h-32 w-32 rounded-full object-cover" />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                    <Camera className="mx-auto h-12 w-12 mb-2" />
                                    <p>Click to upload a photograph</p>
                                    <p className="text-xs">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                </div>
                            </FormControl>
                            <Input
                                ref={photoInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={handlePhotoChange}
                            />
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
                 <div>
                    <h3 className="text-xl font-semibold font-headline mb-4 flex items-center gap-2"><BookOpen className="text-primary"/>Course Selection</h3>
                    <Separator />
                    <div className="pt-6">
                        <FormField
                        control={form.control}
                        name="courses"
                        render={() => (
                            <FormItem>
                            {COURSES.map((course) => (
                                <FormField
                                key={course.id}
                                control={form.control}
                                name="courses"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={course.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(course.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), course.id])
                                                : field.onChange(
                                                    (field.value || []).filter(
                                                        (value) => value !== course.id
                                                    )
                                                    );
                                            }}
                                        />
                                        </FormControl>
                                        <div className="flex justify-between w-full">
                                            <FormLabel className="font-normal text-sm">{course.name}</FormLabel>
                                            <p className="text-sm font-semibold text-primary">LKR {course.price.toLocaleString()}</p>
                                        </div>
                                    </FormItem>
                                    );
                                }}
                                />
                            ))}
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-lg" disabled={!isPhoneVerified || form.formState.isSubmitting}>
              Review Details <ArrowRight className="ml-2" />
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-muted/50 p-6 rounded-b-lg">
        <div className="w-full flex justify-between items-center">
            <h3 className="text-xl font-bold font-headline">Total Cost:</h3>
            <p className="text-3xl font-bold text-primary">LKR {totalCost.toLocaleString()}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
