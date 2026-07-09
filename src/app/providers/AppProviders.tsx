import { PropsWithChildren, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { initializeDatabase } from '../../infrastructure/database/database';
import { loadThemeMode } from '../../application/state/theme/themeSlice';

function AppBootstrap({ children }: PropsWithChildren) {
  useEffect(() => {
    void initializeDatabase();
    void store.dispatch(loadThemeMode());
  }, []);

  return children;
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <AppBootstrap>{children}</AppBootstrap>
    </Provider>
  );
}
