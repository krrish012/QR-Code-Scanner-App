import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { openDatabase } from 'expo-sqlite';

const db = openDatabase('mydb.db');

const QrDetailsScreen = ({ route, navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [details, setDetails] = useState({});

  const { qrId } = route.params;

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (scanned && details.id) {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM qr_details WHERE id = ?',
          [details.id],
          (_, { rows: { _array } }) => {
            setDetails(_array[0]);
          },
          (error) => {
            console.log(error);
          }
        );
      });
    }
  }, [scanned, details.id]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    const parsedData = JSON.parse(data);
    if (parsedData.id) {
      setDetails(parsedData);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>QR Details</Text>
          <Text style={styles.label}>ID:</Text>
          <Text style={styles.value}>{details.id}</Text>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{details.name}</Text>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{details.location}</Text>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{details.description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default QrDetailsScreen;
