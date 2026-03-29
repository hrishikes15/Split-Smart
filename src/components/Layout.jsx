import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, DollarSign, Handshake, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={20} />, label: 'Groups', path: '/groups' },
    { icon: <DollarSign size={20} />, label: 'Expenses', path: '/expenses' },
    { icon: <Handshake size={20} />, label: 'Settlements', path: '/settlements' },
  ];

  return (
    <div className="w-64 bg-darker h-screen border-r border-gray-800 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <span>SplitSmart</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-gray-400 hover:bg-card hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200 w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <header className="h-16 bg-darker border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button could go here */}
      </div>
      <div className="flex items-center gap-4">
         <span className="text-sm font-medium text-gray-300">{user?.name}</span>
         <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white uppercase">
           {user?.name?.charAt(0) || 'U'}
         </div>
      </div>
    </header>
  );
};

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
