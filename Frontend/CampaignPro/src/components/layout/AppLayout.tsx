import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const TITLE_MAP: { match: RegExp; title: string }[] = [
  { match: /^\/dashboard/, title: 'Dashboard' },
  { match: /^\/contacts\/new/, title: 'Add Contact' },
  { match: /^\/contacts\/.+\/edit/, title: 'Edit Contact' },
  { match: /^\/contacts/, title: 'Contacts' },
  { match: /^\/contact-groups/, title: 'Contact Groups' },
  { match: /^\/templates\/new/, title: 'New Template' },
  { match: /^\/templates\/.+\/edit/, title: 'Edit Template' },
  { match: /^\/templates/, title: 'Email Templates' },
  { match: /^\/campaigns\/new/, title: 'New Campaign' },
  { match: /^\/campaigns\/.+\/edit/, title: 'Edit Campaign' },
  { match: /^\/campaigns\/.+/, title: 'Campaign Details' },
  { match: /^\/campaigns/, title: 'Campaigns' },
  { match: /^\/analytics/, title: 'Analytics' },
  { match: /^\/profile/, title: 'Profile' },
  { match: /^\/admin\/users/, title: 'User Management' },
  { match: /^\/admin\/activity/, title: 'System Activity' },
  { match: /^\/admin/, title: 'Admin Dashboard' },
];

function resolveTitle(pathname: string): string {
  return TITLE_MAP.find((entry) => entry.match.test(pathname))?.title ?? 'CampaignPro';
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header title={resolveTitle(location.pathname)} onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
