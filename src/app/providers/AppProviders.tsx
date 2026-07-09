import { PropsWithChildren, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { initializeDatabase } from '../../infrastructure/database/database';

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    void initializeDatabase();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
