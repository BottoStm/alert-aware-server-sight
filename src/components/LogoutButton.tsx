
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { logout, user } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 hidden sm:inline">
        Welcome, {user?.firstname} {user?.lastname}
      </span>
      <Button
        onClick={logout}
        variant="ghost"
        size="sm"
        className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
