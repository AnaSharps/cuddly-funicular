/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, TextInput, Button, Dimensions, StyleSheet, View, Image, TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import utils from '../JWT/lib/utils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorDisplay: {
    backgroundColor: '#fff',
    borderRadius: 30,
    height: Dimensions.get('screen').height * 0.05,
    marginBottom: 50,
    // paddingBottom: Dimensions.get('screen').height * 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textError: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

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
    if (this.validateSchema({ email, password })) {
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
          navigation.push('SignIn', {
            error: json.msg,
          });
        }
      });
    }
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { error } = route.params;
    const { checkTextInput, secureTextEntry, password, errorEmail, errorPass } = { ...this.state };
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
          style={styles.footer}
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
