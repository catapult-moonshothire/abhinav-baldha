import { FileEdit, FileText, LayoutDashboard, Settings } from "lucide-react";
import { TabType } from "./types";

export const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard" as TabType,
  },
  {
    name: "Posts",
    icon: FileText,
    id: "posts" as TabType,
  },
  {
    name: "Drafts",
    icon: FileEdit,
    id: "drafts" as TabType,
  },
  {
    name: "Settings",
    icon: Settings,
    id: "settings" as TabType,
  },
];
