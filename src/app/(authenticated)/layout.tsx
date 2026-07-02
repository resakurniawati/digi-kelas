import { AuthProvider } from "@/components/auth-provider";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthProvider requireAuth>{children}</AuthProvider>;
}
