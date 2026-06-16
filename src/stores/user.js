import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
  }),
  actions: {
    async checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        this.isAuthenticated = true
        this.isAdmin = !!session.user.user_metadata?.role === 'admin'
        // 检查 raw_app_meta_data
        const { data: userData } = await supabase.auth.getUser()
        this.isAdmin = !!userData.user?.user_metadata?.role ||
                       userData.user?.aud === 'authenticated'
      } else {
        this.isAuthenticated = false
        this.isAdmin = false
      }
    },
    async login(email, password) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        this.isAuthenticated = true
        // 默认邮箱登录即为管理员（实际项目中可通过 raw_app_meta_data 控制）
        this.isAdmin = true
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    async logout() {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        this.isAuthenticated = false
        this.isAdmin = false
      }
    },
  },
})
