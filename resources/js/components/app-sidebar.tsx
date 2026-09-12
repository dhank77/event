import { Link, usePage } from '@inertiajs/react';
import { BookOpen, CalendarDays, FolderGit2, LayoutGrid, ScanLine, ShoppingCart, Wallet } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as checkInIndex } from '@/routes/check-in';
import { index as ordersIndex } from '@/routes/orders';
import { index as vendorEventsIndex } from '@/routes/vendor/events';
import { index as vendorWithdrawalsIndex } from '@/routes/vendor/withdrawals';
import type { NavItem, PageProps } from '@/types';

const baseNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;

    const mainNavItems: NavItem[] = [...baseNavItems];

    if (auth.user.role === 'admin' || auth.user.role === 'vendor') {
        mainNavItems.push({
            title: 'Orders',
            href: ordersIndex(),
            icon: ShoppingCart,
        });
        mainNavItems.push({
            title: 'Check-In',
            href: checkInIndex(),
            icon: ScanLine,
        });
        mainNavItems.push({
            title: 'Tarik Saldo',
            href: vendorWithdrawalsIndex(),
            icon: Wallet,
        });
    }

    if (auth.user.role === 'vendor') {
        mainNavItems.push({
            title: 'Kelola Event',
            href: vendorEventsIndex(),
            icon: CalendarDays,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
