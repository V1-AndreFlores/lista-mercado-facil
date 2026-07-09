jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import themeReducer, { setThemeMode, toggleThemeMode } from '../application/state/theme/themeSlice';

describe('themeSlice', () => {
  it('deve iniciar com tema claro', () => {
    const state = themeReducer(undefined, { type: 'unknown' });

    expect(state.mode).toBe('light');
  });

  it('deve alterar para tema escuro', () => {
    const state = themeReducer(undefined, setThemeMode('dark'));

    expect(state.mode).toBe('dark');
  });

  it('deve alternar entre claro e escuro', () => {
    const darkState = themeReducer(undefined, toggleThemeMode());
    const lightState = themeReducer(darkState, toggleThemeMode());

    expect(darkState.mode).toBe('dark');
    expect(lightState.mode).toBe('light');
  });
});
