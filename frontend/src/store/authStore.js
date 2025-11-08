import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      company: null,
      employee: null,
      token: null,
      isAuthenticated: false,
      
      login: async (loginId, password) => {
        try {
          const response = await api.post('/auth/login', { loginId, password })
          const { user, company, employee, token } = response.data.data
          
          localStorage.setItem('token', token)
          set({
            user,
            company,
            employee,
            token,
            isAuthenticated: true,
          })
          
          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
          }
        }
      },
      
      register: async (data) => {
        try {
          const response = await api.post('/auth/register-admin', data)
          const { user, company, employee, token } = response.data.data
          
          localStorage.setItem('token', token)
          set({
            user,
            company,
            employee,
            token,
            isAuthenticated: true,
          })
          
          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
          }
        }
      },
      
      logout: () => {
        localStorage.removeItem('token')
        set({
          user: null,
          company: null,
          employee: null,
          token: null,
          isAuthenticated: false,
        })
      },
      
      updateProfile: (data) => {
        set((state) => ({
          user: { ...state.user, ...data.user },
          employee: { ...state.employee, ...data.employee },
        }))
      },
      
      initializeAuth: async () => {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const response = await api.get('/auth/me')
            const { user, company, employee } = response.data.data
            set({
              user,
              company,
              employee,
              token,
              isAuthenticated: true,
            })
          } catch (error) {
            localStorage.removeItem('token')
            set({
              user: null,
              company: null,
              employee: null,
              token: null,
              isAuthenticated: false,
            })
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        employee: state.employee,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
