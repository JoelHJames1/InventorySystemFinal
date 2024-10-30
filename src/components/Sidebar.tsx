import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CubeIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UserGroupIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Sales', href: '/sales', icon: ShoppingCartIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
        <img 
          src={settings?.logoUrl || '/logo.png'} 
          alt={settings?.name || 'CMJ Med Service'} 
          className="h-8 w-auto mr-2" 
        />
        <h1 className="text-xl font-bold text-white">{settings?.name || 'CMJ Med Service'}</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const current = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${
                  current
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon className="w-6 h-6 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}