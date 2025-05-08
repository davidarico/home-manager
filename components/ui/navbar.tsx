'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-800">
      <h1 className="text-xl font-semibold text-white">Household Manager</h1>
      <Button variant="ghost" onClick={logout} className="text-white hover:text-gray-300">
        Logout
      </Button>
    </div>
  );
}