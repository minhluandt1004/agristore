import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar bên trái */}
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Header phía trên */}
        <AdminHeader />
        
        {/* Khu vực nội dung chính cuộn được */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;