"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nama: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: admin } = await supabase
        .from("admins")
        .select("*")
        .eq("id", user.id)
        .single();

      if (admin) {
        profileForm.setValue("nama", admin.nama);
        setRole(admin.role);
      }
    };
    loadProfile();
  }, [profileForm]);

  const onUpdateProfile = async (data: ProfileForm) => {
    setLoadingProfile(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("admins")
        .update({ nama: data.nama })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profil berhasil diperbarui");
    } catch {
      toast.error("Gagal memperbarui profil");
    } finally {
      setLoadingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    setLoadingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;
      toast.success("Password berhasil diperbarui");
      passwordForm.reset();
    } catch {
      toast.error("Gagal memperbarui password");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan keamanan akun admin</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Admin
            </CardTitle>
            <CardDescription>Informasi akun Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge variant="secondary">
                    <Shield className="mr-1 h-3 w-3" />
                    {role}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" {...profileForm.register("nama")} />
                {profileForm.formState.errors.nama && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.nama.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loadingProfile}>
                {loadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Profil
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ubah Password
            </CardTitle>
            <CardDescription>Perbarui password akun admin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  {...passwordForm.register("password")}
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loadingPassword}>
                {loadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ubah Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
