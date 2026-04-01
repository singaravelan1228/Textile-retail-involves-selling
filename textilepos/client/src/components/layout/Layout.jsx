import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

const Layout = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-area">
      <Topbar />
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  </div>
);

export default Layout;
