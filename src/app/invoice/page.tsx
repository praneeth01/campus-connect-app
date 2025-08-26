
import { Suspense } from 'react';
import { InvoicePageClient } from '@/components/invoice-page-client';
import { Loader2 } from 'lucide-react';

// This is the main Server Component for the /invoice route.
// It wraps the actual page content (which is a Client Component)
// in a Suspense boundary. This is the correct way to handle
// pages that need to access search parameters.
export default function InvoicePage() {
  return (
    <Suspense fallback={
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Invoice...</p>
        </div>
    }>
      <InvoicePageClient />
    </Suspense>
  );
}
