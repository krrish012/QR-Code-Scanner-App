import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import QrDetailsScreen from './QrDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const { status } = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        setHasPermission(status === 'granted');
      } else {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setQrData(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="QrDetails"
          component={QrDetailsScreen}
          options={{ title: 'QR Details' }}
          initialParams={{ qrData }}
        />
      </Stack.Navigator>
      {scanned && (
        <View style={styles.qr}>
          <Text style={styles.qrText}>QR Code: {qrData}</Text>
          <Button
            title={'Tap to Scan Again'}
            onPress={() => setScanned(false)}
          />
        </View>
      )}
      {!scanned && (
        <View style={styles.camera}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qr: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
  },
  qrText: {
    fontSize: 18,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
