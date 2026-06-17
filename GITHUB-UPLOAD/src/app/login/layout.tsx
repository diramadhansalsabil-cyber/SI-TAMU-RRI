import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Skeleton className="h-96 w-full max-w-md" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
