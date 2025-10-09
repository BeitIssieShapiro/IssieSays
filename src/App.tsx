import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import SplashScreen from 'react-native-splash-screen';
import * as Progress from 'react-native-progress';

import { createSound } from 'react-native-nitro-sound';
import { MainButton, RectView } from './uielements';
import { About } from './about';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Settings } from './setting-storage';
import { readCurrentProfile } from './profile';
import { BACKGROUND, BUTTONS, CURRENT_PROFILE, ONE_AFTER_THE_OTHER, SettingsPage } from './settings';
import { Alert, Platform, View } from 'react-native';
import { CountdownButton } from './common/countdown-btn';
import { useIncomingURL } from './common/linking-hook';
import { GlobalContext } from './common/global-context';
import { isRTL, translate } from './lang';
import { ImportInfo, importPackage } from './import-export';
import { Text } from '@rneui/themed';
import { ImportInfoDialog } from './common/import-info-dialog';
import { gStyles } from './common/common-style';

const toastConfig = {

  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ width: "80%" }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ width: "80%" }}
    />
  )
};


export const audioRecorderPlayer = createSound();

function Main(): React.JSX.Element {
  const [windowSize, setWindowSize] = useState({ width: 500, height: 500 });

  const [log, setLog] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [nextButton, setNextButton] = useState(0);
  const [importInfo, setImportInfo] = useState<ImportInfo | undefined>(undefined);
  const [importInProgress, setImportInProgress] = useState<{
    message: string;
    precent: number;
  } | undefined>();

  const isLandscape = () => windowSize.height < windowSize.width;


  async function handleImport(event: any) {
    setShowSettings(false);
    setShowAbout(false);
    let url = event.url
    url = decodeURI(url);

    if (Platform.OS === "android" && url.startsWith("content://")) {
      console.log("translate content://", url);
      // url = await FileCopyModule.copyContentUriToTemp(url);
      // todo android
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
      <SafeAreaProvider>
        {/* @ts-ignore*/}
        <View style={backgroundStyle} onLayout={(e) => {
          let wz = e.nativeEvent.layout;
          setWindowSize(wz);
        }}>
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
      </SafeAreaProvider>

      <Toast position='bottom' bottomOffset={30} config={toastConfig} />
    </>
  }

  const p = readCurrentProfile();

  const activeButtons = oneAfterTheOther ?
    [nextButton] :
    Array.from(Array(p.buttons.length).keys());


  const buttonsInCol = activeButtons.length < 2 ? 1 : 2

  let bottonWidth = (isLandscape() ? windowSize.height : windowSize.width) * (buttonsInCol > 1 ?
    (activeButtons.length > 2 ? .32 : .4) : .6);

  if (windowSize.height < 450) {
    bottonWidth *= .8;
  }

  console.log("w/h", windowSize)


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
  return (<View style={backgroundStyle} onLayout={(e) => {
    let wz = e.nativeEvent.layout;
    setWindowSize(wz);
  }}  >
    <CountdownButton iconSize={45} onComplete={() => setShowSettings(true)} style={{
      top: Math.max(25, 20 + safeAreaInsets.top),
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

    <RectView buttonWidth={bottonWidth} width={windowSize.width} height={windowSize.height} isLandscape={isLandscape()}>

      {activeButtons.map((i: any) => (
        <MainButton
          key={i}
          name={p.buttons[i].name}
          fontSize={27}
          showName={p.buttons[i].showName}
          width={bottonWidth}
          raisedLevel={10}
          color={p.buttons[i].color == "#000000" && mainBackgroundColor == BACKGROUND.DARK ? "white" : p.buttons[i].color}
          imageUrl={p.buttons[i].imageUrl}
          appBackground={mainBackgroundColor}
          showProgress={true}
          recName={i + ""}
          onPlayComplete={oneAfterTheOther ? handlePlayComplete : undefined}
        />
      ))
      }

    </RectView>

    {oneAfterTheOther &&
      <CountdownButton iconSize={50} onComplete={() => setNextButton(0)}
        style={{ bottom: 10 + safeAreaInsets.bottom, right: windowSize.width / 2 - 25 }}
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
      <Main />
    </SafeAreaProvider>
  </GlobalContext.Provider>
}
