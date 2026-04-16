import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, DollarSign, Handshake, LogOut, Menu } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={18} />, label: 'Groups', path: '/groups' },
    { icon: <DollarSign size={18} />, label: 'Expenses', path: '/expenses' },
    { icon: <Handshake size={18} />, label: 'Settlements', path: '/settlements' },
  ];

  return (
    <div className="w-64 bg-sidebar h-screen border-r border-border flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            S
          </div>
          SplitSmart
        </h1>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-accent text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

const Header = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={20} />
        </Button>
        <div className="md:hidden h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          S
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end mr-1 hidden sm:flex">
          <span className="text-sm font-semibold">{user?.name}</span>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </div>
        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
