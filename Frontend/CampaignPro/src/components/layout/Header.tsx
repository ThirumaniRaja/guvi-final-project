import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    toast.success('You have been signed out.');
    navigate(ROUTES.login);
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <button type="button" className="menu-toggle" onClick={onMenuClick} aria-label="Toggle navigation">
          <Menu size={20} />
        </button>
        <span className="breadcrumb">{title}</span>
      </div>
      <div className="header-right">
        <div className="user-menu">
          <button type="button" className="user-menu-trigger" onClick={() => setMenuOpen((prev) => !prev)}>
            <span className="user-avatar">{initials}</span>
            <span className="hide-mobile" style={{ fontWeight: 600, fontSize: 13 }}>
              {user?.fullName}
            </span>
            <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div className="user-menu-dropdown">
              <button
                type="button"
                className="user-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(ROUTES.profile);
                }}
              >
                <User size={16} /> Profile
              </button>
              <button type="button" className="user-menu-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
