/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  TextInput, Text, View, TouchableOpacity, StatusBar,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import RadioForm from 'react-native-simple-radio-button';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import styles from './cssStylesheet';
import AuthContext from './AuthContext';
const { host } = require('./host');

const { verifySchema } = require('../JWT/lib/schemaVerifier');

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
      confirmPass: '',
      checkPass: false,
      secureTextEntry: true,
    };
    this.radioProps = [
      { label: 'Labour', value: 0 },
      { label: 'Employer', value: 1 },
    ];
  }
  static contextType = AuthContext;

  textInputChange({
    username, email, mobile, confirmPass, passwordInp,
  }) {
    const { password } = { ...this.state };
    if (username) {
      if (username.length <= 0) this.setState({ username, checkTextInputUsername: false });
      else this.setState({ username, checkTextInputUsername: true });
    }
    if (email) {
      if (email.length <= 0) this.setState({ email, checkTextInputEmail: false });
      else if (email.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) !== 0) this.setState({ email, checkTextInputEmail: false });
      else this.setState({ email, checkTextInputEmail: true });
    }
    if (mobile) {
      if (mobile.length <= 0 || mobile.length < 10 || mobile.search(/^([1-9]{1}[0-9]{9})$/g) !== 0) this.setState({ mobile, checkTextInputMobile: false });
      else this.setState({ mobile, checkTextInputMobile: true });
    }
    if (passwordInp) {
      if (passwordInp.length <= 0) this.setState({ password: passwordInp, checkPass: false });
      else this.setState({ password: passwordInp, checkPass: true });
    }
    if (confirmPass) {
      if (confirmPass.length <= 0) this.setState({ passwordMatch: false });
      else if (confirmPass !== password) this.setState({ confirmPass, passwordMatch: false });
      else if (confirmPass === password) this.setState({ confirmPass, passwordMatch: true });
    }
  }

  // validateSchema({
  //   email, password, username, mobile,
  // }) {
  //   if (username.length > 0) {
  //     if (username.length <= 50) {
  //       if (typeof username === 'string') {
  //         if (email.length > 0) {
  //           if (email.length <= 50) {
  //             if (typeof email === 'string' && email.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) === 0) {
  //               if (mobile > 1000000000 && mobile < 10000000000) {
  //                 if (password.length > 0) {
  //                   if (password.length <= 12) {
  //                     if (typeof password === 'string') return true;
  //                     this.setState({
  //                       errorEntries: {
  //                         pass: 'Invalid password.', email: '', mobile: '', username: '',
  //                       },
  //                     });
  //                     return false;
  //                   }
  //                   this.setState({
  //                     errorEntries: {
  //                       pass: 'Password less should be less than 12.', mobile: '', email: '', username: '',
  //                     },
  //                   });
  //                   return false;
  //                 }
  //                 this.setState({
  //                   errorEntries: {
  //                     pass: 'Password cannot be blank.', mobile: '', username: '', email: '',
  //                   },
  //                 });
  //                 return false;
  //               }
  //               this.setState({
  //                 errorEntries: {
  //                   pass: '', mobile: 'Invalid mobile number.', username: '', email: '',
  //                 },
  //               });
  //               return false;
  //             }
  //             this.setState({
  //               errorEntries: {
  //                 email: 'Please enter a valid email address.', pass: '', mobile: '', username: '',
  //               },
  //             });
  //             return false;
  //           }
  //           this.setState({
  //             errorEntries: {
  //               email: 'Email length should be less than 50.', pass: '', mobile: '', username: '',
  //             },
  //           });
  //           return false;
  //         }
  //         this.setState({
  //           errorEntries: {
  //             email: 'Email cannot be blank.', pass: '', mobile: '', username: '',
  //           },
  //         });
  //         return false;
  //       }
  //       this.setState({
  //         errorEntries: {
  //           username: 'Please enter a valid username.', email: '', pass: '', mobile: '',
  //         },
  //       });
  //       return false;
  //     }
  //     this.setState({
  //       errorEntries: {
  //         username: 'Username length should be less than 50.', email: '', pass: '', mobile: '',
  //       },
  //     });
  //     return false;
  //   }
  //   this.setState({
  //     errorEntries: {
  //       username: 'Username cannot be blank.', email: '', pass: '', mobile: '',
  //     },
  //   });
  //   return false;
  // }

  registrationHandler() {
    const { navigation } = { ...this.props };
    const {
      username, password, mobile, userType, email, passwordMatch,
    } = { ...this.state };
    const { signIn } = this.context;
    if (verifySchema('register', {
      username,
      email,
      mobile,
      password,
      userType,
      details: 0,
    }) && passwordMatch) {
      fetch(`${host}/users/register`, {
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
          signIn({ token: json.token, userType: json.userType, user: json.user, details: json.details });
        } else if (json.msg === 'User already Exists!') {
          navigation.navigate('WelcomeLogin', { error: `Login as ${json.user}!` });
        } else navigation.navigate('Register', { error: json.msg });
      });
    } else {
      navigation.navigate('Register', {
        error: 'Invalid Registration request',
      });
    }
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { error } = route.params;
    const {
      username, email, password, mobile, checkTextInputUsername, checkTextInputEmail, checkTextInputMobile, secureTextEntry, passwordMatch, checkPass, confirmPass,
    } = { ...this.state };
    return (
      <ScreenContainer style={styles.container}>
        <StatusBar backgroundColor="#009387" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.text_header}>Welcome!</Text>
        </View>
        <Animatable.View
          animation="fadeInUpBig"
          style={styles.signUpFooter}
        >
          {error ? (
            <Animatable.View
              animation="bounceIn"
              duration={2000}
            >
              <Text style={styles.text_footer}>{error}</Text>
            </Animatable.View>
          ) : null}
          <Text style={styles.text_footer}>Name</Text>
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
            {username.length > 0 && (checkTextInputUsername
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
          <Text style={[styles.text_footer,
            { marginTop: 10 }]}
          >
            Email
          </Text>
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
            {email.length > 0 && (checkTextInputEmail
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
          <Text style={[styles.text_footer,
            { marginTop: 10 }]}
          >
            Mobile Number
          </Text>
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
            {mobile.length > 0 && (checkTextInputMobile
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
          <Text style={[styles.text_footer,
            { marginTop: 10 }]}
          >
            Password
          </Text>
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
              onChangeText={(e) => this.textInputChange({ passwordInp: e })}
            />
            <TouchableOpacity
              onPress={() => this.setState({ secureTextEntry: !secureTextEntry })}
            >
              {password.length > 0 && (secureTextEntry ? (
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
              ))}
            </TouchableOpacity>
          </View>
          <Text style={[styles.text_footer,
            { marginTop: 10 }]}
          >
            Confirm Password
          </Text>
          {checkPass && !passwordMatch ? (
            <Text style={styles.text_footer}>Passwords do not match</Text>
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
            }}
          />
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.textInputChange({
                  username, email, mobile, passwordInp: password, confirmPass,
                });
                if (checkTextInputUsername && checkTextInputEmail && checkTextInputMobile && checkPass && passwordMatch) {
                  this.registrationHandler();
                } else {
                  navigation.navigate('Register', {
                    error: 'Invalid credentials',
                  });
                }
              }}
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
