import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'home',
      path: '/',
    },
    {
      name: 'Produkty',
      icon: 'box',
      path: '/products',
    },
    {
      name: 'Zamówienia',
      icon: 'shopping-cart',
      path: '/orders',
    },
    {
      name: 'Pozycje zamówień',
      icon: 'clipboard-list',
      path: '/order-items',
    },
    {
      name: 'Allegro Billing',
      icon: 'file-invoice-dollar',
      path: '/fees',
    },
    {
      name: 'Ustawienia API',
      icon: 'cogs',
      path: '/api-settings',
    },
  ];
  
  const isActive = (path: string) => {
    return router.pathname === path;
  };
  
  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      <div className="overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 ${
                  isActive(item.path) ? 'bg-gray-100 text-primary' : 'text-gray-700'
                }`}
              >
                <span className="w-6 h-6 text-center mr-3">
                  <i className={`fas fa-${item.icon}`}></i>
                </span>
                <span>{item.name}</span>
                {isActive(item.path) && (
                  <span className="ml-auto w-1.5 h-6 bg-primary rounded-sm"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar; 