import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

/**
 * Reactotron configuration for Redux debugging
 * Only enabled in development mode
 */
const reactotron = Reactotron.configure({
  name: 'warrendeleon',
})
  .useReactNative({
    networking: {
      ignoreUrls: /symbolicate/,
    },
  })
  .use(reactotronRedux())
  .connect();

export default reactotron;
