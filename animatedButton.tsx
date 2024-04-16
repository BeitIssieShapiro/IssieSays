import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icon from 'react-native-vector-icons/FontAwesome';
import { BTN_BACK_COLOR } from "./App";

export function AnimatedButton({ duration, icon, onPress }: any) {
    const [progress, setProgress] = useState(false);
    if (duration === 0)
        return <Icon size={55} name={icon} color="white" onPress={() => onPress()} />;

    return (<TouchableOpacity activeOpacity={1} style={{ width: 100, height: 100, alignItems: "center", justifyContent: "center" }}
        delayLongPress={duration}
        onLongPress={() => {
            setProgress(false);
            onPress()
        }}
        onPressIn={() => {
            if (duration > 0) {
                setProgress(true);
            }
        }}
        onPressOut={() => setProgress(false)}

    >
        {progress && <AnimatedCircularProgress
            style={{ position: "absolute", top: 0, left: 0, width: 100, height: 100 }}
            duration={duration}
            rotation={0}
            size={100}
            width={7}
            fill={100}
            tintColor="white"
            onAnimationComplete={() => console.log('onAnimationComplete')}
            backgroundColor={BTN_BACK_COLOR}
        />}
        <Icon size={55} name={icon} color="white" />

    </TouchableOpacity>


    );

}

const styles = StyleSheet.create({
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 15,
        borderColor: 'blue',
    },
});
/*  <TouchableOpacity style={{width:100, height:100}}>
           <AnimatedCircularProgress
                style={{ position: "absolute", top: 0, left: 0 }}
                duration={duration}
                rotation={0}
                size={55}
                width={55}
                fill={100}
                tintColor="#00e0ff"
                onAnimationComplete={() => console.log('onAnimationComplete')}
                backgroundColor="#3d5875" /> 

            

         </TouchableOpacity> */