import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-accent-pink)' }}>
      <Navbar 
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main 
          className={`flex-1 p-6 mt-16 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

