import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import * as Location from 'expo-location';
 
export default function App() {
  const [data, setData] = useState({ x: 0, y: 0, z:0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [location, setLocation] = useState(null as Location.LocationObject | null);
  const [quedas, setQuedas] = useState<AccelerometerMeasurement[]>([]);
  
  const checkForFall = async ({ x, y, z }: {x: number, y: number, z: number}) => {
    const limit = 1.5; // Define o limite para detecção de queda

    if (Math.abs(x) > limit || Math.abs(y) > limit || Math.abs(z) > limit) {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      alertFall(location);
    }
  };
 
  Accelerometer.addListener(AccelerometerData => {
    setData (AccelerometerData) ;
    checkForFall (AccelerometerData);
  });
 
  const alertFall = (location: Location.LocationObject) => {
    Alert.alert(
      "Queda Detectada",
      `Localização: ${location.coords.latitude}, ${location.coords.longitude}`,
      [{ text: "OK"}]
    );
  };
 
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg ('Permissão de localização negada');
        return;
      }
    }) ();
  }, []);
 
  useEffect (() => {
    const subscription = Accelerometer.addListener (AccelerometerData => {
      setData(AccelerometerData);
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}> Detector de Quedas </Text>

      <Text style={styles.text}>
        {location ? `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}` : 'Localização não disponível'}
      </Text>

      <Text style={styles.text}>
        Aceleração: X: {data.x.toFixed(2)}, Y: {data.y.toFixed(2)}, Z: {data.z.toFixed(2)}
      </Text>

      <Text style={styles.text}>
        {errorMsg ? errorMsg : 'Permissão concedida'};
      </Text>
    </View>
  ) ;
}
 
const styles = StyleSheet.create ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    margin: 10,
  },
});