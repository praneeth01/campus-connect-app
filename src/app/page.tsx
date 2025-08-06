import { RegistrationForm } from '@/components/registration-form';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        <RegistrationForm />
      </div>
    </div>
  );
}
