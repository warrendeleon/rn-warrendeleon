/* eslint-disable no-undef */
// Mock react-dom for React Native tests
// Gluestack UI has some web dependencies that shouldn't run in RN tests

module.exports = {
  createPortal: jest.fn(element => element),
  findDOMNode: jest.fn(),
  flushSync: jest.fn(fn => fn()),
  render: jest.fn(),
  unmountComponentAtNode: jest.fn(),
  unstable_batchedUpdates: jest.fn(fn => fn()),
};
