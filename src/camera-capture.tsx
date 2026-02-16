import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import { translate } from './lang';
import { MyIcon } from './common/icons';
import { TouchableOpacity } from 'react-native';
import { ensureAndroidCompatible } from './utils';
import { IconButton } from './common/components';
import { colors } from './common/common-style';
import { Svg, Ellipse } from 'react-native-svg';

interface CameraCaptureProps {
    onCapture: (imagePath: string) => void;
    onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const [captureInProgress, setCaptureInProgress] = useState(false);
    const [permission, setPermission] = useState(false);
    const [cameraType, setCameraType] = useState<CameraType>(CameraType.Back);
    const [hasFrontCamera, setHasFrontCamera] = useState(false);
    const camera = useRef<any>(null);

    useEffect(() => {
        console.log('Requesting camera permission');
        request(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
            .then((result) => {
                if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
                    setPermission(true);
                    // Assume front camera is available on devices with camera permission
                    // Most modern devices have both front and back cameras
                    setHasFrontCamera(true);
                }
                console.log('Camera permission:', result);
            })
            .catch((e) => console.log('Camera permission error', e));
    }, []);

    const takePicture = async () => {
        if (captureInProgress) return;

        try {
            setCaptureInProgress(true);
            
            if (!camera.current) {
                Alert.alert(translate('Error'), 'Camera not available');
                return;
            }

            const image = await camera.current.capture();
            console.log('Picture taken:', image.uri);

            // Copy the image to the app's document folder
            const fileName = `camera_${Date.now()}.jpg`;
            const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            await RNFS.copyFile(
                ensureAndroidCompatible(image.uri),
                ensureAndroidCompatible(destinationPath)
            );

            onCapture(fileName);
        } catch (error) {
            console.error('Error taking picture:', error);
            Alert.alert(translate('Error'), 'Failed to capture image');
        } finally {
            setCaptureInProgress(false);
        }
    };

    const toggleCamera = () => {
        setCameraType(prevType => 
            prevType === CameraType.Back ? CameraType.Front : CameraType.Back
        );
    };

    const cancel = () => {
        onClose();
    };

    return (
        <View style={styles.container}>
            {permission && (
                <Camera
                    ref={camera}
                    style={styles.camera}
                    cameraType={cameraType}
                    showFrame={false}
                    scanBarcode={false}
                    zoomMode="on"
                    zoom={1.0}
                    maxZoom={3.0}
                    resizeMode="contain"
                />
            )}

            {!permission && (
                <Text style={styles.permissionText}>
                    {translate('MissingCameraPermission')}
                </Text>
            )}

            <View style={styles.topButtonContainer}>
                <IconButton
                    text={translate('Cancel')}
                    onPress={cancel}
                    backgroundColor={colors.titleButtonsBG}
                    icon={{ name: 'close' }}
                />
                
            </View>

            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    onPress={takePicture}
                    disabled={captureInProgress}
                    style={styles.captureButton}
                >
                    <Svg width={80} height={80} viewBox="-0.5 -0.5 108 108">
                        <Ellipse cx="53.5" cy="53.5" rx="53.5" ry="53.5" fill="#ffffff" stroke="#000000" />
                        <Ellipse cx="54" cy="54" rx="40" ry="40" fill="#ffffff" stroke="#000000" strokeWidth="4" />
                    </Svg>

                    
                </TouchableOpacity>
                {hasFrontCamera && (
                    <View style={{position:"absolute", right:50, top:15}}>
                        <IconButton
                            text=""
                            onPress={toggleCamera}
                            icon={{ name: 'camera-flip-outline', type: 'MDI', size:40, color:"white" }}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    permissionText: {
        textAlign: 'center',
        position: 'absolute',
        width: '100%',
        top: 100,
        color: 'white',
        fontSize: 18,
    },
    topButtonContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        zIndex: 1000,
    },
    captureButton: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
