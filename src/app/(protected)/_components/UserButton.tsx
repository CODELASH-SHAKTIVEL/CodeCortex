'use client';

import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect, useRef, useState } from 'react';

export function UserButton() {
  const { user, isAuthenticated } = useKindeAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 rounded-full bg-gray-200 px-3 py-2 hover:bg-gray-300"
        aria-label="User menu"
      >
        <span className="hidden sm:inline">{user?.given_name ?? 'User'}</span>
        {user?.picture ? (
          <img
            src={user.picture}
            alt="User avatar"
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
            {user?.given_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg z-10">
          <div className="p-4 border-b">
            <p className="text-sm font-medium text-gray-800">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
