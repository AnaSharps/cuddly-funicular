/* eslint-disable linebreak-style */
import React, { useContext } from 'react';
import { Text, View, Button, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import AuthContext from './AuthContext';
import { ScreenContainer } from 'react-native-screens';
import styles from './cssStylesheet';

export default class Logout extends React.Component {
  static contextType = AuthContext;

  render () {
    const { route, navigation } = this.props;
    const { signOut } = this.context;
    return (
      <ScreenContainer style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: 50, ...styles.searchBarCard }}>
            <Text style={{ fontSize: 20, fontWeight: '300', color: 'black', marginTop: 10 }}>Are you sure you want to logout?</Text>
            <View style={{ flex: 2, flexDirection: 'row', marginTop: 40 }}>
            <TouchableOpacity
              onPress={() => {
                SecureStore.deleteItemAsync('authToken');
                signOut({ error: null });
              }}
              styles={{ ...styles.button, flex: 1 }}
            >
              <LinearGradient
                colors={['#08d4c4', '#01ab9d']}
                style={{ height: 30, borderRadius: 5, width: 100, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text>Yes</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Home', { ...route.params });
              }}
              styles={{ ...styles.button, flex: 2 }}
            >
              <LinearGradient
                colors={['#08d4c4', '#01ab9d']}
                style={{ height: 30, borderRadius: 5, width: 100, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text>No</Text>
              </LinearGradient>
            </TouchableOpacity>
            </View>
          </View>
      </ScreenContainer>
    );
  }
}
