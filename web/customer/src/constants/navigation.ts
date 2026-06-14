import {
  BarChart3,
  CircleDollarSign,
  KeyRound,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { NavItem, PageKey } from "../types";

export const customerRoutes: Record<string, PageKey> = {
  "/": "home",
  "/dashboard": "dashboard",
  "/dashboard/billing": "topup",
  "/dashboard/usage": "usage",
  "/dashboard/api-key": "apikeys",
  "/dashboard/invite-record": "invite",
  "/dashboard/settings": "settings",
  "/console/connect": "atfSwitchConnect",
  "/atf-switch/connect": "atfSwitchConnect",
  "/topup": "topup",
  "/wallet": "topup",
  "/usage": "usage",
  "/usage-logs": "usage",
  "/apikeys": "apikeys",
  "/keys": "apikeys",
  "/invite": "invite",
  "/settings": "settings",
  "/subscribe": "subscribe",
  "/pricing": "subscribe",
  "/setup": "setup",
  "/docs": "setup",
  "/sign-in": "signin",
  "/login": "signin",
  "/register": "signup",
  "/sign-up": "signup",
  "/user-agreement": "userAgreement",
  "/privacy-policy": "privacyPolicy",
};

export const sidebarItems: NavItem[] = [
  {
    page: "dashboard",
    path: "/dashboard",
    labelId: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    page: "topup",
    path: "/dashboard/billing",
    labelId: "Billing",
    icon: CircleDollarSign,
  },
  {
    page: "usage",
    path: "/dashboard/usage",
    labelId: "Usage",
    icon: BarChart3,
  },
  {
    page: "apikeys",
    path: "/dashboard/api-key",
    labelId: "API Keys",
    icon: KeyRound,
  },
  {
    page: "invite",
    path: "/dashboard/invite-record",
    labelId: "Referrals",
    icon: Users,
  },
  {
    page: "settings",
    path: "/dashboard/settings",
    labelId: "Settings",
    icon: Settings,
  },
];

export const protectedPages = new Set<PageKey>([
  "dashboard",
  "topup",
  "usage",
  "apikeys",
  "invite",
  "settings",
  "atfSwitchConnect",
]);
