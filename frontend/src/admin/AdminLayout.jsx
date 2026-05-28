import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./components/AdminHeader"; 
import AdminSidebar from "./components/AdminSidebar"; 

const AdminLayout = () => {
  const admin = JSON.parse(localStorage.getItem("admin"));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Truyền fullName và role xuống Header */}
        <AdminHeader 
          adminName={admin?.fullName} 
          adminRole={admin?.role} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;