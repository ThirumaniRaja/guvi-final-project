import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { PageSpinner } from '../components/loaders/PageSpinner';

const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ContactsListPage = lazy(() => import('../pages/contacts/ContactsListPage').then((m) => ({ default: m.ContactsListPage })));
const ContactFormPage = lazy(() => import('../pages/contacts/ContactFormPage').then((m) => ({ default: m.ContactFormPage })));
const ContactDetailPage = lazy(() => import('../pages/contacts/ContactDetailPage').then((m) => ({ default: m.ContactDetailPage })));
const ContactGroupsListPage = lazy(() =>
  import('../pages/groups/ContactGroupsListPage').then((m) => ({ default: m.ContactGroupsListPage })),
);
const ContactGroupDetailPage = lazy(() =>
  import('../pages/groups/ContactGroupDetailPage').then((m) => ({ default: m.ContactGroupDetailPage })),
);
const TemplatesListPage = lazy(() => import('../pages/templates/TemplatesListPage').then((m) => ({ default: m.TemplatesListPage })));
const TemplateFormPage = lazy(() => import('../pages/templates/TemplateFormPage').then((m) => ({ default: m.TemplateFormPage })));
const TemplatePreviewPage = lazy(() =>
  import('../pages/templates/TemplatePreviewPage').then((m) => ({ default: m.TemplatePreviewPage })),
);
const CampaignsListPage = lazy(() => import('../pages/campaigns/CampaignsListPage').then((m) => ({ default: m.CampaignsListPage })));
const CampaignWizardPage = lazy(() =>
  import('../pages/campaigns/CampaignWizardPage').then((m) => ({ default: m.CampaignWizardPage })),
);
const CampaignDetailPage = lazy(() =>
  import('../pages/campaigns/CampaignDetailPage').then((m) => ({ default: m.CampaignDetailPage })),
);
const CampaignEditPage = lazy(() => import('../pages/campaigns/CampaignEditPage').then((m) => ({ default: m.CampaignEditPage })));
const AnalyticsPage = lazy(() => import('../pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminActivityPage = lazy(() => import('../pages/admin/AdminActivityPage').then((m) => ({ default: m.AdminActivityPage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/contacts" element={<ContactsListPage />} />
            <Route path="/contacts/new" element={<ContactFormPage />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />
            <Route path="/contacts/:id/edit" element={<ContactFormPage />} />

            <Route path="/contact-groups" element={<ContactGroupsListPage />} />
            <Route path="/contact-groups/:id" element={<ContactGroupDetailPage />} />

            <Route path="/templates" element={<TemplatesListPage />} />
            <Route path="/templates/new" element={<TemplateFormPage />} />
            <Route path="/templates/:id/edit" element={<TemplateFormPage />} />
            <Route path="/templates/:id/preview" element={<TemplatePreviewPage />} />

            <Route path="/campaigns" element={<CampaignsListPage />} />
            <Route path="/campaigns/new" element={<CampaignWizardPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/campaigns/:id/edit" element={<CampaignEditPage />} />

            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/activity" element={<AdminActivityPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
