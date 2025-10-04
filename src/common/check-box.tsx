import { TouchableOpacity, Text } from "react-native";
import { MyIcon } from "./icons";

interface CheckboxProps {
    caption: string;
    checked: boolean;
    onToggle: () => void;
    size: number;
}

export function Checkbox({ caption, checked, onToggle, size }: CheckboxProps) {

    return <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginEnd: 15 }}
        onPress={() => onToggle()}>
        {checked ?
            <MyIcon info={{ type: "MDI", name: "checkbox-outline", size }} />
            :
            <MyIcon info={{ type: "MDI", name: "checkbox-blank-outline", size }} />

        }
        <Text allowFontScaling={false} style={{ fontSize: 2 / 3 * size }} >{caption}</Text>
    </TouchableOpacity>
}