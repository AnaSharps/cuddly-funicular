/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, TextInput, Button,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';

export default class WelcomeLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,
    };
  }

  loginHandler() {
    const { navigation } = { ...this.props };
    const { email, password } = { ...this.state };
    fetch('https://976e3fc59bb0.ngrok.io/users/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const authToken = JSON.stringify(json);
        SecureStore.setItemAsync('authToken', authToken);
        switch (json.userType) {
          case 'labour':
            navigation.navigate('LabourLoggedIn', {
              user: json.user,
              userType: 'labour',
              details: json.details,
              token: json.token,
              error: null,
            });
            break;
          case 'employer':
            navigation.navigate('EmployerLoggedIn', {
              user: json.user,
              userType: 'employer',
              token: json.token,
              createVacancy: false,
              error: null,
            });
            break;
          default:
            //
        }
      } else {
        navigation.push('WelcomeLogin', {
          error: json.msg,
        });
      }
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { error } = route.params;
    return (
      <ScreenContainer>
        {error && (
        <Text>{error}</Text>
        )}
        <TextInput placeholder="Email-Id" keyboardType="email-address" onChangeText={(e) => this.setState({ email: e })} />
        <TextInput placeholder="Password" secureTextEntry onChangeText={(e) => this.setState({ password: e })} />
        <Button
          title="Submit"
          onPress={() => {
            this.loginHandler();
          }}
        />
        <Button title="Register" onPress={() => navigation.navigate('Register', { error: null })} />
      </ScreenContainer>
    );
  }
}
