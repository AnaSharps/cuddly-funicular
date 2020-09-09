/* eslint-disable linebreak-style */
import React, { useContext } from 'react';
import { Text, View, Button, Alert } from 'react-native';

import * as SecureStore from 'expo-secure-store';
import AuthContext from './AuthContext';
import { ScreenContainer } from 'react-native-screens';

export default class Logout extends React.Component {
  static contextType = AuthContext;

  render () {
    const { route, navigation } = this.props;
    const { signOut } = this.context;
    return (
      <ScreenContainer>
          <View>
            <Text>Are you sure you want to logout?</Text>
            <Button title="Yes" onPress={() => {
              SecureStore.deleteItemAsync('authToken');
              signOut({ error: null });
            }}/>
            <Button title="No" onPress={() => {
              navigation.navigate('Home', { ...route.params });
            }} />
          </View>
      </ScreenContainer>
    );
  }
}
