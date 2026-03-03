import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="container-fluid px-0 app-shell">
      {sidebarOpen && <div className="sidebar-backdrop d-lg-none" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar-mobile d-lg-none ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar user={user} isMobile onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="d-flex min-vh-100">
        <aside
          className={`d-none d-lg-block sidebar-shell ${sidebarCollapsed ? 'collapsed' : ''}`}
          onMouseEnter={() => setSidebarCollapsed(false)}
        >
          <Sidebar user={user} isCollapsed={sidebarCollapsed} />
        </aside>
        <div
          className="flex-grow-1 d-flex flex-column bg-light content-shell"
          onMouseEnter={() => setSidebarCollapsed(true)}
        >
          <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-grow-1 p-4">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
