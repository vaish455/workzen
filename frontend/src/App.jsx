import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Landing Page
import LandingPage from './pages/LandingPage'

// Auth Pages
import Login from './pages/auth/Login'
import RegisterAdmin from './pages/auth/RegisterAdmin'

// Layout
import Layout from './components/layout/Layout'

// Dashboard
import AdminDashboard from './pages/dashboard/AdminDashboard'
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard'

// Employees
import EmployeeDirectory from './pages/employees/EmployeeDirectory'
import EmployeeDetails from './pages/employees/EmployeeDetails'
import AddEmployee from './pages/employees/AddEmployee'
import MyProfile from './pages/employees/MyProfile'

// Attendance
import Attendance from './pages/attendance/Attendance'
import MyAttendance from './pages/attendance/MyAttendance'

// Time Off
import TimeOff from './pages/timeoff/TimeOff'
import ApplyTimeOff from './pages/timeoff/ApplyTimeOff'
import TimeOffDetails from './pages/timeoff/TimeOffDetails'

// Payroll
import Payroll from './pages/payroll/Payroll'
import PayslipDetails from './pages/payroll/PayslipDetails'
import MyPayslips from './pages/payroll/MyPayslips'

// Reports
import Reports from './pages/reports/Reports'

// Settings
import Settings from './pages/settings/Settings'

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuthStore()
  
  // Prevent rendering if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Prevent rendering if user role doesn't match
  if (roles && user?.role && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'EMPLOYEE') {
      return <Navigate to="/dashboard/employee" replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const { user, isAuthenticated, initializeAuth } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const hasInitialized = useRef(false)
  
  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (hasInitialized.current) return
    hasInitialized.current = true
    
    initializeAuth().finally(() => setIsInitialized(true))
  }, []) // Keep empty - we only want this to run once on mount
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Dashboard redirect based on role
  const DashboardRedirect = () => {
    if (user?.role === 'EMPLOYEE') {
      return <Navigate to="/dashboard/employee" replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Landing Page - Public Route */}
        <Route path="/landing" element={
          !isAuthenticated ? <LandingPage /> : <Navigate to="/" replace />
        } />

        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/register-admin" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterAdmin />
        } />
        
        {/* Protected Routes - Remove the nested ProtectedRoute wrapper */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Layout /> : <Navigate to="/landing" replace />
          }
        >
          {/* Dashboard */}
          <Route index element={<DashboardRedirect />} />
          <Route path="dashboard" element={
            <ProtectedRoute roles={['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="dashboard/employee" element={
            <ProtectedRoute roles={['EMPLOYEE']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          {/* Profile */}
          <Route path="profile" element={<MyProfile />} />
          
          {/* Employees */}
          <Route path="employees" element={<EmployeeDirectory />} />
          <Route path="employees/add" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AddEmployee />
            </ProtectedRoute>
          } />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          
          {/* Attendance */}
          <Route path="attendance" element={
            <ProtectedRoute roles={['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER']}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="attendance/my" element={<MyAttendance />} />
          
          {/* Time Off */}
          <Route path="timeoff" element={<TimeOff />} />
          <Route path="timeoff/apply" element={<ApplyTimeOff />} />
          <Route path="timeoff/:id" element={<TimeOffDetails />} />
          
          {/* Payroll */}
          <Route path="payroll" element={
            <ProtectedRoute roles={['ADMIN', 'PAYROLL_OFFICER']}>
              <Payroll />
            </ProtectedRoute>
          } />
          <Route path="payroll/:id" element={<PayslipDetails />} />
          <Route path="payroll/my" element={<MyPayslips />} />
          
          {/* Reports */}
          <Route path="reports" element={
            <ProtectedRoute roles={['ADMIN', 'PAYROLL_OFFICER']}>
              <Reports />
            </ProtectedRoute>
          } />
          
          {/* Settings */}
          <Route path="settings" element={
            <ProtectedRoute roles={['ADMIN']}>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

