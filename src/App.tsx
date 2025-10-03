import React, { useCallback, useEffect, useState } from 'react';
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
import { BACKGROUND, SettingsButton, SettingsPage } from './settings';
import { View } from 'react-native';

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




function App(): React.JSX.Element {
  const [windowSize, setWindowSize] = useState({ width: 500, height: 500 });
  const [playing, setPlaying] = useState<string | undefined>(undefined);
  const [playingInProgress, setPlayingInProgress] = useState(false);
  // const [curr, setCurr] = useState(0.0);
  // const [duration, setDuration] = useState(0.0);
  // const [profile, setProfile] = useState<Profile>(readDefaultProfile());

  const [log, setLog] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const isLandscape = () => windowSize.height < windowSize.width;

  //console.log("Setting is ", Settings.getNumber(BUTTONS.name, 8))


  const mainBackgroundColor = Settings.getString(BACKGROUND.name, BACKGROUND.LIGHT);


  const onStartPlay = useCallback(async (recName: string) => {
    if (playingInProgress) return;

    const success = await playRecording(recName, (e) => {
      // setCurr(e.currentPosition);
      // setDuration(e.duration);
      const newState = {
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
      }
      if (newState.playTime == newState.duration) {
        setLog(prev => prev + "\nPlaying finished")
        setPlaying(undefined);
        setPlayingInProgress(false)
      }
      //setState(newState);
      console.log(newState)
      return;
    })
    if (success) {
      setPlaying(recName);
      setPlayingInProgress(true)
      setLog(prev => prev + "\Start Playing " + recName)
    }


  }, [playing, playingInProgress]);
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


  const buttonsInCol = p.buttons.length < 2 ? 1 : 2

  let bottonWidth = (isLandscape() ? windowSize.height : windowSize.width) * (buttonsInCol > 1 ?
    (p.buttons.length > 2 ? .32 : .4) : .6);

  if (windowSize.height < 450) {
    bottonWidth *= .8;
  }

  console.log("w/h", windowSize)

  return (
    <SafeAreaProvider>
      {/* @ts-ignore*/}
      <View style={backgroundStyle} onLayout={(e) => {
        let wz = e.nativeEvent.layout;
        setWindowSize(wz);
      }}
      >
        <SettingsButton onPress={() => setShowSettings(true)} backgroundColor={mainBackgroundColor} />

        <RectView buttonWidth={bottonWidth} width={windowSize.width} height={windowSize.height} isLandscape={isLandscape()}>

          {Array.from(Array(p.buttons.length).keys()).map((i: any) => (
            <MainButton
              key={i}
              name={p.buttons[i].name}
              fontSize={27}
              showName={p.buttons[i].showName}
              width={bottonWidth}
              raisedLevel={10}
              color={p.buttons[i].color}
              imageUrl={p.buttons[i].imageUrl}
              appBackground={mainBackgroundColor}
              showProgress={true}
              recName={i + ""}
            />
          ))
          }

        </RectView>


        {/* <ScrollView style={{ maxHeight: 200, width: "100%" }}>
        <Text style={{ margin: 20, width: "100%" }}>Log:{"\n" + log}</Text>
      </ScrollView>
      <Button onPress={() => setLog("")} title="Clear" /> */}
      </View>
    </SafeAreaProvider>
  );
}

export default App;
