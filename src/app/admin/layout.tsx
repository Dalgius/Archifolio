
'use client';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { LayoutGrid, Globe, LogOut } from "lucide-react";
import { GDAStudioLogo } from "@/components/icons";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/actions';
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <GDAStudioLogo className="w-8 h-8" />
            <h1 className="text-xl font-semibold font-headline text-sidebar-foreground">
              GDAStudio
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin') && pathname !== '/admin/login'}>
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
            <form action={logout}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LogOut />
                <span>Logout</span>
              </Button>
            </form>
          </div>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
