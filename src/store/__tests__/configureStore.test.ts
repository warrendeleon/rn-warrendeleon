import type { RootState } from '../configureStore';
import { persistor, store } from '../configureStore';

describe('configureStore', () => {
  it('exports a configured store', () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
  });

  it('exports a persistor', () => {
    expect(persistor).toBeDefined();
  });

  it('has the expected state shape', () => {
    const state: RootState = store.getState();
    expect(state).toHaveProperty('settings');
  });

  it('initializes with default settings state', () => {
    const state = store.getState();
    expect(state.settings).toEqual({
      theme: 'system',
      language: 'en',
    });
  });
});
