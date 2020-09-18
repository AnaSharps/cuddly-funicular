/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  TextInput, Text, View, TouchableOpacity, StatusBar, Alert,
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

export default class AddMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameM: '',
      passwordM: '',
      mobileM: 0,
      userTypeM: 'labour',
      emailM: '',
      checkTextInputUsername: false,
      checkTextInputEmail: false,
      checkTextInputMobile: false,
      passwordMatch: false,
      schemaMatch: false,
      confirmPass: '',
      checkPass: false,
      secureTextEntry: true,
      error: null,
    };
    this.radioProps = [
      { label: 'Labour', value: 0 },
      { label: 'Employer', value: 1 },
      { label: 'Admin', value: 2 },
    ];
  }
  static contextType = AuthContext;

  textInputChange({
    usernameM, emailM, mobileM, confirmPass, passwordInp,
  }) {
    const { passwordM } = { ...this.state };
    if (usernameM) {
      if (usernameM.length <= 0) this.setState({ usernameM, checkTextInputUsername: false });
      else this.setState({ usernameM, checkTextInputUsername: true });
    }
    if (emailM) {
      if (emailM.length <= 0) this.setState({ emailM, checkTextInputEmail: false });
      else if (emailM.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) !== 0) this.setState({ emailM, checkTextInputEmail: false });
      else this.setState({ emailM, checkTextInputEmail: true });
    }
    if (mobileM) {
      if (mobileM.length <= 0 || mobileM.length < 10 || mobileM.search(/^([1-9]{1}[0-9]{9})$/g) !== 0) this.setState({ mobileM, checkTextInputMobile: false });
      else this.setState({ mobileM, checkTextInputMobile: true });
    }
    if (passwordInp) {
      if (passwordInp.length <= 0) this.setState({ passwordM: passwordInp, checkPass: false });
      else this.setState({ passwordM: passwordInp, checkPass: true });
    }
    if (confirmPass) {
      if (confirmPass.length <= 0) this.setState({ passwordMatch: false });
      else if (confirmPass !== passwordM) this.setState({ confirmPass, passwordMatch: false });
      else if (confirmPass === passwordM) this.setState({ confirmPass, passwordMatch: true });
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
    const { route, navigation } = { ...this.props };
    const { user, userType } = route.params;
    const {
      usernameM, passwordM, mobileM, userTypeM, emailM, passwordMatch,
    } = { ...this.state };
    const { signOut } = this.context;
    if (verifySchema('addMember', {
      user,
      userType,
      usernameM,
      emailM,
      mobileM,
      passwordM,
      userTypeM,
      details: 0,
    }) && passwordMatch) {
      fetch(`${host}/users/addMember`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          userType,
          usernameM,
          emailM,
          mobileM,
          passwordM,
          userTypeM,
          details: 0,
        }),
      }).then((res) => res.json()).then((json) => {
        if (json.success) {
          Alert.alert(
            "Member added",
            `${usernameM} added as a ${userTypeM}!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Home', {
                    ...route.params,
                  });
                },
              },
              {
                text: 'Add another member',
                onPress: () => {
                  navigation.navigate('AddMember', {
                    ...route.params,
                  });
                },
              },
            ],
            { cancelable: false },
          );
        } else if (json.msg === 'User already Exists!') {
          this.setState({ error: `User already exists with Email ID ${emailM}`})
        } else navigation.navigate('AddMember', {
          errorParams: json.msg,
        })
      }, () => {
        SecureStore.deleteItemAsync('authToken');
        signOut({ error: 'Unauthorized User' });
      });
    } else {
      navigation.navigate('AddMember', {
        errorParams: 'Malformed params request',
      });
    }
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { errorParams } = route.params;
    const {
      usernameM, emailM, passwordM, mobileM, checkTextInputUsername, checkTextInputEmail, checkTextInputMobile, secureTextEntry, passwordMatch, checkPass, confirmPass, error,
    } = { ...this.state };
    return (
      <ScreenContainer style={styles.container}>
        <StatusBar backgroundColor="#009387" barStyle="light-content" />
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
          {errorParams ? (
            <Animatable.View
              animation="bounceIn"
              duration={2000}
            >
              <Text style={styles.text_footer}>{errorParams}</Text>
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
              placeholder="Enter Name"
              style={styles.textInput}
              defaultValue={usernameM}
              onChangeText={(e) => this.textInputChange({ usernameM: e })}
            />
            {usernameM.length > 0 && (checkTextInputUsername
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
          <Text style={{ ...styles.text_footer, marginTop: 10 }}>
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
              defaultValue={emailM}
              onChangeText={(e) => this.textInputChange({ emailM: e })}
            />
            {emailM.length > 0 && (checkTextInputEmail
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
              placeholder="Enter mobile number"
              style={styles.textInput}
              keyboardType="phone-pad"
              maxLength={10}
              // defaultValue={mobile}
              onChangeText={(e) => this.textInputChange({ mobileM: e })}
            />
            {mobileM.length > 0 && (checkTextInputMobile
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
              {passwordM.length > 0 && (secureTextEntry ? (
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
            {passwordM.length > 0 && passwordM.length <= 12 && (passwordMatch
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
              if (value === 0) this.setState({ userTypeM: 'labour' });
              else if (value === 1) this.setState({ userTypeM: 'employer' });
              else if (value === 2) this.setState({ userTypeM: 'admin' });
            }}
          />
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.textInputChange({
                  usernameM, emailM, mobileM, passwordInp: passwordM, confirmPass,
                });
                if (checkTextInputUsername && checkTextInputEmail && checkTextInputMobile && checkPass && passwordMatch) {
                  this.registrationHandler();
                } else {
                  navigation.push('AddMember', {
                    ...route.params, errorParams: 'Invalid credentials',
                  });
                }
              }}
            >
              <LinearGradient
                colors={(checkTextInputUsername && checkTextInputEmail && checkTextInputMobile && passwordMatch) ? ['#08d4c4', '#01ab9d'] : ['#999999', '#777777']}
                style={styles.signIn}
              >
                <Text style={{ ...styles.textSign, color: '#fff' }}>
                  Add Member
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScreenContainer>
    );
  }
}
