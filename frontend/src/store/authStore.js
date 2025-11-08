import { create } from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  company: null,
  employee: null,
  isAuthenticated: false,

  login: async (loginId, password) => {
    const response = await api.post('/auth/login', { loginId, password })
    const { token, user, company, employee } = response.data.data

    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    set({
      user,
      company,
      employee,
      isAuthenticated: true,
    })

    return response.data
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      set({ isAuthenticated: false, user: null, company: null, employee: null })
      return
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await api.get('/auth/me')
      const { user, company, employee } = response.data.data

      set({
        user,
        company,
        employee,
        isAuthenticated: true,
      })
    } catch (error) {
      // Token invalid, clear everything
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      set({ isAuthenticated: false, user: null, company: null, employee: null })
    }
  },

  updateProfile: (data) => {
    set((state) => ({
      employee: data.employee || state.employee,
      user: data.user || state.user,
    }))
  },

  logout: () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    set({
      user: null,
      company: null,
      employee: null,
      isAuthenticated: false,
    })
  },
}))
