/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  TextInput, Button, Text, View, TouchableOpacity, Platform, StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import RadioForm from 'react-native-simple-radio-button';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

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
    flex: 15,
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

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      mobile: 0,
      userType: 'labour',
      email: '',
      checkTextInputUsername: false,
      checkTextInputEmail: false,
      checkTextInputMobile: false,
      passwordMatch: false,
      schemaMatch: false,
      checkPass: false,
      secureTextEntry: true,
      errorEntries: {
        email: '', pass: '', username: '', mobile: '',
      },
    };
    this.radioProps = [
      { label: 'Labour', value: 0 },
      { label: 'Employer', value: 1 },
      { label: 'Admin', value: 2 },
    ];
  }

  textInputChange({
    username, email, mobile, confirmPass, passwordInp,
  }) {
    const { password, errorEntries } = { ...this.state };
    if (username) {
      if (typeof username === 'string' && username.length !== 0) {
        this.setState({ username, checkTextInputUsername: true, errorEntries: { ...errorEntries, username: '' } });
      } else this.setState({ username, checkTextInputUsername: false });
    } else if (email) {
      if (typeof email === 'string' && email.length !== 0 && email.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) === 0) {
        this.setState({ email, checkTextInputEmail: true, errorEntries: { ...errorEntries, email: '' } });
      } else this.setState({ email, checkTextInputEmail: false });
    } else if (mobile) {
      if (mobile > 1000000000 && mobile < 10000000000) {
        this.setState({ mobile, checkTextInputMobile: true, errorEntries: { ...errorEntries, email: '' } });
      } else this.setState({ mobile, checkTextInputMobile: false });
    } else if (passwordInp) {
      if (passwordInp.length > 0 && passwordInp.length <= 12 && typeof passwordInp === 'string') {
        this.setState({ password: passwordInp, checkPass: true, errorEntries: { ...errorEntries, pass: '' } });
      } else this.setState({ password: passwordInp, checkPass: false });
    } else if (confirmPass) {
      if (confirmPass.length > 0 && confirmPass === password) this.setState({ passwordMatch: true });
      else this.setState({ passwordMatch: false });
    }
  }

  validateSchema({
    email, password, username, mobile,
  }) {
    if (username.length > 0) {
      if (username.length <= 50) {
        if (typeof username === 'string') {
          if (email.length > 0) {
            if (email.length <= 50) {
              if (typeof email === 'string' && email.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) === 0) {
                if (mobile > 1000000000 && mobile < 10000000000) {
                  if (password.length > 0) {
                    if (password.length <= 12) {
                      if (typeof password === 'string') return true;
                      this.setState({
                        errorEntries: {
                          pass: 'Invalid password.', email: '', mobile: '', username: '',
                        },
                      });
                      return false;
                    }
                    this.setState({
                      errorEntries: {
                        pass: 'Password less should be less than 12.', mobile: '', email: '', username: '',
                      },
                    });
                    return false;
                  }
                  this.setState({
                    errorEntries: {
                      pass: 'Password cannot be blank.', mobile: '', username: '', email: '',
                    },
                  });
                  return false;
                }
                this.setState({
                  errorEntries: {
                    pass: '', mobile: 'Invalid mobile number.', username: '', email: '',
                  },
                });
                return false;
              }
              this.setState({
                errorEntries: {
                  email: 'Please enter a valid email address.', pass: '', mobile: '', username: '',
                },
              });
              return false;
            }
            this.setState({
              errorEntries: {
                email: 'Email length should be less than 50.', pass: '', mobile: '', username: '',
              },
            });
            return false;
          }
          this.setState({
            errorEntries: {
              email: 'Email cannot be blank.', pass: '', mobile: '', username: '',
            },
          });
          return false;
        }
        this.setState({
          errorEntries: {
            username: 'Please enter a valid username.', email: '', pass: '', mobile: '',
          },
        });
        return false;
      }
      this.setState({
        errorEntries: {
          username: 'Username length should be less than 50.', email: '', pass: '', mobile: '',
        },
      });
      return false;
    }
    this.setState({
      errorEntries: {
        username: 'Username cannot be blank.', email: '', pass: '', mobile: '',
      },
    });
    return false;
  }

  registrationHandler() {
    const { navigation } = { ...this.props };
    const {
      username, password, mobile, userType, email, passwordMatch,
    } = { ...this.state };
    if (this.validateSchema({
      email, password, username, mobile,
    }) && passwordMatch) {
      fetch('https://976e3fc59bb0.ngrok.io/users/register', {
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
          switch (json.userType) {
            case 'labour':
              navigation.navigate('LabourLoggedIn', {
                user: json.user,
                details: json.details,
                token: json.token,
                error: null,
              });
              break;
            case 'employer':
              navigation.navigate('EmployerLoggedIn', {
                user: json.user,
                token: json.token,
                createVacancy: false,
                error: null,
              });
              break;
            default:
            //
          }
        } else if (json.msg === 'User already Exists!') {
          navigation.navigate('WelcomeLogin', { error: `Login as ${json.user}!` });
        } else navigation.navigate('Register', { error: json.msg });
      });
    }
  }

  render() {
    const { route } = { ...this.props };
    const { error } = route.params;
    const {
      username, email, password, checkTextInputUsername, checkTextInputEmail, checkTextInputMobile, secureTextEntry, passwordMatch, errorEntries, checkPass,
    } = { ...this.state };
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
          {/* <Text style={styles.text_header}>Welcome!</Text> */}
        </View>
        <Animatable.View
          animation="fadeInUpBig"
          style={styles.footer}
        >
          <Text style={styles.text_footer}>Name</Text>
          {errorEntries.username ? (
            <Text style={styles.text_footer}>{errorEntries.username}</Text>
          ) : null}
          <View style={styles.action}>
            <FontAwesome
              name="user-o"
              color="#05375a"
              size={20}
            />
            <TextInput
              placeholder="Enter your Name"
              style={styles.textInput}
              defaultValue={username}
              onChangeText={(e) => this.textInputChange({ username: e })}
            />
            {checkTextInputUsername
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
            { marginTop: 10 }]}
          >
            Email
          </Text>
          {errorEntries.email ? (
            <Text style={styles.text_footer}>{errorEntries.email}</Text>
          ) : null}
          <View style={styles.action}>
            <FontAwesome
              name="user-o"
              color="#05375a"
              size={20}
            />
            <TextInput
              placeholder="Enter Email"
              style={styles.textInput}
              keyboardType="email-address"
              defaultValue={email}
              onChangeText={(e) => this.textInputChange({ email: e })}
            />
            {checkTextInputEmail
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
            { marginTop: 10 }]}
          >
            Mobile Number
          </Text>
          {errorEntries.mobile ? (
            <Text style={styles.text_footer}>{errorEntries.mobile}</Text>
          ) : null}
          <View style={styles.action}>
            <FontAwesome
              name="user-o"
              color="#05375a"
              size={20}
            />
            <TextInput
              placeholder="Enter your mobile number"
              style={styles.textInput}
              keyboardType="phone-pad"
              maxLength={10}
              // defaultValue={mobile}
              onChangeText={(e) => this.textInputChange({ mobile: e })}
            />
            {checkTextInputMobile
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
            { marginTop: 10 }]}
          >
            Password
          </Text>
          {errorEntries.pass ? (
            <Text style={styles.text_footer}>{errorEntries.pass}</Text>
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
              secureTextEntry={secureTextEntry}
              onChangeText={(e) => this.textInputChange({ passwordInp: e })}
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
          <Text style={[styles.text_footer,
            { marginTop: 10 }]}
          >
            Confirm Password
          </Text>
          {checkPass && !passwordMatch ? (
            <Text style={styles.text_footer}>Passwords do not match.</Text>
          ) : null}
          <View style={{ ...styles.action, flexDirection: 'row' }}>
            <Feather
              name="lock"
              color="#05375a"
              size={20}
            />
            <TextInput
              placeholder="Confirm Password"
              style={styles.textInput}
              secureTextEntry={secureTextEntry}
              onChangeText={(e) => this.textInputChange({ confirmPass: e })}
            />
            {password.length > 0 && password.length <= 12 && (passwordMatch
              ? (
                <Animatable.View>
                  <Feather
                    name="check-circle"
                    color="green"
                    size={20}
                  />
                </Animatable.View>
              )
              : (
                <Animatable.View>
                  <MaterialIcon
                    name="highlight-off"
                    color="red"
                    size={20}
                  />
                </Animatable.View>
              ))}
          </View>
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
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.registrationHandler()}
            >
              <LinearGradient
                colors={(checkTextInputUsername && checkTextInputEmail && checkTextInputMobile && passwordMatch) ? ['#08d4c4', '#01ab9d'] : ['#999999', '#777777']}
                style={styles.signIn}
              >
                <Text style={{ ...styles.textSign, color: '#fff' }}>
                  Sign Up
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScreenContainer>
    );
  }
}
