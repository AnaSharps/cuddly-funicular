/* eslint-disable linebreak-style */
/* eslint-disable default-case */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, TextInput, View, TouchableOpacity, StatusBar,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import styles from './cssStylesheet';
import AuthContext from './AuthContext';
const { host } = require('./host');

const { verifySchema } = require('../JWT/lib/schemaVerifier');

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      checkTextInput: false,
      secureTextEntry: true,
      errorPass: '',
      errorEmail: '',
    };
  }
  static contextType = AuthContext;

  textInputChange(val) {
    if (typeof val === 'string' && val.length > 0 && val.length <= 50 && val.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) === 0) {
      this.setState({ email: val, checkTextInput: true, errorEmail: '' });
    } else {
      this.setState({ email: val, checkTextInput: false });
    }
  }

  validateSchema({ email, password }) {
    if (email.length > 0) {
      if (email.length <= 50) {
        if (typeof email === 'string' && email.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) === 0) {
          if (password.length > 0) {
            if (typeof password === 'string') {
              if (password.length <= 12) return true;
              this.setState({ errorPass: 'Password length should be less than 12', errorEmail: '' });
              return false;
            }
            this.setState({ errorPass: 'Please enter valid password', errorEmail: '' });
            return false;
          }
          this.setState({ errorPass: 'Password cannot be blank', errorEmail: '' });
          return false;
        }
        this.setState({ errorEmail: 'Please enter a valid Email address', errorPass: '' });
        return false;
      }
      this.setState({ errorEmail: 'Email length should be less than 50', errorPass: '' });
      return false;
    }
    this.setState({ errorEmail: 'Email cannot be blank', errorPass: '' });
    return false;
  }

  loginHandler() {
    const { navigation } = { ...this.props };
    const { email, password } = { ...this.state };
    const { signIn } = this.context;
    if (verifySchema('login', { email, password })) {
      fetch(`${host}/users/login`, {
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
          signIn({ token: json.token, userType: json.userType, user: json.user, details: json.details });
        } else {
          navigation.push('SignIn', {
            error: json.msg,
          });
        }
      });
    } else {
      navigation.navigate('SignIn', {
        error: 'Invalid Login Request',
      });
    }
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { error } = route.params;
    const { checkTextInput, secureTextEntry, errorEmail, errorPass } = { ...this.state };
    return (
      <ScreenContainer style={styles.container}>
        <StatusBar backgroundColor="#009387" barStyle="light-content" />
        <View style={styles.header}>
          {error ? (
            <Animatable.View
              animation="fadeInDownBig"
              style={styles.errorDisplay}
            >
              <Text style={styles.textError}>{error}</Text>
            </Animatable.View>
          ) : null}
          <Text style={styles.text_header}>Welcome!</Text>
        </View>
        <Animatable.View
          animation="fadeInUpBig"
          style={styles.signInFooter}
        >
          <Text style={styles.text_footer}>Email</Text>
          {errorEmail ? (
            <Text style={styles.text_footer}>{errorEmail}</Text>
          ) : null}
          <View style={styles.action}>
            <FontAwesome
              name="user-o"
              color="#05375a"
              size={20}
            />
            <TextInput
              placeholder="Email-Id"
              style={styles.textInput}
              maxLength={50}
              keyboardType="email-address"
              onChangeText={(e) => this.textInputChange(e)}
            />
            {checkTextInput
              ? (
                <Animatable.View>
                  <Feather
                    name="check-circle"
                    color="green"
                    size={20}
                  />
                </Animatable.View>
              )
              : null}
          </View>
          <Text style={[styles.text_footer,
            { marginTop: 35 }]}
          >
            Password
          </Text>
          {errorPass ? (
            <Text style={styles.text_footer}>{errorPass}</Text>
          ) : null}
          <View style={styles.action}>
            <Feather
              name="lock"
              color="#05375a"
              size={20}
            />
            <TextInput
              placeholder="Password"
              style={styles.textInput}
              maxLength={12}
              secureTextEntry={secureTextEntry}
              onChangeText={(e) => this.setState({ password: e })}
            />
            <TouchableOpacity
              onPress={() => this.setState({ secureTextEntry: !secureTextEntry })}
            >
              {secureTextEntry ? (
                <Feather
                  name="eye-off"
                  color="grey"
                  size={20}
                />
              ) : (
                <Feather
                  name="eye"
                  color="grey"
                  size={20}
                />
              )}
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.loginHandler()}
            >
              <LinearGradient
                colors={['#08d4c4', '#01ab9d']}
                style={styles.signIn}
              >
                <Text style={{ ...styles.textSign, color: '#fff' }}>
                  Sign In
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register', { error: null })}
              style={[styles.signIn, {
                borderColor: '#009387',
                borderWidth: 1,
                marginTop: 15,
              }]}
            >
              <Text style={{ ...styles.textSign, color: '#009387' }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
        {/* {error && (
        <Text>{error}</Text>
        )}

        <Button
          title="Submit"
          onPress={() => {
            this.loginHandler();
          }}
        />
        <Button title="Register" onPress={() => navigation.navigate('Register', { error: null })} /> */}
      </ScreenContainer>
    );
  }
}
