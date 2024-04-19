import { useEffect, useState } from "react";
import { AnimatedButton } from "./animatedButton";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import * as RNFS from 'react-native-fs';
import { View } from "react-native";
import { AudioWaveForm } from "./audio-progress";
import { Text } from "react-native-svg";
import { BTN_BACK_COLOR } from "./App";


export const getRecordingFileName = (recName: string) => {
    return RNFS.DocumentDirectoryPath + "/" + recName + ".mp4";
}
const audioRecorderPlayer = new AudioRecorderPlayer();


export function RecordButton({ name, backgroundColor, size }: { name: string, backgroundColor: string, size: number }) {
    const [recordProgress, setRecordProgress] = useState(0);
    const [_, setRecordProgressInterval] = useState<NodeJS.Timeout | undefined>(undefined);
    const [state, setState] = useState<any>({ recordSecs: 0 })
    const [recording, setRecording] = useState<boolean>(false);
    const [log, setLog] = useState("");

    useEffect(() => {
        return () => {
            // unmount event
            setRecording((nowRecording) => {
                if (nowRecording) {
                    // stop recording:
                    onStopRecord()

                }
                return false;
            })
        }
    }, [])

    const getFileName = () => {
        return getRecordingFileName(name);
    }

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
                .then(() => setLog(prev => prev + "\nresult: " + result))
                .catch((err) => setLog(prev => prev + "\nerr move file: " + err));
        } else {
            setLog(prev => prev + "\nnot a file: " + result);
        }
        return tmpFileName;
    };


    return <View style={{ flexDirection: "column", alignItems: "center", width: 200 }}>
        <View style={{

            width: size, height: size,
            borderRadius: size / 2,
            alignItems: "center",
            backgroundColor: backgroundColor,
            justifyContent: "center",
        }}>
            <AnimatedButton
                size={size}
                duration={recording ? 0 : 0}
                icon={recording ? "stop" : "microphone"}
                onPress={() => {
                    if (!recording) {
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
            />
        </View>
        <View style={{ height: 50, width: size * 2 }}>
            {recording && <AudioWaveForm height={50} infiniteProgress={recordProgress} color={BTN_BACK_COLOR} baseColor={"white"} />}
            {recording && <View style={{ height: 30 }}><Text style={{ marginTop: 10 }}>{state.recordTime?.substring(0, 5) || ""}</Text></View>}
        </View>
    </View>
}
