// store/useThemeStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist((set) => ({
      isDark: false,
      setTheme: () => set((state) => ({isDark: !state.isDark}))
   } 
  )
));

export { useThemeStore };