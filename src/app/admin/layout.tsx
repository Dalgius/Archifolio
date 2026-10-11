
'use client';
import * as React from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { LayoutGrid, Globe, LogOut, Loader2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { GDAStudioLogo } from "@/components/icons";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";

const LOGIN_ROUTE = '/admin/login';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isLoginPage = pathname === LOGIN_ROUTE;

  React.useEffect(() => {
    if (isLoading) return;
    if (!user && !isLoginPage) router.replace(LOGIN_ROUTE);
    if (user && isLoginPage) router.replace('/admin');
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage && !user) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.replace(LOGIN_ROUTE);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <GDAStudioLogo className="w-10 h-10" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin') && !isLoginPage}>
                <Link href="/admin">
                  <LayoutGrid />
                  <span>Progetti</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/" target="_blank">
                  <Globe />
                  <span>Visualizza Sito</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
         <div className="p-2 mt-auto">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </Button>
          </div>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
