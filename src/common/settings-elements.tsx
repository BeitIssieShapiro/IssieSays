import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { colors, gStyles } from "./common-style"
import { IconProps, MyIcon } from "./icons"
import {  Spacer } from "../uielements"
import { isRTL, translate } from "../lang"
import { IconButton } from "./components"

export function ScreenTitle({ title, onClose, onAbout, icon }: { title: string, onClose: () => void, onAbout?: () => void, icon?: IconProps }) {
    return <View style={gStyles.screenTitle}>
        {onAbout ?
            <MyIcon info={{ type: "MDI", name: "information-outline", color: gStyles.screenTitleText.color, size: 45 }} onPress={onAbout} />
            :
            <Spacer h={10} />}
        <Text allowFontScaling={false} style={gStyles.screenTitleText}>{title}</Text>
        <IconButton
            icon={icon}
            onPress={onClose}
            backgroundColor="white"
        />
        {/* <IconAnt name={iconName} color={gStyles.screenTitleText.color} size={35} onPress={onClose} /> */}
    </View>
}

export function ScreenSubTitle({ titleIcon, elementTitle, elementName, actionName, actionIcon, onAction, busy }:
    { titleIcon?: IconProps, elementTitle: string, elementName: string, actionName: string, actionIcon: IconProps, onAction: () => void , busy?:boolean}) {

    return (
        <View style={[gStyles.screenSubTitle, {
            flexDirection: "column",
            direction: isRTL() ? "rtl" : "ltr",

        }]} >

            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {titleIcon && <MyIcon info={titleIcon} />}
                <Text allowFontScaling={false} style={gStyles.screenSubTitleElementTitle}>{elementTitle}:</Text>
                {busy && <ActivityIndicator color="#0000ff" size="small" />}
                <Text allowFontScaling={false} style={[gStyles.screenSubTitleElementName, { textAlign: isRTL() ? "right" : "left" },
                elementName.length == 0 && { color: colors.disabled }]}>
                    {elementName.length > 0 ? elementName : translate("ProfileNoName")}
                </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* {profileBusy && <ActivityIndicator color="#0000ff" size="large" />} */}
                {/* {profileName.length > 0 ?
                    <IconButton text={translate("Close")} onPress={closeProfile} /> :
                    <IconButton text={translate("Create")} onPress={() =>
                        setShowEditProfileName({ name: "", afterSave: () => setRevision(prev => prev + 1) })
                    } />
                } */}
                <IconButton text={actionName} onPress={() => onAction()} icon={actionIcon} />

            </View>
        </View>
    )
}

// export function Section({ title, component, iconName, marginHorizontal }: { title: string, component: any, iconName?: string, marginHorizontal: number }) {
//     return <View style={[gStyles.sectionHost, { direction: isRTL() ? "rtl" : "ltr", marginHorizontal }]}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//             {iconName && <MCIIcon name={iconName} color={colors.sectionIconColor} size={35} style={{ marginInlineEnd: 10 }} />}
//             <Text allowFontScaling={false} style={{ fontSize: 25 }}>{title}</Text>
//         </View>
//         {component}
//     </View>
// }



