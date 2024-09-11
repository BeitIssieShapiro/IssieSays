import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icon from 'react-native-vector-icons/AntDesign';
import { BTN_BACK_COLOR } from "./App";

export function AnimatedButton({ duration, icon, onPress, size, color }: any) {
    const [progress, setProgress] = useState(false);

    if (duration === 0)
        return <Icon size={size} name={icon} color={color} onPress={() => onPress()} />;

    return (<TouchableOpacity activeOpacity={1} style={{ zIndex: 1000, width: size*1.2, height: size*1.2, alignItems: "center", justifyContent: "center" }}
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
            style={{ position: "absolute", top: 0, left: 0, width: size, height: size }}
            duration={duration}
            rotation={0}
            size={size * 1.2}
            width={7}
            fill={100}
            tintColor="white"
            onAnimationComplete={() => console.log('onAnimationComplete')}
            backgroundColor={color}
        />}
        <Icon size={size} name={icon} color={color} />

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