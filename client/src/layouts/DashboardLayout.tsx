import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-charcoal-900">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
