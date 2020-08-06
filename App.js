/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { Component } from 'react';
import {
  Text, View, TextInput, Button,
} from 'react-native';
import RadioForm from 'react-native-simple-radio-button';
import * as SecureStore from 'expo-secure-store';

class AppForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientLoggedIn: false,
      loginFormDisplay: false,
      registrationFormDisplay: false,
      clientType: null,
      user: null,
      error: null,
      token: null,
      userMsg: null,
    };
    this.radioProps = [
      { label: 'Labour', value: 0 },
      { label: 'Employer', value: 1 },
      { label: 'Admin', value: 2 },
    ];
    this.selectedValue = null;
    this.usernameInput = null;
    this.passwordInput = null;
  }

  componentDidMount() {
    const authToken = SecureStore.getItemAsync('authToken');
    if (authToken) {
      authToken.then((res) => {
        const resObject = JSON.parse(res);
        if (resObject) {
          this.setState({ clientLoggedIn: true, user: resObject.user, token: resObject.token });
        }
      });
    }
  }

  loginHandler() {
    fetch('https://22eb43d98752.ngrok.io/users/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.usernameInput,
        password: this.passwordInput,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const authToken = JSON.stringify(json);
        SecureStore.setItemAsync('authToken', authToken);
        this.setState({
          user: json.user, token: json.token, clientLoggedIn: true, loginFormDisplay: false,
        });
      } else {
        this.setState({ error: json.msg });
      }
    });
  }

  registrationHandler() {
    fetch('https://22eb43d98752.ngrok.io/users/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.usernameInput,
        password: this.passwordInput,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const authToken = JSON.stringify(json);
        SecureStore.setItemAsync('authToken', authToken);
        this.setState({
          user: json.user, clientType: this.selectedValue, token: json.token, clientLoggedIn: true, registrationFormDisplay: false,
        });
      } else {
        this.setState({ error: json.msg });
      }
    });
  }

  applicationHandler() {
    const { token } = { ...this.state };
    fetch('https://22eb43d98752.ngrok.io/users/protected', {
      method: 'GET',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        this.setState({ userMsg: json.msg });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      this.setState({
        error: 'Unauthorized', clientLoggedIn: false, loginFormDisplay: false, registrationFormDisplay: false, user: null, token: null
      });
    });
  }

  logoutHandler() {
    SecureStore.deleteItemAsync('authToken');
    this.setState({
      clientLoggedIn: false, loginFormDisplay: false, registrationFormDisplay: false, clientType: null, user: null, token: null, error: null, userMsg: null,
    });
  }

  render() {
    const {
      error, user, userMsg, clientLoggedIn, loginFormDisplay, registrationFormDisplay,
    } = { ...this.state };
    return (
      <>
        {!clientLoggedIn && !loginFormDisplay && !registrationFormDisplay && (
          <>
            {error === 'Unauthorized' && (
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
                <Text>{error}</Text>
              </View>
            )}
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
              <Button
                onPress={() => {
                  if (error === 'Unauthorized') {
                    this.setState({ loginFormDisplay: true, error: null });
                  } else this.setState({ loginFormDisplay: true });
                }}
                title="Login"
              />
              <Button
                onPress={() => {
                  if (error === 'Unauthorized') {
                    this.setState({ registrationFormDisplay: true, error: null });
                  } else this.setState({ registrationFormDisplay: true });
                }}
                title="Register"
              />
              <Button title="Proceed" onPress={() => this.applicationHandler()} />
            </View>
          </>
        )}
        {!clientLoggedIn && loginFormDisplay && (
          <>
            {error && (
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
                <Text>{error}</Text>
              </View>
            )}
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
              <TextInput placeholder="Username" id="login-username" onChangeText={(e) => { this.usernameInput = e; }} />
              <TextInput placeholder="Password" secureTextEntry id="login-password" onChangeText={(e) => { this.passwordInput = e; }} />
              <Button onPress={(e) => this.loginHandler(e)} title="Submit" />
            </View>
          </>
        )}
        {!clientLoggedIn && registrationFormDisplay && (
          <>
            {error && (
              <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
                <Text>{error}</Text>
              </View>
            )}
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
              <TextInput
                placeholder="Username"
                id="register-username"
                onChangeText={(e) => {
                  this.usernameInput = e;
                }}
              />
              <TextInput
                placeholder="password"
                secureTextEntry
                id="register-password"
                onChangeText={(e) => {
                  this.passwordInput = e;
                }}
              />
              <RadioForm
                radio_props={this.radioProps}
                initial={0}
                animation
                onPress={(value) => { this.selectedValue = value; }}
              />
              <Button onPress={(e) => this.registrationHandler(e)} title="Submit Register" />
            </View>
          </>
        )}
        {clientLoggedIn && !userMsg && (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
            <Text>
              Welcome
              {user}
              !
            </Text>
            <Button title="Proceed" onPress={() => this.applicationHandler()} />
            <Button title="Logout" onPress={() => this.logoutHandler()} />
          </View>
        )}
        {clientLoggedIn && userMsg && (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
            <Text>{ userMsg }</Text>
            <Button title="Logout" onPress={() => this.logoutHandler()} />
          </View>
        )}
      </>
    );
  }
}
export default AppForm;
