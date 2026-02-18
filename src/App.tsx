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
import Toast, {
  BaseToast,
  ErrorToast,
  SuccessToast,
} from 'react-native-toast-message';
import { Settings } from './setting-storage';
import { getImagePath, readCurrentProfile } from './profile';
import {
  BACKGROUND,
  BUTTONS,
  CURRENT_PROFILE,
  ONE_AFTER_THE_OTHER,
  SettingsPage,
} from './settings';
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
      style={{ borderLeftColor: '#69C779', width: '80%', zIndex: 9999 }}
      text1Style={{ textAlign: 'center', fontSize: 16 }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FE6301', width: '80%' }}
      text1Style={{ textAlign: 'center', fontSize: 16, zIndex: 9999 }}
    />
  ),
};

export const audioRecorderPlayer = createSound();

// Track which recording is currently playing to prevent state corruption
export let currentlyPlayingRecName: string | null = null;

export function setCurrentlyPlaying(recName: string | null) {
  currentlyPlayingRecName = recName;
}

type LayoutCandidate = {
  rows: number;
  cols: number;
  isVertical: boolean;
};

function getLayoutCandidates(n: number): LayoutCandidate[] {
  switch (n) {
    case 1:
      return [{ rows: 1, cols: 1, isVertical: false }];
    case 2:
      return [
        { rows: 1, cols: 2, isVertical: false }, // horizontal
        { rows: 2, cols: 1, isVertical: true },  // vertical
      ];
    case 3:
      return [
        { rows: 1, cols: 3, isVertical: false }, // horizontal
        { rows: 3, cols: 1, isVertical: true },  // vertical
      ];
    case 4:
      return [
        { rows: 1, cols: 4, isVertical: false }, // horizontal
        { rows: 4, cols: 1, isVertical: true },  // vertical
        { rows: 2, cols: 2, isVertical: false }, // grid
      ];
    default:
      return [{ rows: 1, cols: 1, isVertical: false }];
  }
}

function calculateOptimalLayout(
  w: number,
  h: number,
  n: number,
  margin: number = 0,
): { buttonWidth: number; isVertical: boolean } {
  // Safety check for invalid dimensions
  if (w <= 0 || h <= 0 || n <= 0) {
    return { buttonWidth: 0, isVertical: false };
  }

  const layouts = getLayoutCandidates(n);

  let bestLayout = layouts[0];
  let maxButtonSize = 0;

  // console.log('calculateOptimalLayout: evaluating layouts for n=' + n, { w, h });
  for (const layout of layouts) {
    // MainButton renders at width * 1.3, so account for that
    // For grid layouts (2x2), we need to prevent 3 buttons from fitting
    // Calculate spacing dynamically: ensure 2.5 buttons worth of space doesn't fit 3 rendered buttons
    const isGrid = layout.rows > 1 && layout.cols > 1;
    let colSpacing, rowSpacing;

    let buttonSize;

    // Account for margins on all sides of buttons:
    // Each button takes: (buttonSize * 1.3) + 2*margin
    // Total width = cols * ((buttonSize * 1.3) + 2*margin)
    // Solving for buttonSize:
    // w = cols * (buttonSize * 1.3 + 2*margin)
    // buttonSize = (w - cols * 2*margin) / (cols * 1.3)

    const wForButtons = w - (layout.cols * 2 * margin);
    const hForButtons = h - (layout.rows * 2 * margin);

    if (isGrid) {
      // For 2x2 grid: use tighter spacing when height-constrained (landscape)
      // to prevent 3 buttons from fitting horizontally
      const widthPerCol = wForButtons / layout.cols;
      const heightPerRow = hForButtons / layout.rows;

      if (heightPerRow < widthPerCol) {
        // Height-constrained (landscape): balance between preventing 3-in-a-row and fitting vertically
        buttonSize = Math.min(
          wForButtons / (layout.cols * 1.30),
          hForButtons / (layout.rows * 1.33) // More row spacing for extra bottom margin
        );
      } else {
        // Width-constrained (portrait): use more row spacing for bottom margin
        buttonSize = Math.min(
          wForButtons / (layout.cols * 1.30),
          hForButtons / (layout.rows * 1.45) // Extra row spacing for portrait grid bottom margin
        );
      }
    } else {
      // Linear layouts: use more spacing for vertical layouts with multiple buttons
      const isVerticalLine = layout.rows > 1 && layout.cols === 1;
      const rowSpacing = isVerticalLine ? 1.40 : 1.35; // More vertical spacing
      buttonSize = Math.min(
        wForButtons / (layout.cols * 1.35),
        hForButtons / (layout.rows * rowSpacing)
      );
    }

    // console.log('  layout:', layout, 'buttonSize:', buttonSize, 'will render at:', buttonSize * 1.3, 'would 3 fit?', (buttonSize * 1.3) * 3 <= w, 'isGrid:', isGrid);

    if (buttonSize > maxButtonSize) {
      maxButtonSize = buttonSize;
      bestLayout = layout;
    }
  }

  // console.log('  WINNER:', bestLayout, 'maxButtonSize:', maxButtonSize, 'will render at:', maxButtonSize * 1.3);

  // No longer need to divide by 1.3 since we already accounted for it above
  const finalButtonWidth = maxButtonSize;

  return {
    buttonWidth: finalButtonWidth,
    isVertical: bestLayout.isVertical,
  };
}

