import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  ListBulletIcon,
  Cog6ToothIcon as CogIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  // Lista elementów menu
  const menuItems = [
    {
      name: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      path: '/'
    },
    {
      name: 'Produkty',
      icon: <ShoppingBagIcon className="w-5 h-5" />,
      path: '/products'
    },
    {
      name: 'Zamówienia',
      icon: <ShoppingCartIcon className="w-5 h-5" />,
      path: '/orders'
    },
    {
      name: 'Pozycje zamówień',
      icon: <ListBulletIcon className="w-5 h-5" />,
      path: '/order-items'
    },
    {
      name: 'Ustawienia API',
      icon: <CogIcon className="w-5 h-5" />,
      path: '/settings'
    }
  ];

  // Funkcja sprawdzająca, czy dany element jest aktywny
  const isActive = (path: string): boolean => {
    return currentPath === path;
  };

  return (
    <aside className="bg-white w-64 min-h-screen shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Allegro Profit</h2>
      </div>
      
      <nav className="mt-6">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link 
                href={item.path}
                className={`flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 ${
                  isActive(item.path) ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 