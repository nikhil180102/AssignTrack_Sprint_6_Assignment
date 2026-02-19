import { createSlice } from '@reduxjs/toolkit';

const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (_) {
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem('theme', theme);
  } catch (_) {
  }
};

const initial = getStoredTheme();
applyTheme(initial);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initial },
  reducers: {
    setTheme(state, action) {
      const mode = action.payload === 'dark' ? 'dark' : 'light';
      state.mode = mode;
      applyTheme(mode);
    },
    toggleTheme(state) {
      const next = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = next;
      applyTheme(next);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
