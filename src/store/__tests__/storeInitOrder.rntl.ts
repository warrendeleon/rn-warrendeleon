/**
 * Guards the require order the app actually boots in.
 *
 * `index.js` loads App before anything touches the store, so App's imports
 * decide when configureStore runs. When the store imported feature barrels,
 * those barrels pulled in screens, the screens imported `@app/store`, and the
 * cycle left a reducer undefined at combineReducers time. Redux dropped the
 * slice silently and every selector reading it threw.
 *
 * configureStore.rntl.ts imports the store first, so it cannot catch this.
 */
describe('store initialisation under the app boot order', () => {
  it('keeps every slice when App is required before the store', () => {
    require('@app/app/App');

    const { store } = require('@app/store/configureStore');
    const state = store.getState();

    expect(Object.keys(state)).toEqual(
      expect.arrayContaining(['settings', 'auth', 'profile', 'workExperience', 'education'])
    );
  });

  it('leaves the settings slice readable rather than undefined', () => {
    require('@app/app/App');

    const { store } = require('@app/store/configureStore');

    expect(store.getState().settings).toEqual({ theme: 'system', language: 'en' });
  });
});
