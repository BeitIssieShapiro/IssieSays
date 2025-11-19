import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaProvider,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';


import SplashScreen from 'react-native-splash-screen';
import * as Progress from 'react-native-progress';

import { createSound } from 'react-native-nitro-sound';
import { MainButton, RectView } from './uielements';
import { About } from './about';
import Toast, { BaseToast, ErrorToast, SuccessToast } from 'react-native-toast-message';
import { Settings } from './setting-storage';
import { getImagePath, readCurrentProfile } from './profile';
import { BACKGROUND, BUTTONS, CURRENT_PROFILE, ONE_AFTER_THE_OTHER, SettingsPage } from './settings';
import { Alert, NativeModules, Platform, View } from 'react-native';
import { CountdownButton } from './common/countdown-btn';
import { useIncomingURL } from './common/linking-hook';
import { GlobalContext } from './common/global-context';
import { isRTL, translate } from './lang';
import { ImportInfo, importPackage } from './import-export';
import { Text } from '@rneui/themed';
import { ImportInfoDialog } from './common/import-info-dialog';
import { gStyles } from './common/common-style';
import { getIsMobile, isLandscape as isLandscapeUtil } from './utils';
const { FileCopyModule } = NativeModules;

const toastConfig = {

  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#69C779', width: "80%", zIndex: 9999 }}
      text1Style={{ textAlign: "center", fontSize: 16 }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FE6301', width: "80%" }}
      text1Style={{ textAlign: "center", fontSize: 16, zIndex: 9999 }}
    />
  )
};


export const audioRecorderPlayer = createSound();

