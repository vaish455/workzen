import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

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
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}

function App() {
  const { initializeAuth } = useAuthStore()
  
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])
  
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
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
