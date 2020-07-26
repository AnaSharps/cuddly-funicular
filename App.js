import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

class AppForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLoggedIn: false,
      employerLoggedIn: false,
      adminLoggedIn: false,
      userPresent: false,
      employerPresent: false,
      adminPresent: false,
      loginFormDisplay: false,
      registrationFormDisplay: false
    };
  }

  userButtonHandler = () => {
    this.setState({ userPresent: true })
  }

  employerButtonHandler = () => {
    this.setState({ employerPresent: true })
  }

  adminButtonHandler = () => {
    this.setState({ adminPresent: true })
  }

  userLoginHandler = () => {
    console.log('user login handler opened.');
    this.setState({ loginFormDisplay: true });
  }

  userRegistration = () => {
    console.log('user registration opened.');
    this.setState({ registrationFormDisplay: true });
  }

  employerLoginHandler = () => {
    console.log('employer login handler opened.');
    this.setState({ loginFormDisplay: true });
  }

  employerRegistration = () => {
    console.log('employer registration opened.');
    this.setState({ registrationFormDisplay: true });
  }

  adminLoginHandler = () => {
    console.log('admin login handler opened.');
    this.setState({ loginFormDisplay: true });
  }

  adminRegistration = () => {
    console.log('admin registration opened.');
    this.setState({ registrationFormDisplay: true });
  }

  render () {
    const { userPresent, employerPresent, adminPresent, userLoggedIn, employerLoggedIn, adminLoggedIn, loginFormDisplay, registrationFormDisplay } = { ...this.state };
    return(
      <>
        {!userPresent && !employerPresent && !adminPresent && (
          <>
            <View>
              <Button onPress={this.userButtonHandler} title='User'/>
              <Button onPress={this.employerButtonHandler} title='Employer'/>
              <Button onPress={this.adminButtonHandler} title='Admin'/>
            </View>
          </>
        )}
        {userPresent && !userLoggedIn && !loginFormDisplay && !registrationFormDisplay && (
          <>
            <View>
              <Button onPress={this.userLoginHandler} title='User Login'/>
              <Button onPress={this.userRegistration} title='User Registration'/>
            </View>
          </>
        )}
        {employerPresent && !employerLoggedIn && !loginFormDisplay && !registrationFormDisplay && (
          <>
            <View>
              <Button onPress={this.employerLoginHandler} title='Employer Login'/>
              <Button onPress={this.employerRegistration} title='Employer Registration'/>
            </View>
          </>
        )}
        {adminPresent && !adminLoggedIn && !loginFormDisplay && !registrationFormDisplay && (
          <>
            <View>
              <Button onPress={this.adminLoginHandler} title='Admin Login'/>
              <Button onPress={this.adminRegistration} title='Admin Registration'/>
            </View>
          </>
        )}
        {userPresent && !userLoggedIn && loginFormDisplay && (
          <>
            <View>
              <TextInput placeholder='Username' />
              <TextInput placeholder='password' textContentType='password' />
              <Button onPress={console.log('Login happened')} title='Submit' />
            </View>
          </>
        )}
        {employerPresent && !employerLoggedIn && loginFormDisplay && (
          <>
            <View>
              <TextInput placeholder='Username' />
              <TextInput placeholder='password' textContentType='password' />
              <Button onPress={console.log('Login happened')} title='Submit' />
            </View>
          </>
        )}
        {adminPresent && !adminLoggedIn && loginFormDisplay && (
          <>
            <View>
              <TextInput placeholder='Username' />
              <TextInput placeholder='password' textContentType='password' />
              <Button onPress={console.log('Login happened')} title='Submit' />
            </View>
          </>
        )}
        {userPresent && !userLoggedIn && registrationFormDisplay && (
          <>
            <View>
              <TextInput placeholder='Username' />
              <TextInput placeholder='password' textContentType='password' />
              <Button onPress={console.log('Registration happened')} title='Submit' />
            </View>
          </>
        )}
        {employerPresent && !employerLoggedIn && registrationFormDisplay && (
          <>
            <View>
              <TextInput placeholder='Username' />
              <TextInput placeholder='password' textContentType='password' />
              <Button onPress={console.log('Registration happened')} title='Submit' />
            </View>
          </>
        )}
        {adminPresent && !adminLoggedIn && registrationFormDisplay && (
          <>
            <View>
              <TextInput placeholder='Username' />
              <TextInput placeholder='password' textContentType='password' />
              <Button onPress={console.log('Registration happened')} title='Submit' />
            </View>
          </>
        )}
      </>
    );
  }
}
export default AppForm;