function Main(): React.JSX.Element {
  // const [windowSize, setWindowSize] = useState(Dimensions.get("window"));

  const [log, setLog] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [nextButton, setNextButton] = useState(0);
  const [importInfo, setImportInfo] = useState<ImportInfo | undefined>(
    undefined,
  );
  const [importInProgress, setImportInProgress] = useState<
    | {
      message: string;
      precent: number;
    }
    | undefined
  >();

  const windowSize = useSafeAreaFrame();

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
    let url = event.url;
    url = decodeURI(url);

    if (Platform.OS === 'android' && url.startsWith('content://')) {
      console.log('translate content://', url);
      url = await FileCopyModule.copyContentUriToTemp(url);
    }

    console.log('handleImport event:', url, JSON.stringify(event));

    setImportInProgress({
      message: translate('ImportInProgress'),
      precent: 0,
    });

    let result: ImportInfo = {
      importedProfiles: [],
      skippedExistingProfiles: [],
    };

    importPackage(url, result)
      .then(() => setImportInfo(result))
      .catch(err => Alert.alert(translate('ImportError'), err?.message || err))
      .finally(() => setImportInProgress(undefined));
  }

  useIncomingURL(url => handleImport({ url }));

  const mainBackgroundColor = Settings.getString(
    BACKGROUND.name,
    BACKGROUND.LIGHT,
  );
  const oneAfterTheOther = Settings.getBoolean(ONE_AFTER_THE_OTHER.name, false);
  const currentProfileName = Settings.getString(CURRENT_PROFILE.name, '');
  const prevProfileRef = useRef<string>(currentProfileName);

  if (
    (!oneAfterTheOther && nextButton > 0) ||
    currentProfileName != prevProfileRef.current
  ) {
    // reset
    setNextButton(0);
  }

  prevProfileRef.current = currentProfileName;

  const safeAreaInsets = useSafeAreaInsets();

  const backgroundStyle = {
    direction: 'ltr',
    width: '100%',
    height: '100%',
    // margin: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: mainBackgroundColor,
  };

  if (showAbout) {
    return <About onClose={() => setShowAbout(false)} />;
  }

  if (showSettings) {
    return (
      <>
        {/* @ts-ignore*/}
        <View style={backgroundStyle}>
          <SettingsPage
            windowSize={windowSize}
            onAbout={() => {
              console.log('On About');
              setShowAbout(true);

              setShowSettings(false);
            }}
            onClose={() => setShowSettings(false)}
          />
        </View>
        <Toast position="bottom" bottomOffset={30} config={toastConfig} />
      </>
    );
  }

  const p = readCurrentProfile();

  const activeButtons = oneAfterTheOther
    ? [nextButton]
    : Array.from(Array(p.buttons.length).keys());

  const isLandscape = isLandscapeUtil(windowSize);
  const h = windowSize.height - safeAreaInsets.top - safeAreaInsets.bottom;
  const w = windowSize.width - safeAreaInsets.left - safeAreaInsets.right;
  const n = activeButtons.length;

  {/** all layout options

    hLine
    X X

    X X X

    X X X X
    ----


    X X
    X X

    // vLine
    X

    X
    X

    X
    X
    X

    X
    X
    X
    X

    */}

  // Add margins between buttons for spacing
  const buttonMargin = 12; // 12px margin around each button
  const containerPadding = 30; // Padding on container edges (more at edges)

  // Subtract container padding from available space
  const wAvailable = w - (2 * containerPadding);
  const hAvailable = h - (2 * containerPadding);

  const { buttonWidth, isVertical } = calculateOptimalLayout(wAvailable, hAvailable, n, buttonMargin);
  let hMargin = buttonMargin;

  // console.log("LAYOUT DEBUG:", { w, h, n, buttonWidth, isVertical, isLandscape })

  const handlePlayComplete = () => {
    console.log('handlePlayComplete');
    setNextButton(prev => {
      const buttonNum = Settings.getNumber(BUTTONS.name, 1);
      if (prev + 1 >= buttonNum) {
        return 0;
      }
      return prev + 1;
    });
  };

  const visButtons = activeButtons.map((i: any) => (
    <MainButton
      key={i}
      name={p.buttons[i].name}
      fontSize={27}
      showName={p.buttons[i].showName}
      width={buttonWidth}
      raisedLevel={10}
      color={
        p.buttons[i].color == '#000000' &&
          mainBackgroundColor == BACKGROUND.DARK
          ? 'white'
          : p.buttons[i].color
      }
      imageUrl={getImagePath(p.buttons[i].imageUrl)}
      appBackground={mainBackgroundColor}
      showProgress={true}
      recName={i + ''}
      onPlayComplete={oneAfterTheOther ? handlePlayComplete : undefined}
      imageOffset={p.buttons[i].offset}
      scale={p.buttons[i].scale}
      hMargin={hMargin}
    />
  ));

  // For 2x2 grid layout, explicitly group into rows to avoid flexWrap issues
  const isGrid = n === 4 && !isVertical;
  const isRtl = isRTL();

  const buttonContent = isGrid ? (
    <>
      <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
        {visButtons[0]}
        {visButtons[1]}
      </View>
      <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
        {visButtons[2]}
        {visButtons[3]}
      </View>
    </>
  ) : visButtons;

  // @ts-ignore
  return (
    <View style={{ flex: 1, backgroundColor: mainBackgroundColor }}>
      <View style={[backgroundStyle, { marginTop: safeAreaInsets.top, marginBottom: safeAreaInsets.bottom }]}>
        <CountdownButton
        iconSize={45}
        onComplete={() => setShowSettings(true)}
        style={{
          top: isLandscapeUtil(windowSize)
            ? Math.max(25, 20 + safeAreaInsets.top)
            : 25, // No safe area top in portrait to avoid camera hole
          right: Math.max(20, 15 + safeAreaInsets.right),
        }}
        countdownStyle={{
          backgroundColor:
            mainBackgroundColor == BACKGROUND.LIGHT ? 'gray' : 'white',
        }}
        icon="settings-outline"
        iconType="Ionicons"
        textKey="OpenIn"
        textLocation="left"
        iconColor={mainBackgroundColor == BACKGROUND.LIGHT ? 'black' : 'white'}
      />

      {/** Progress */}
      {importInProgress && (
        <View style={gStyles.progressBarHost}>
          <Text
            allowFontScaling={false}
            style={{ fontSize: 28, marginBottom: 5 }}
          >
            {importInProgress.message}
          </Text>
          <Progress.Bar
            width={windowSize.width * 0.6}
            progress={importInProgress.precent / 100}
            style={[isRTL() && { transform: [{ scaleX: -1 }] }]}
          />
        </View>
      )}

      {
        // Import info
        importInfo && (
          <ImportInfoDialog
            importInfo={importInfo}
            onClose={() => setImportInfo(undefined)}
          />
        )
      }

      <View style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        flexDirection: isGrid ? "column" : (isVertical ? "column" : (isRtl ? "row-reverse" : "row")),
        flexWrap: isGrid ? "nowrap" : (isVertical ? "nowrap" : "wrap"),
        padding: containerPadding, // Add padding to container for edge spacing
        backgroundColor: mainBackgroundColor, // Match main background
      }}
      >
        {buttonContent}
      </View>

      {oneAfterTheOther && (
        <CountdownButton
          iconSize={50}
          onComplete={() => setNextButton(0)}
          style={{
            bottom: Math.max(10, 10 + safeAreaInsets.bottom),
            right: isLandscape ? 50 : windowSize.width / 2 - 25,
          }}
          countdownStyle={{
            backgroundColor:
              mainBackgroundColor == BACKGROUND.LIGHT ? 'gray' : 'white',
          }}
          icon="restart"
          iconType="MDI"
          textKey="ResetButtons"
          textLocation="left"
          iconColor={
            mainBackgroundColor == BACKGROUND.LIGHT ? 'black' : 'white'
          }
        />
      )}
      </View>
    </View>
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

    console.log('Splash delay remaining:', remaining);

    setTimeout(() => {
      console.log('Splash Closed');
      SplashScreen.hide();
    }, remaining);
  }, []);

  // Get background color from settings at app level
  const appBackground = Settings.getString(BACKGROUND.name, BACKGROUND.LIGHT);

  return (
    <GlobalContext.Provider
      value={{
        url: props.url,
      }}
    >
      <View style={{ flex: 1, backgroundColor: appBackground }}>
        <SafeAreaProvider>
          {__DEV__ ? (
            <ScreenSizer.Wrapper
              devices={[
                ...ScreenSizer.defaultDevices.all,
                {
                  name: 'android A9',
                  width: 700,
                  height: 1040,
                  insets: { top: 10 },
                },

                'hostDevice',
              ]}
            >
              <Main />
            </ScreenSizer.Wrapper>
          ) : (
            <Main />
          )}
        </SafeAreaProvider>
      </View>
    </GlobalContext.Provider>
  );
}
