import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-primary leading-tight">LPP RRI Kendari</p>
            <p className="text-xs text-muted-foreground">Sistem Pendataan Tamu Digital</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/register">Registrasi Tamu</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">Login Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
