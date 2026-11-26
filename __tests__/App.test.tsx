/**
 * Smoke test: the whole app mounts with native modules stubbed (test-utils/app-mocks).
 * Replaces the template test, which failed on untranspiled native packages.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

const { flush } = require('../test-utils/app-mocks');
// App also uses the package check and alert host, which app-mocks' issie-shared lacks
Object.assign(require('@beitissieshapiro/issie-shared'), {
    checkPackage: async () => ({ ok: true }), showPackageCheckAlert: () => undefined,
    IssieAlertHost: () => null, FeedbackDialog: () => null, firebaseInit: () => undefined,
});
// the screen-sizer dev tool spreads a device list; app-mocks stubs it as components only
jest.doMock('@bam.tech/react-native-screen-sizer', () => {
    const R = require('react');
    const Wrapper = ({ children }: any) => R.createElement(R.Fragment, null, children);
    return { __esModule: true, setup: () => undefined, Wrapper, defaultDevices: { all: [] } };
}, { virtual: true });

test('App renders without crashing', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    require('react-native').Alert.alert = jest.fn();
    await require('../src/profile').Init(); // done by index.js before registering the app
    const App = require('../src/App').default;
    const view = render(<App />);
    await flush();
    expect(view.toJSON()).toBeTruthy();
    view.unmount();
});
