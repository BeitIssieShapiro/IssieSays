import React, { useCallback, useRef, useState } from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { NewAppScreen } from '@react-native/new-app-screen';

import { createSound, Sound } from 'react-native-nitro-sound';
import { MainButton, RectView } from './uielements';
import { About } from './about';
import { playRecording } from './recording';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Settings } from './setting-storage';
import { readCurrentProfile } from './profile';
import { BACKGROUND, BUTTONS, CURRENT_PROFILE, ONE_AFTER_THE_OTHER, SettingsPage } from './settings';
import { View } from 'react-native';
import { CountdownButton } from './common/countdown-btn';

const toastConfig = {

  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ width: "80%" }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ width: "80%" }}
    />
  )
};


export const audioRecorderPlayer = createSound();

export const BTN_BACK_COLOR = "#C8572A";




function Main(): React.JSX.Element {
  const [windowSize, setWindowSize] = useState({ width: 500, height: 500 });
  const [playing, setPlaying] = useState<string | undefined>(undefined);
  const [playingInProgress, setPlayingInProgress] = useState(false);
  // const [curr, setCurr] = useState(0.0);
  // const [duration, setDuration] = useState(0.0);
  // const [profile, setProfile] = useState<Profile>(readDefaultProfile());

  const [log, setLog] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [nextButton, setNextButton] = useState(0);

  const isLandscape = () => windowSize.height < windowSize.width;

  //console.log("Setting is ", Settings.getNumber(BUTTONS.name, 8))


  const mainBackgroundColor = Settings.getString(BACKGROUND.name, BACKGROUND.LIGHT);
  const oneAfterTheOther = Settings.getBoolean(ONE_AFTER_THE_OTHER.name, false);
  const currentProfileName = Settings.getString(CURRENT_PROFILE.name, "");
  const prevProfileRef = useRef<string>(currentProfileName);

  if (!oneAfterTheOther && nextButton > 0 || currentProfileName != prevProfileRef.current) {
    // reset
    setNextButton(0);
  }

  prevProfileRef.current = currentProfileName;

  const safeAreaInsets = useSafeAreaInsets();


  const backgroundStyle = {
    direction: "ltr",
    width: "100%",
    height: "100%",
    // margin: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: mainBackgroundColor
  };

  if (showAbout) {
    return <About onClose={() => setShowAbout(false)} />
  }

  if (showSettings) {
    return <>
      <SafeAreaProvider>
        {/* @ts-ignore*/}
        <View style={backgroundStyle} onLayout={(e) => {
          let wz = e.nativeEvent.layout;
          setWindowSize(wz);
        }}>
          <SettingsPage
            windowSize={windowSize}
            onAbout={() => {
              console.log("On About")
              setShowAbout(true);

              setShowSettings(false);
            }}
            onClose={() => setShowSettings(false)}
          />
        </View >
      </SafeAreaProvider>

      <Toast position='bottom' bottomOffset={30} config={toastConfig} />
    </>
  }

  const p = readCurrentProfile();

  const activeButtons = oneAfterTheOther ?
    [nextButton] :
    Array.from(Array(p.buttons.length).keys());


  const buttonsInCol = activeButtons.length < 2 ? 1 : 2

  let bottonWidth = (isLandscape() ? windowSize.height : windowSize.width) * (buttonsInCol > 1 ?
    (activeButtons.length > 2 ? .32 : .4) : .6);

  if (windowSize.height < 450) {
    bottonWidth *= .8;
  }

  console.log("w/h", windowSize)


  const handlePlayComplete = () => {
    console.log("handlePlayComplete")
    setNextButton((prev) => {
      const buttonNum = Settings.getNumber(BUTTONS.name, 1);
      if (prev + 1 >= buttonNum) {
        return 0;
      }
      return prev + 1;
    })
  }


  // @ts-ignore
  return (<View style={backgroundStyle} onLayout={(e) => {
    let wz = e.nativeEvent.layout;
    setWindowSize(wz);
  }}  >
    <CountdownButton iconSize={45} onComplete={() => setShowSettings(true)} style={{
      top: Math.max(25, 20 + safeAreaInsets.top),
      right: Math.max(20, 15 + safeAreaInsets.right),

    }}
      countdownStyle={{ backgroundColor: mainBackgroundColor == BACKGROUND.LIGHT ? "gray" : "white" }}
      icon="settings-outline"
      iconType="Ionicons"
      textKey="OpenIn"
      textLocation="left"
      iconColor={mainBackgroundColor == BACKGROUND.LIGHT ? "black" : "white"}

    />

    <RectView buttonWidth={bottonWidth} width={windowSize.width} height={windowSize.height} isLandscape={isLandscape()}>

      {activeButtons.map((i: any) => (
        <MainButton
          key={i}
          name={p.buttons[i].name}
          fontSize={27}
          showName={p.buttons[i].showName}
          width={bottonWidth}
          raisedLevel={10}
          color={p.buttons[i].color == "#000000" && mainBackgroundColor == BACKGROUND.DARK ? "white" : p.buttons[i].color}
          imageUrl={p.buttons[i].imageUrl}
          appBackground={mainBackgroundColor}
          showProgress={true}
          recName={i + ""}
          onPlayComplete={oneAfterTheOther ? handlePlayComplete : undefined}
        />
      ))
      }

    </RectView>

    {oneAfterTheOther &&
      <CountdownButton iconSize={50} onComplete={() => setNextButton(0)}
        style={{ bottom: 10 + safeAreaInsets.bottom, right: windowSize.width / 2 - 25 }}
        countdownStyle={{ backgroundColor: mainBackgroundColor == BACKGROUND.LIGHT ? "gray" : "white" }}
        icon="restart"
        iconType="MDI"
        textKey="ResetButtons"
        textLocation="left"
        iconColor={mainBackgroundColor == BACKGROUND.LIGHT ? "black" : "white"}
      />
    }

    {/* <ScrollView style={{ maxHeight: 200, width: "100%" }}>
        <Text style={{ margin: 20, width: "100%" }}>Log:{"\n" + log}</Text>
      </ScrollView>
      <Button onPress={() => setLog("")} title="Clear" /> */}
  </View >
  );
}



export default function App() {
  return <SafeAreaProvider>
    <Main />
  </SafeAreaProvider>


}
