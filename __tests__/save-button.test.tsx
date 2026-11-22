/**
 * Open an existing profile, rename a button in the editor, press Save,
 * and check that the Settings card shows the new name.
 */
import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react-native';
import { flush } from '../test-utils/app-mocks';

const RNFS = require('react-native-fs');

test('renaming a button in an existing profile shows on the Settings card', async () => {
    const RN = require('react-native');
    RN.Alert.alert = jest.fn();

    const profile = require('../src/profile');
    await profile.Init();

    // an existing profile, as written by 1.6.2's SaveProfile
    RNFS.__files.set('/docs/img.png', 'AAAA');
    const existing = {
        oneAfterTheOther: false,
        buttons: [
            { name: 'סוכות', color: '#2E9E4A', imageUrl: 'img.png', imageB64: 'AAAA', showName: true, recording: 'UkVD', scale: 1, offset: { x: 0, y: 0 }, rotation: 0, dirty: true },
            { name: 'חג', color: '#C8572A', imageUrl: '', showName: true, recording: 'UkVD', scale: 1, offset: { x: 0, y: 0 }, rotation: 0, dirty: true },
            { name: '', color: '#C8572A', imageUrl: '', showName: false, recording: '', scale: 1, offset: { x: 0, y: 0 }, rotation: 0, dirty: false },
            { name: '', color: '#C8572A', imageUrl: '', showName: false, recording: '', scale: 1, offset: { x: 0, y: 0 }, rotation: 0, dirty: false },
        ],
    };
    RNFS.__files.set('/docs/profiles/חגים.json', JSON.stringify(existing));
    await profile.LoadProfile('חגים');

    const { SettingsPage } = require('../src/settings');
    render(<SettingsPage windowSize={{ width: 1180, height: 820 }} onAbout={() => { }} onClose={() => { }} />);
    await flush();

    expect(screen.getAllByText('חג').length).toBeGreaterThan(0);

    // open the editor for the second button
    const { ButtonCard } = require('../src/button-card');
    const cards = screen.UNSAFE_getAllByType(ButtonCard);
    expect(cards.length).toBe(4);
    act(() => cards[1].props.onEditButton());
    await flush();

    const input = screen.UNSAFE_getAllByType(RN.TextInput)[0];
    fireEvent.changeText(input, 'חג שמח');
    await flush();
    fireEvent.press(screen.getByText('Save'));
    await flush();

    const Toast = require('react-native-toast-message').default;
    expect(Toast.show).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    expect(screen.queryAllByText('חג שמח').length).toBeGreaterThan(0);
    expect(profile.readCurrentProfile().buttons[1].name).toBe('חג שמח');
});
