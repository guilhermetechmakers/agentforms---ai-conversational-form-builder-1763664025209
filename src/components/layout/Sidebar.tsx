import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sessions", href: "/dashboard/sessions", icon: MessageSquare },
  { name: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
  { name: "Admin", href: "/dashboard/admin", icon: Shield },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "bg-white border-r border-pale-gray transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-pale-gray">
        {!collapsed && (
          <h1 className="text-xl font-bold text-charcoal">AgentForms</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-pale-gray transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-medium-gray" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-medium-gray" />
          )}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200",
                isActive
                  ? "bg-charcoal text-white"
                  : "text-medium-gray hover:bg-pale-gray hover:text-charcoal"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
