/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { Component, useState, useEffect } from 'react';
import {
  Text, View, TextInput, Button,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';

export default class ViewVacancies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vacancyNameList: null,
    };
  }

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { user, token } = route.params;
    fetch('https://90b07c9dffef.ngrok.io/users/viewVacancies', {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        this.setState({ success: true, vacancyNameList: json.vacancies.map((val) => val.vac_name) });
      } else {
        navigation.navigate('LoggedIn', {
          user, userType: 'employer', details: null, token, createVacancy: false, userDetails: null, skillList: null,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  viewApplicationsHandler(vacancy) {
    const { route, navigation } = { ...this.props };
    const { user, token } = route.params;
    fetch('https://90b07c9dffef.ngrok.io/users/viewApplications', {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        vacancy,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        this.setState({ success: true, vacancyNameList: json.vacancies.map((val) => val.vac_name) });
      } else {
        navigation.navigate('LoggedIn', {
          user, userType: 'employer', details: null, token, createVacancy: false, userDetails: null, skillList: null,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { user, token } = route.params;
    const { success, vacancyNameList } = { ...this.state };
    return (
      <ScreenContainer>
        <Text>Hi</Text>
        {success && vacancyNameList.map((val) => (
          <>
            <Text key={uuid.v4()}>{val}</Text>
            <Button title="View Applicants" onPress={() => {
              this.viewApplicationsHandler(val);
            }} />
          </>
        ))}
      </ScreenContainer>
    );
  }
}
