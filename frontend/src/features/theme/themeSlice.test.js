import { beforeEach, describe, expect, it, vi } from 'vitest';

function mockMatchMedia(matches) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('themeSlice', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.className = '';
    mockMatchMedia(false);
  });

  it('uses stored dark theme on init', async () => {
    localStorage.setItem('theme', 'dark');

    const module = await import('./themeSlice');
    const reducer = module.default;

    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to system dark theme if no stored value', async () => {
    mockMatchMedia(true);

    const module = await import('./themeSlice');
    const reducer = module.default;

    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setTheme only allows dark/light and persists the value', async () => {
    const module = await import('./themeSlice');
    const reducer = module.default;
    const { setTheme } = module;

    let state = reducer(undefined, { type: '@@INIT' });
    state = reducer(state, setTheme('dark'));
    expect(state.mode).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    state = reducer(state, setTheme('invalid'));
    expect(state.mode).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('toggleTheme switches mode and updates root class', async () => {
    const module = await import('./themeSlice');
    const reducer = module.default;
    const { toggleTheme } = module;

    let state = reducer(undefined, { type: '@@INIT' });
    const start = state.mode;

    state = reducer(state, toggleTheme());
    expect(state.mode).toBe(start === 'dark' ? 'light' : 'dark');

    if (state.mode === 'dark') {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    } else {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    }
  });
});
