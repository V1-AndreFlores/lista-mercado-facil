import { PropsWithChildren, useEffect } from 'react';
import { Provider } from 'react-redux';
import { loadThemeMode } from '../../application/state/theme/themeSlice';
import { store } from '../store/store';

function AppBootstrap({ children }: PropsWithChildren) {
  useEffect(() => {
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
