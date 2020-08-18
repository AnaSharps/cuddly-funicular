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

export default class ShowJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appliedJobs: [],
    };
  }

  applyForJob(vacancyId) {
    const { route, navigation } = { ...this.props };
    const { vacanciesFound, token, user } = route.params;
    const { appliedJobs } = { ...this.state };
    fetch('https://90b07c9dffef.ngrok.io/users/applyforJob', {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        vacancyId,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        this.setState({ appliedJobs: appliedJobs.push(vacancyId) });
      } else {
        navigation.navigate('ShowJobs', {
          vacanciesFound, user, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { vacanciesFound, error } = route.params;
    return (
      <ScreenContainer>
        {error && (
          <Text>{error}</Text>
        )}
        {vacanciesFound.map((val, ind) => {
          const {
            job_desc, vacancy, vac_name, village, city, state, skills, vac_id,
          } = val;
          return (
            <>
              <Text>
                {job_desc}
                ,
                {' '}
                {vacancy}
                ,
                {' '}
                {vac_name}
                ,
                {' '}
                {village}
                ,
                {' '}
                {city}
                ,
                {' '}
                {state}
                ,
                {' '}
                {skills.join(', ')}
              </Text>
              <Button title="Apply" onPress={() => this.applyForJob(vac_id)} />
            </>
          );
        })}
      </ScreenContainer>
    );
  }
}
