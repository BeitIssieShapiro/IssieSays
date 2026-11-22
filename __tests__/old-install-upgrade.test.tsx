/**
 * Upgrade from data created by the 1.6.2 app (captured from a device): rename a button
 * and press Save, both in the profile that was active and after reopening it from the list.
 */
import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react-native';

(global as any).__mmkvSeed = require('../test-utils/fixtures/old-install/mmkv.json');
const { flush } = require('../test-utils/app-mocks');

const RNFS = require('react-native-fs');
RNFS.__files.set('/docs/profiles/שלום.json',
    JSON.stringify(require('../test-utils/fixtures/old-install/profile-שלום.json')));

async function renameButton(index: number, newName: string) {
    const RN = require('react-native');
    const { ButtonCard } = require('../src/button-card');
    act(() => screen.UNSAFE_getAllByType(ButtonCard)[index].props.onEditButton());
    await flush();
    fireEvent.changeText(screen.UNSAFE_getAllByType(RN.TextInput)[0], newName);
    await flush();
    fireEvent.press(screen.getByText('Save'));
    await flush();
}

test('renaming a button after upgrading from 1.6.2 data shows on the card and persists', async () => {
    require('react-native').Alert.alert = jest.fn();
    const profile = require('../src/profile');
    await profile.Init();

    const { SettingsPage } = require('../src/settings');
    const { ProfilePicker } = require('../src/profile-picker');
    render(<SettingsPage windowSize={{ width: 1180, height: 820 }} onAbout={() => { }} onClose={() => { }} />);
    await flush();
    expect(screen.getAllByText('חג שמח').length).toBeGreaterThan(0);

    // in the profile that was active before the upgrade
    await renameButton(1, 'חג שמח מאוד');
    const Toast = require('react-native-toast-message').default;
    expect(Toast.show).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    expect(screen.queryAllByText('חג שמח מאוד').length).toBeGreaterThan(0);

    // reopen the same profile from the list, then rename again
    act(() => screen.UNSAFE_getByType(ProfilePicker).props.onSelect('שלום'));
    await flush();
    expect(screen.queryAllByText('חג שמח מאוד').length).toBeGreaterThan(0);
    await renameButton(1, 'פסח');
    expect(screen.queryAllByText('פסח').length).toBeGreaterThan(0);
    expect(Toast.show).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));

    // and it is in the profile file after switching away
    await profile.LoadProfile('DefaultProfile');
    const saved = JSON.parse(RNFS.__files.get('/docs/profiles/שלום.json'));
    expect(saved.buttons[1].name).toBe('פסח');
});
