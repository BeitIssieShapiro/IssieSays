import React, { useCallback, useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Image
} from 'react-native';

import * as RNFS from 'react-native-fs';


//import Icon from 'react-native-vector-icons/FontAwesome';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AwesomeButton from "react-native-really-awesome-button";
import { AudioWaveForm } from './audio-progress';
import { RectView, Spacer } from './uielements';
import { BACKGROUND, BUTTONS, BUTTONS_COLOR, BUTTONS_IMAGE_URLS, BUTTONS_NAMES, BUTTONS_SHOW_NAMES, getSetting, SettingsButton, SettingsPage } from './settings';
import { About } from './about';
import { getRecordingFileName, playRecording } from './recording';
import { increaseColor } from './color-picker';


export const audioRecorderPlayer = new AudioRecorderPlayer();

const BTN_FOR_COLOR = "#CD6438";
export const BTN_BACK_COLOR = "#C8572A";
console.log("doc path", RNFS.DocumentDirectoryPath);


function App(): React.JSX.Element {
  const [windowSize, setWindowSize] = useState({ width: 500, height: 500 });
  const [playing, setPlaying] = useState<string | undefined>(undefined);
  const [playingInProgress, setPlayingInProgress] = useState(false);
  const [curr, setCurr] = useState(0.0);
  const [duration, setDuration] = useState(0.0);
  //const [state, setState] = useState<any>({ recordSecs: 0 })

  const [log, setLog] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const isLandscape = () => windowSize.height < windowSize.width;

  const mainBackgroundColor = getSetting(BACKGROUND.name, BACKGROUND.LIGHT);
  const onStartPlay = useCallback(async (recName: string) => {
    if (playingInProgress) return;

    const success = await playRecording(recName, (e) => {
      setCurr(e.currentPosition);
      setDuration(e.duration);
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
    return <SafeAreaView style={backgroundStyle} onLayout={(e) => {
      let wz = e.nativeEvent.layout;
      setWindowSize(wz);
    }}><SettingsPage
        windowSize={windowSize}
        onAbout={() => {
          console.log("On About")
          setShowAbout(true);

          setShowSettings(false);
        }}
        onClose={() => setShowSettings(false)}
      /></SafeAreaView >
  }

  const numOfButtons: number = getSetting(BUTTONS.name, 1) as number;
  const buttonColors = getSetting(BUTTONS_COLOR.name, [BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR, BTN_BACK_COLOR]);
  const buttonImageUrls = getSetting(BUTTONS_IMAGE_URLS.name, ["", "", "", ""]);
  const buttonShowNames = getSetting(BUTTONS_SHOW_NAMES.name, [false, false, false, false]);
  const buttonTexts = getSetting(BUTTONS_NAMES.name, ["", "", "", ""]);

  const buttonsInCol = numOfButtons < 2 ? 1 : 2

  let bottonWidth = (isLandscape() ? windowSize.height : windowSize.width) * (buttonsInCol > 1 ?
    (numOfButtons > 2 ? .32 : .4) : .6);

  if (windowSize.height < 450) {
    bottonWidth *= .8;
  }

  console.log("w/h", windowSize)

  return (
    <SafeAreaView style={backgroundStyle} onLayout={(e) => {
      let wz = e.nativeEvent.layout;
      setWindowSize(wz);
    }}>
      <SettingsButton onPress={() => setShowSettings(true)} backgroundColor={mainBackgroundColor} />

      <RectView buttonWidth={bottonWidth} width={windowSize.width} height={windowSize.height} isLandscape={isLandscape()}>

        {Array.from(Array(numOfButtons).keys()).map((i: any) => (
          <View key={i}>
            <View style={{
              backgroundColor: buttonColors[i],
              width: bottonWidth * 1.3,
              height: bottonWidth * 1.3,
              padding: bottonWidth * .15,
              // marginTop: isLandscape() ? "15%" : "40%",
              borderRadius: bottonWidth * 1.3 / 2,
            }}>
              <AwesomeButton
                borderColor={buttonColors[i]}
                borderWidth={3}
                backgroundColor={increaseColor(buttonColors[i], 15)}
                backgroundDarker={buttonColors[i]}
                raiseLevel={10}
                width={bottonWidth}
                height={bottonWidth}
                borderRadius={bottonWidth / 2}
                onPress={() => onStartPlay(i)}
                animatedPlaceholder={false}
              >
                {buttonImageUrls[i].length > 0 ? <View
                  style={{
                    justifyContent: "center", alignItems: "center",
                    width: bottonWidth * 5 / 6,
                    height: bottonWidth * 5 / 6,
                    backgroundColor: "white",
                    borderRadius: bottonWidth * 5 / 12,
                  }} >
                  <Image source={{ uri: buttonImageUrls[i] }}
                    style={{
                      borderRadius: bottonWidth * (5 / 12), 
                      height: bottonWidth * (5 / 6) , width: bottonWidth * (5 / 6) ,
                      transform: [{ scale: 0.9 }]
                    }} />
                </View> :
                  " "}

              </AwesomeButton>
            </View>
            {buttonShowNames[i] == true && <Text style={{ fontSize: 27, textAlign: "center" }}>{buttonTexts[i]}</Text>}

            <Spacer h={10} />
            {playing === i ? <AudioWaveForm width={bottonWidth} height={50} progress={duration && curr && curr / duration || 0} color={BTN_FOR_COLOR} baseColor={"lightgray"} /> :
              <Spacer h={50} />}

          </View>
        ))
        }

      </RectView>


      {/* <ScrollView style={{ maxHeight: 200, width: "100%" }}>
        <Text style={{ margin: 20, width: "100%" }}>Log:{"\n" + log}</Text>
      </ScrollView>
      <Button onPress={() => setLog("")} title="Clear" /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
