import { useEffect, useState } from "react";
//import { AnimatedButton } from "./animatedButton";
import Icon from 'react-native-vector-icons/FontAwesome';

import * as RNFS from 'react-native-fs';
import { TouchableOpacity, View, Text } from "react-native";
import { AudioWaveForm } from "./audio-progress";
import { BTN_BACK_COLOR, audioRecorderPlayer } from "./App";
import { PlayBackType } from "react-native-audio-recorder-player";
import { isRTL } from "./lang";


export const getRecordingFileName = (recName: string) => {
    return RNFS.DocumentDirectoryPath + "/" + recName + ".mp4";
}

export async function playRecording(name: string, playbackListner?: (playbackMeta: PlayBackType) => void): Promise<boolean> {
    const filePath = "file://" + getRecordingFileName(name);
    return RNFS.exists(filePath).then(exists => {
        if (exists) {
            console.log('Start playing ', name);
            audioRecorderPlayer.startPlayer(filePath);
            if (playbackListner) {
                audioRecorderPlayer.addPlayBackListener(playbackListner);
            }

            return true;
        } else {
            console.log("No recording exists", name)
            return false;
        }
    });
}

export function RecordButton({ name, backgroundColor, size, height }:
    { name: string, backgroundColor: string, size: number, height: number }) {
    const [recordProgress, setRecordProgress] = useState(0);
    const [_, setRecordProgressInterval] = useState<NodeJS.Timeout | undefined>(undefined);
    const [state, setState] = useState<any>({ recordSecs: 0 })
    const [recording, setRecording] = useState<boolean>(false);
    const [log, setLog] = useState("");
    const [playing, setPlaying] = useState<boolean>(false);
    const [paused, setPaused] = useState<boolean>(false);

    const [recordingExists, setRecordingExists] = useState<boolean>(false);



    const getFileName = () => {
        return getRecordingFileName(name);
    }

    useEffect(() => {
        RNFS.exists(getFileName()).then((value: boolean) => {
            setRecordingExists(value);
        })
    }, [])

    const onStartRecord = async () => {
        console.log("about to start recording")
        const result = await audioRecorderPlayer.startRecorder()
            .then(() => {
                setLog(prev => prev + "\nRecording started...");
                console.log("Recording started...");
            })
            .catch((err) => {
                setLog(prev => prev + "\nerr start record" + err)
                console.log("Failed to start recording...", err);
            });
        RNFS.unlink(getFileName()).then(() => setRecordingExists(false))
            .catch((e) => {/*ignore*/ });

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

        let tmpFileName = ""
        if (result?.startsWith("file:")) {
            tmpFileName = result.substring(7);
            console.log("Saving...", getFileName())
            // Save to the Document path
            RNFS.moveFile(tmpFileName, getFileName())
                .then(() => {
                    setLog(prev => prev + "\nresult: " + result)
                    setRecordingExists(true);
                })
                .catch((err) => setLog(prev => prev + "\nerr move file: " + err));
        } else {
            setLog(prev => prev + "\nnot a file: " + result);
        }
        return tmpFileName;
    };

    return <View style={{ flexDirection: "column", width: size * 4, height }}>
        <View style={{ flexDirection: isRTL() ? "row" : "row-reverse", justifyContent: "flex-start", alignItems: "center" }}>
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
                        if (res.startsWith("file:")) {
                            console.log(res.substring(7))
                        }
                        console.log(res)
                    });
                }}

            >
                <Icon
                    name={recording ? "stop" : "microphone"}
                    color={"white"}
                    size={size / 2}
                />

            </TouchableOpacity>

            <TouchableOpacity style={[{

                width: size / 2,
                height: size / 2,
                borderRadius: size / 4,
                alignItems: "center",
                backgroundColor: recordingExists ? backgroundColor : "lightgray",
                justifyContent: "center",
                marginLeft: size / 2,
                marginBottom: 10
            }, isRTL() ? { marginLeft: size / 2 } : { marginRight: size / 2 }]}
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
                        if (newState.playTime == newState.duration) {
                            setPlaying(false);
                        }
                        //setState(newState);
                        console.log(newState)
                        return;
                    })
                    if (success) {
                        setPlaying(true);
                    }
                }}
            >

                <Icon
                    name={!playing ? "play" : "pause"}
                    color={"white"}
                    size={size / 4}
                    style={{ marginLeft: 6, marginRight: 3 }}
                />
            </TouchableOpacity>
            <View style={{ flexDirection: "column", height: 70, width: size * 2 }}>
                {recording && <AudioWaveForm width={size * 2} height={40} infiniteProgress={recordProgress} color={BTN_BACK_COLOR} baseColor={"lightgray"} />}
                {recording && <Text style={{ fontSize: 16, width: size * 2, height: 30, textAlign: "center" }}>{state.recordTime?.substring(0, 5) || ""}</Text>}
            </View>

        </View>

    </View>
}
