import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Protection
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import SearchPage from '../pages/public/SearchPage';
import SuccessStoriesPage from '../pages/public/SuccessStoriesPage';
import MembershipPlansPage from '../pages/public/MembershipPlansPage';
import ProfileDetailPage from '../pages/profile/ProfileDetailPage';

// Dashboard Pages
import DashboardOverviewPage from '../pages/dashboard/DashboardOverviewPage';
import MyProfilePage from '../pages/dashboard/MyProfilePage';
import EditProfileWizardPage from '../pages/dashboard/EditProfileWizardPage';
import RecommendedMatchesPage from '../pages/dashboard/RecommendedMatchesPage';
import ShortlistedPage from '../pages/dashboard/ShortlistedPage';
import ReceivedInterestsPage from '../pages/dashboard/ReceivedInterestsPage';
import SentInterestsPage from '../pages/dashboard/SentInterestsPage';
import ConnectionsPage from '../pages/dashboard/ConnectionsPage';
import MessagesPage from '../pages/dashboard/MessagesPage';
import NotificationsPage from '../pages/dashboard/NotificationsPage';
import ProfileViewHistoryPage from '../pages/dashboard/ProfileViewHistoryPage';
import MembershipPage from '../pages/dashboard/MembershipPage';
import SettingsPage from '../pages/dashboard/SettingsPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminMembershipsPage from '../pages/admin/AdminMembershipsPage';
import AdminProfilesPage from '../pages/admin/AdminProfilesPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminPlansPage from '../pages/admin/AdminPlansPage';
import AdminContentPage from '../pages/admin/AdminContentPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/membership-plans" element={<MembershipPlansPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile/:userId" element={<ProfileDetailPage />} />
      </Route>

      {/* User Dashboard Protected Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverviewPage />} />
        <Route path="my-profile" element={<MyProfilePage />} />
        <Route path="edit-profile" element={<EditProfileWizardPage />} />
        <Route path="search-matches" element={<SearchPage />} />
        <Route path="recommended" element={<RecommendedMatchesPage />} />
        <Route path="shortlisted" element={<ShortlistedPage />} />
        <Route path="received-interests" element={<ReceivedInterestsPage />} />
        <Route path="sent-interests" element={<SentInterestsPage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="views" element={<ProfileViewHistoryPage />} />
        <Route path="membership" element={<MembershipPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin Console Protected Pages */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="memberships" element={<AdminMembershipsPage />} />
        <Route path="profiles" element={<AdminProfilesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="success-stories" element={<AdminContentPage />} />
        <Route path="faqs" element={<AdminContentPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