function Main(): React.JSX.Element {
  // const [windowSize, setWindowSize] = useState(Dimensions.get("window"));

  const [log, setLog] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [nextButton, setNextButton] = useState(0);
  const [importInfo, setImportInfo] = useState<ImportInfo | undefined>(undefined);
  const [importInProgress, setImportInProgress] = useState<{
    message: string;
    precent: number;
  } | undefined>();


  const windowSize = useSafeAreaFrame()

  // useEffect(() => {
  //   const subscription = Dimensions.addEventListener('change', ({ window }: any) => setWindowSize(window));
  //   return () => {
  //     // Cleanup 
  //     subscription?.remove()
  //   }
  // }, [])


  async function handleImport(event: any) {
    setShowSettings(false);
    setShowAbout(false);
    let url = event.url
    url = decodeURI(url);

    if (Platform.OS === "android" && url.startsWith("content://")) {
      console.log("translate content://", url);
      url = await FileCopyModule.copyContentUriToTemp(url);
    }

    console.log("handleImport event:", url, JSON.stringify(event));

    setImportInProgress({
      message: translate("ImportInProgress"),
      precent: 0,
    })

    let result: ImportInfo = {
      importedProfiles: [],
      skippedExistingProfiles: []
    };

    importPackage(url, result)
      .then(() => setImportInfo(result))
      .catch(err => Alert.alert(translate("ImportError"), err?.message || err))
      .finally(() => setImportInProgress(undefined))
  }

  useIncomingURL((url) => handleImport({ url }));



  const mainBackgroundColor = Settings.getString(BACKGROUND.name, BACKGROUND.LIGHT);
  const oneAfterTheOther = Settings.getBoolean(ONE_AFTER_THE_OTHER.name, false);
  const currentProfileName = Settings.getString(CURRENT_PROFILE.name, "");
  const prevProfileRef = useRef<string>(currentProfileName);

  if (!oneAfterTheOther && nextButton > 0 || currentProfileName != prevProfileRef.current) {
    // reset
    setNextButton(0);
  }

  prevProfileRef.current = currentProfileName;

  const safeAreaInsets = useSafeAreaInsets();

  // Use utility function to detect mobile vs tablet/iPad
  const isMobile = getIsMobile(windowSize);
  const isIPad = () => !isMobile;

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
      {/* @ts-ignore*/}
      <View style={backgroundStyle} >
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
      <Toast position='bottom' bottomOffset={30} config={toastConfig} />

    </>
  }

  const p = readCurrentProfile();

  const activeButtons = oneAfterTheOther ?
    [nextButton] :
    Array.from(Array(p.buttons.length).keys());


  const isLandscape = isLandscapeUtil(windowSize)
  const h = windowSize.height //- safeAreaInsets.top - safeAreaInsets.bottom;
  const w = windowSize.width //- safeAreaInsets.left - safeAreaInsets.right;
  const n = activeButtons.length;

  let buttonWidth = 0;
  let hMargin = 0;

  if (isLandscape) {
    if (isMobile) {
      buttonWidth = Math.min(w / activeButtons.length, h * (n == 1 ? .6 : (n > 3 ? 1.3 : 1.1)) / n)
      hMargin = windowSize.width < 830 ? 0 : 10;
    } else {
      buttonWidth = (n == 4 ? Math.min(w / 4, h * .6 / 2) : h / (n + 1))
      hMargin = windowSize.width < 1200 ? 50 : 70;
    }
  } else {
    if (isMobile) {
      buttonWidth = Math.min(n == 4 ? w / 2 : w * .5, h * .6 / n)
      hMargin = 10;

    } else {
      buttonWidth = (n == 4 ? w / 3.5 : w / (n + 1))
      hMargin = n == 4 ? 20 : 90;

    }

  }

  //console.log("rendering stats", w, h, "land", isLandscape, "mobile", isMobile, buttonWidth, hMargin)

  const handlePlayComplete = () => {
    console.log("handlePlayComplete")
    setNextButton((prev) => {
      const buttonNum = Settings.getNumber(BUTTONS.name, 1);
      if (prev + 1 >= buttonNum) {
        return 0;
      }
      return prev + 1;
    })
  }


  // @ts-ignore
  return (<View style={[backgroundStyle, { marginTop: safeAreaInsets.top }]} >
    <CountdownButton iconSize={45} onComplete={() => setShowSettings(true)} style={{
      top: isLandscapeUtil(windowSize) ? Math.max(25, 20 + safeAreaInsets.top) : 25, // No safe area top in portrait to avoid camera hole
      right: Math.max(20, 15 + safeAreaInsets.right),

    }}
      countdownStyle={{ backgroundColor: mainBackgroundColor == BACKGROUND.LIGHT ? "gray" : "white" }}
      icon="settings-outline"
      iconType="Ionicons"
      textKey="OpenIn"
      textLocation="left"
      iconColor={mainBackgroundColor == BACKGROUND.LIGHT ? "black" : "white"}

    />

    {/** Progress */}
    {importInProgress && <View style={gStyles.progressBarHost}>
      <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 5 }}>{importInProgress.message}</Text>
      <Progress.Bar width={windowSize.width * .6} progress={importInProgress.precent / 100} style={[isRTL() && { transform: [{ scaleX: -1 }] }]} />
    </View>}

    {
      // Import info
      importInfo && <ImportInfoDialog importInfo={importInfo} onClose={() => setImportInfo(undefined)} />
    }

    <RectView buttonWidth={buttonWidth} width={windowSize.width - safeAreaInsets.left - safeAreaInsets.right} height={windowSize.height - safeAreaInsets.top - safeAreaInsets.bottom} isLandscape={isLandscapeUtil(windowSize)}>

      {activeButtons.map((i: any) => (
        <MainButton
          key={i}
          name={p.buttons[i].name}
          fontSize={27}
          showName={p.buttons[i].showName}
          width={buttonWidth}
          raisedLevel={10}
          color={p.buttons[i].color == "#000000" && mainBackgroundColor == BACKGROUND.DARK ? "white" : p.buttons[i].color}
          imageUrl={getImagePath(p.buttons[i].imageUrl)}
          appBackground={mainBackgroundColor}
          showProgress={true}
          recName={i + ""}
          onPlayComplete={oneAfterTheOther ? handlePlayComplete : undefined}
          imageOffset={p.buttons[i].offset}
          scale={p.buttons[i].scale}
          hMargin={hMargin}
        />
      ))
      }

    </RectView>

    {oneAfterTheOther &&
      <CountdownButton iconSize={50} onComplete={() => setNextButton(0)}
        style={{ bottom: Math.max(10, 10 + safeAreaInsets.bottom), right: isLandscape ? 50 : windowSize.width / 2 - 25 }}
        countdownStyle={{ backgroundColor: mainBackgroundColor == BACKGROUND.LIGHT ? "gray" : "white" }}
        icon="restart"
        iconType="MDI"
        textKey="ResetButtons"
        textLocation="left"
        iconColor={mainBackgroundColor == BACKGROUND.LIGHT ? "black" : "white"}
      />
    }

    {/* <ScrollView style={{ maxHeight: 200, width: "100%" }}>
        <Text style={{ margin: 20, width: "100%" }}>Log:{"\n" + log}</Text>
      </ScrollView>
      <Button onPress={() => setLog("")} title="Clear" /> */}
  </View >
  );
}


import * as ScreenSizer from '@bam.tech/react-native-screen-sizer';
ScreenSizer.setup();

export default function App(props: any) {

  useEffect(() => {
    const now = Date.now();
    const nativeStartTime = props.nativeStartTime ?? now;
    const elapsed = now - nativeStartTime;
    const minDuration = 2000;
    const remaining = Math.max(0, minDuration - elapsed);

    console.log("Splash delay remaining:", remaining);

    setTimeout(() => {
      console.log("Splash Closed");
      SplashScreen.hide();
    }, remaining);
  }, []);

  return <GlobalContext.Provider value={{
    url: props.url
  }}>
    <SafeAreaProvider>
      {
        __DEV__ ?
          <ScreenSizer.Wrapper
            devices={[...ScreenSizer.defaultDevices.all,
            {
              name: 'android A9',
              width: 700,
              height: 1040,
              insets: { top: 10 },
            },

              'hostDevice']}
          >
            <Main />
          </ScreenSizer.Wrapper>
          : <Main />
      }
    </SafeAreaProvider>
  </GlobalContext.Provider>
}
