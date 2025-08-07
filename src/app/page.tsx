import { RegistrationForm } from '@/components/registration-form';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button asChild>
          <Link href="/login">Student Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/login">Admin Login</Link>
        </Button>
      </div>
      <div className="w-full max-w-5xl">
        <Suspense fallback={<div>Loading...</div>}>
          <RegistrationForm />
        </Suspense>
      </div>
    </div>
  );
}
