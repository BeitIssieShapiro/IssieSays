import React, { useState } from 'react';
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
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import * as RNFS from 'react-native-fs';


import Icon from 'react-native-vector-icons/FontAwesome';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AwesomeButton from "react-native-really-awesome-button";
import { AudioWaveForm } from './audio-progress';
import { Spacer } from './uielements';

const audioRecorderPlayer = new AudioRecorderPlayer();
const FILE_NAME = "the-record.mp4";
const BTN_FOR_COLOR = "#CD6438";
const BTN_BACK_COLOR = "#C8572A";
console.log("doc path", RNFS.DocumentDirectoryPath);

function App(): React.JSX.Element {
  const [windowSize, setWindowSize] = useState({ width: 500, height: 500 });
  const isDarkMode = useColorScheme() === 'dark';
  const [recordProgress, setRecordProgress] = useState(0);
  const [_, setRecordProgressInterval] = useState<NodeJS.Timeout | undefined>(undefined);
  const [curr, setCurr] = useState(0.0);
  const [duration, setDuration] = useState(0.0);
  const [state, setState] = useState({ recordSecs: 0 })
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [log, setLog] = useState("");

  const isLandscape = ()=>windowSize.height<windowSize.width;

  const onStartRecord = async () => {
    const result = await audioRecorderPlayer.startRecorder()
      .then(() => setLog(prev => prev + "\nRecording started..."))
      .catch((err) => setLog(prev => prev + "\nerr start record" + err));
    RNFS.unlink(getFileName()).catch((e) => {/*ignore*/ });

    setRecordProgressInterval((prevInterval) => {
      if (prevInterval) clearInterval(prevInterval);
      return setInterval(() => setRecordProgress(old => old + 1), 100);
    });
    audioRecorderPlayer.addRecordBackListener((e) => {
      setState({
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
      });
      return;
    });
    setRecording(true);
  };

  const getFileName = () => {
    return RNFS.DocumentDirectoryPath + "/" + FILE_NAME;
  }

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder()
      .catch((err) => setLog(prev => prev + "\nerr stop record: " + err));

    setRecordProgressInterval((prev) => {
      if (prev) clearInterval(prev);
      setRecordProgress(0);
      return undefined;
    })

    audioRecorderPlayer.removeRecordBackListener();
    setRecording(false);
    setState({
      recordSecs: 0,
    });

    setLog(prev => prev + "\nRecording Ended...")

    let tmpFileName = ""
    if (result?.startsWith("file:")) {
      tmpFileName = result.substring(7);
      console.log("Saving...", getFileName())
      // Save to the Document path
      RNFS.moveFile(tmpFileName, getFileName())
        .then(() => setLog(prev => prev + "\nresult: " + result))
        .catch((err) => setLog(prev => prev + "\nerr move file: " + err));
    } else {
      setLog(prev => prev + "\nnot a file: " + result);
    }
    return tmpFileName;
  };

  const onStartPlay = async () => {
    if (recording) return;
    setPlaying(true)
    console.log('onStartPlay');
    await audioRecorderPlayer.startPlayer("file://" + getFileName())
      .then(() => setLog(prev => prev + "\nPlaying..."))
      .catch((err) => setLog(prev => prev + "\nerr playing: " + err));

    setCurr(0.0);
    audioRecorderPlayer.addPlayBackListener((e) => {
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
        setPlaying(false);
      }
      setState(newState);
      console.log(newState)
      return;
    });
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",

  };

  const bottonWidth = (isLandscape() ? windowSize.height:windowSize.width) * .4;

  return (
    <SafeAreaView style={backgroundStyle} onLayout={(e) => {
      let wz = e.nativeEvent.layout;
      setWindowSize(wz);
    }}>
      <TouchableOpacity style={{
        position: "absolute",
        top: 50, left: 50,
        width: 100, height: 100,
        borderRadius: 50,
        alignItems: "center",
        backgroundColor: BTN_BACK_COLOR,
        justifyContent: "center",
      }}
        onLongPress={() => {
          if (!recording) onStartRecord();
        }}

        onPress={() => {
          onStopRecord().then((res) => {
            if (res.startsWith("file:")) {
              console.log(res.substring(7))
            }
            console.log(res)
          });
        }}
      >
        <Icon size={55} name={recording ? "stop" : "microphone"} color="white" />
      </TouchableOpacity>

      <View style={{
        backgroundColor: BTN_FOR_COLOR,
        width: bottonWidth * 1.3,
        height: bottonWidth * 1.3,
        padding: bottonWidth * .15,
        marginTop: isLandscape()?"15%":"40%",
        borderRadius: bottonWidth * 1.3 / 2
      }}>
        <AwesomeButton
          borderColor={BTN_BACK_COLOR}
          borderWidth={3}
          backgroundColor={BTN_FOR_COLOR}
          backgroundDarker={BTN_BACK_COLOR}
          raiseLevel={10}
          width={bottonWidth}
          height={bottonWidth}
          borderRadius={bottonWidth / 2}
          onPress={() => onStartPlay()}

        > </AwesomeButton>
      </View>

      <Spacer h={30}/>
      {playing && <AudioWaveForm height={50} progress={duration && curr && curr / duration || 0} color={BTN_FOR_COLOR} /> }
      {recording && <AudioWaveForm height={50} infiniteProgress={recordProgress} color={BTN_FOR_COLOR} /> }
      {recording && <View style={{height:30}}><Text style={{ marginTop: 10 }}>{state.recordTime?.substring(0, 5) || ""}</Text></View> }



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
