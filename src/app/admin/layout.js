"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SearchProvider } from "@/contexts/SearchContext";
import { withAdminAuth } from "@/contexts/AuthContext";

function AdminLayout({ children }) {
  return (
    <SearchProvider>
      <div className="flex bg-background">
        <AdminSidebar />

        <div className="flex flex-1 flex-col md:ml-64">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SearchProvider>
  );
}

export default withAdminAuth(AdminLayout);
