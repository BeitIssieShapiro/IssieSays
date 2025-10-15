import { useEffect, useState } from "react";

import * as RNFS from 'react-native-fs';
import { TouchableOpacity, View, Text } from "react-native";
import { AudioWaveForm } from "./audio-progress";
import { audioRecorderPlayer } from "./App";
import { PlayBackType } from "react-native-nitro-sound";
import { getRecordingFileName } from "./profile";
import { ensureAndroidCompatible, requestAudioPermission } from "./utils";
import { Settings } from "./setting-storage";
import { INSTALL } from "./settings";
import { MyIcon } from "./common/icons";
const TEMP_NAME = "_temp_";

export async function stopPlayback() {
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
}


export async function playRecording(name: string, playbackListner?: (playbackMeta: PlayBackType) => void): Promise<boolean> {
    const filePath = getRecordingFileName(name, true);
    return RNFS.exists(filePath).then(async (exists) => {
        if (exists) {
            console.log('Start playing ', name, filePath);
            audioRecorderPlayer.startPlayer(filePath);
            if (playbackListner) {
                audioRecorderPlayer.addPlayBackListener(playbackListner);
            }

            return true;
        } else {
            console.log("No recording exists", name);
            return false;
        }
    });
}

export function RecordButton({ name, backgroundColor, size, height, revision, onSave }:
    { name: string, backgroundColor: string, size: number, height: number, revision: number, onSave: (tmpName: string) => void }) {
    const [recordProgress, setRecordProgress] = useState(0);
    const [_, setRecordProgressInterval] = useState<NodeJS.Timeout | undefined>(undefined);
    const [state, setState] = useState<any>({ recordSecs: 0 })
    const [recording, setRecording] = useState<boolean>(false);
    const [log, setLog] = useState("");
    const [playing, setPlaying] = useState<boolean>(false);
    const [paused, setPaused] = useState<boolean>(false);
    const [currentName, setCurrentName] = useState<string>(name);

    const [recordingExists, setRecordingExists] = useState<boolean>(false);


    useEffect(() => {
        RNFS.exists(getRecordingFileName(currentName)).then((value: boolean) => {
            setRecordingExists(value);
        })
    }, [revision, currentName])

    const onStartRecord = async () => {
        console.log("about to start recording")
        if (await requestAudioPermission()) {
            await audioRecorderPlayer.startRecorder()
                .then(() => {
                    setLog(prev => prev + "\nRecording started...");
                    console.log("Recording started...");
                    Settings.set(INSTALL.firstTimeSettings, false);
                })
                .catch((err) => {
                    setLog(prev => prev + "\nerr start record" + err)
                    console.log("Failed to start recording...", err);
                });
            const tmpFile = getRecordingFileName(TEMP_NAME);
            RNFS.unlink(tmpFile).then(() => setRecordingExists(false))
                .catch((e) => {/*ignore*/ });
            setCurrentName(TEMP_NAME);

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
        }
    };

    const onStopRecord = async () => {
        const result = await audioRecorderPlayer.stopRecorder()
            .catch((err) => {
                setLog(prev => prev + "\nerr stop record: " + err)
            });

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

        let resFileName = ""
        if (result?.startsWith("file:")) {
            const tmpFile = getRecordingFileName(currentName);
            resFileName = result.substring(7);
            console.log("Saving...", tmpFile)
            // Save to the Document path
            RNFS.moveFile(ensureAndroidCompatible(resFileName), tmpFile)
                .then(() => {
                    console.log("Saving done", tmpFile)
                    onSave(currentName);
                    //setLog(prev => prev + "\nresult: " + result)
                    setRecordingExists(true);
                })
                .catch((err) => console.log("err save", err));
        } else {
            setLog(prev => prev + "\nnot a file: " + result);
        }
        return resFileName;
    };

    return <View style={{ flexDirection: "column", width: size * 4, height }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
            <TouchableOpacity style={{

                width: size,
                height: size,
                borderRadius: size / 2,
                alignItems: "center",
                backgroundColor: backgroundColor,
                justifyContent: "center",
                marginBottom: 10

            }}
                onPress={() => {
                    if (!recording) {
                        if (playing || paused) {
                            audioRecorderPlayer.stopPlayer();
                            setPlaying(false);
                            setPaused(false);
                        }
                        onStartRecord();
                        return;
                    }

                    onStopRecord().then((res) => {

                    });
                }}

            >
                <MyIcon info={{ type: "MDI", name: recording ? "stop" : "microphone", color: "white", size: size * 4 / 5 }} />
            </TouchableOpacity>

            <TouchableOpacity style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                alignItems: "center",
                backgroundColor: recordingExists ? backgroundColor : "lightgray",
                justifyContent: "center",
                marginLeft: size / 2,
                marginRight: size / 2,
                marginBottom: 10
            }}
                onPress={async () => {
                    if (recording) {
                        return;
                    }
                    if (paused) {
                        audioRecorderPlayer.resumePlayer().then(() => {
                            setPlaying(true);
                            setPaused(false);
                        })
                        return;
                    }
                    if (playing) {
                        audioRecorderPlayer.pausePlayer().then(() => {
                            setPlaying(false);
                            setPaused(true);
                        })
                        return;
                    }
                    const success = await playRecording(name, (e) => {
                        const newState = {
                            currentPositionSec: e.currentPosition,
                            currentDurationSec: e.duration,
                            playTime: audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
                            duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
                        }

                        if (e.currentPosition >= e.duration - 100) {
                            // We’re within 100ms of the end → treat it as “finished”.
                            setPlaying(false);
                            stopPlayback();
                        }

                        //setState(newState);
                        console.log("play progress", newState)
                        return;
                    })
                    if (success) {
                        setPlaying(true);
                    }
                }}
            >
                <MyIcon info={{ type: "MDI", name: !playing ? "play" : "pause", color: "white", size: size * 4 / 5 }} />
            </TouchableOpacity>
            <View style={{ flexDirection: "column", height: 70, width: size * 2, marginTop: 5 }}>
                 <AudioWaveForm width={size * 2} height={40} infiniteProgress={recordProgress} color={backgroundColor} baseColor={"lightgray"} />
                <Text allowFontScaling={false} style={{ fontSize: 16, width: size * 2, height: 30, textAlign: "center" }}>{state.recordTime?.substring(0, 5) || "0.0"}</Text>
            </View>

        </View>

    </View>
}
