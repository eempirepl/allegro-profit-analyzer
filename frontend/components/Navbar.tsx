import React, { useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-primary">Allegro Profit Analyzer</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/profile" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
              Profil
            </Link>
            <Link href="/settings" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md">
              Ustawienia
            </Link>
            <button className="btn btn-primary ml-4">
              Synchronizuj dane
            </button>
          </div>
          
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobilne menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/profile" className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md">
              Profil
            </Link>
            <Link href="/settings" className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md">
              Ustawienia
            </Link>
            <button className="w-full text-left btn btn-primary mt-4">
              Synchronizuj dane
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 