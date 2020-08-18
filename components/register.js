/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { TextInput, Button, Text } from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import RadioForm from 'react-native-simple-radio-button';

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      mobile: '',
      userType: 'labour',
      email: '',
    };
    this.radioProps = [
      { label: 'Labour', value: 0 },
      { label: 'Employer', value: 1 },
      { label: 'Admin', value: 2 },
    ];
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { error } = route.params;
    const {
      username, password, mobile, userType, email,
    } = { ...this.state };
    return (
      <ScreenContainer>
        {error && (
        <Text>{error}</Text>
        )}
        <RadioForm
          radio_props={this.radioProps}
          initial={0}
          animation
          onPress={(value) => {
            if (value === 0) this.setState({ userType: 'labour' });
            else if (value === 1) this.setState({ userType: 'employer' });
            else if (value === 2) this.setState({ userType: 'admin' });
          }}
        />
        <TextInput placeholder="Enter Email" keyboardType="email-address" defaultValue={username} onChangeText={(e) => this.setState({ email: e })} />
        <TextInput placeholder="Enter your Name" defaultValue={email} onChangeText={(e) => this.setState({ username: e })} />
        <TextInput placeholder="Enter your mobile number" keyboardType="phone-pad" maxLength={10} defaultValue={mobile} onChangeText={(e) => this.setState({ mobile: e })} />
        <TextInput placeholder="Password" secureTextEntry defaultValue={password} onChangeText={(e) => this.setState({ password: e })} />
        <Button
          title="Submit"
          onPress={() => {
            fetch('https://90b07c9dffef.ngrok.io/users/register', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username,
                email,
                mobile,
                password,
                userType,
                details: 0,
              }),
            }).then((res) => res.json()).then((json) => {
              if (json.success) {
                const authToken = JSON.stringify(json);
                SecureStore.setItemAsync('authToken', authToken);
                navigation.navigate('LoggedIn', {
                  user: json.user,
                  userType: json.userType,
                  details: json.details,
                  token: json.token,
                  createVacancy: null,
                });
              } else if (json.msg === 'User already Exists!') {
                navigation.navigate('WelcomeLogin', { error: `Login as ${json.user}!` });
              } else navigation.navigate('Register', { error: json.msg });
            });
          }}
        />
      </ScreenContainer>
    );
  }
}
