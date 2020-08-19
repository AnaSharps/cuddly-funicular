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
      loading: true,
      vacancyNameList: null,
    };
  }

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { user, token } = route.params;
    fetch('https://976e3fc59bb0.ngrok.io/users/viewVacancies', {
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
        this.setState({ loading: false, vacancyNameList: json.vacancies });
      } else {
        navigation.navigate('ViewVacancies', {
          user, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { user, token, error } = route.params;
    const { loading, vacancyNameList, applications, viewApplicants } = { ...this.state };
    return (
      <ScreenContainer>
        {loading && (
          <Text>
            Retrieving Vacancies
            ...
          </Text>
        )}
        {error && (
          <Text>{error}</Text>
        )}
        {!loading && vacancyNameList.map((val) => (
          <>
            <Text key={uuid.v4()}>{val.vac_name}</Text>
            <Button
              title="View Applicants"
              onPress={() => navigation.navigate('ViewApplicants', {
                user, token, vacancyId: val.vac_id,
              })}
            />
          </>
        ))}
      </ScreenContainer>
    );
  }
}
