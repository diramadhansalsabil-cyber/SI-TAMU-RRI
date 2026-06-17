import { Building2 } from "lucide-react";
import { VisitorForm } from "@/components/register/visitor-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-primary">LPP RRI Kendari</h1>
          <p className="text-muted-foreground">Registrasi Tamu Digital</p>
        </div>
        <VisitorForm />
      </div>
    </div>
  );
}
