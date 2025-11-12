import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Building2, Users, MapPin, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Imóveis", href: "/properties", icon: Building2 },
  { name: "Cidades", href: "/cities", icon: MapPin },
  { name: "Bairros", href: "/neighborhoods", icon: Map },
  { name: "Leads", href: "/leads", icon: Users },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Select-X</h1>
          <p className="text-sm text-muted-foreground mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-hover hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
          >
            Sair
          </Button>
          <p className="text-xs text-muted-foreground text-center">© 2025 Select-X</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
