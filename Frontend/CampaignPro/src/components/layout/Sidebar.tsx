import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Mail,
  Send,
  BarChart3,
  Shield,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { user } = useAuth();

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`} onClick={onNavigate} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Megaphone size={22} />
          CampaignPro
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          <NavLink to={ROUTES.dashboard} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to={ROUTES.contacts} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
            <Users size={18} /> Contacts
          </NavLink>
          <NavLink to={ROUTES.contactGroups} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
            <UsersRound size={18} /> Contact Groups
          </NavLink>
          <NavLink to={ROUTES.templates} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
            <Mail size={18} /> Email Templates
          </NavLink>
          <NavLink to={ROUTES.campaigns} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
            <Send size={18} /> Campaigns
          </NavLink>
          <NavLink to={ROUTES.analytics} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
            <BarChart3 size={18} /> Analytics
          </NavLink>

          {user?.role === 'ADMIN' && (
            <>
              <div className="sidebar-section-label">Admin</div>
              <NavLink to={ROUTES.admin} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
                <Shield size={18} /> Admin Dashboard
              </NavLink>
              <NavLink to={ROUTES.adminUsers} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
                <Users size={18} /> Users
              </NavLink>
              <NavLink to={ROUTES.adminActivity} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
                <BarChart3 size={18} /> Activity
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
