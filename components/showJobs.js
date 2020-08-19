/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, View, TextInput, Button,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';

export default class ShowJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      vacanciesFound: [],
      vacanciesFoundNum: [],
    };
    this.applyForJob = this.applyForJob.bind(this);
  }

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    fetch('https://19485340cb67.ngrok.io/users/viewJobsLabour', {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        userType: 'labour',
        viewJobs: true,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const vacancyNum = json.vacancyDetails.map(() => uuid.v4());
        this.setState({ loading: false, vacanciesFoundNum: vacancyNum, vacanciesFound: json.vacancyDetails });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  applyForJob(vacancyId) {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    fetch('https://19485340cb67.ngrok.io/users/applyforJob', {
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
        navigation.push('ShowJobs', {
          user, token, error: null,
        });
      } else {
        navigation.push('ShowJobs', {
          user, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  withdrawApplicationHandler(vacancyId) {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    fetch('https://19485340cb67.ngrok.io/users/withdrawJob', {
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
        navigation.push('ShowJobs', {
          user, token, error: null,
        });
      } else {
        navigation.push('ShowJobs', {
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
    const { error } = route.params;
    const {
      loading, vacanciesFound, vacanciesFoundNum,
    } = { ...this.state };
    return (
      <ScreenContainer>
        {error && (
          <Text>{error}</Text>
        )}
        {loading && (
          <Text>Retrieving YOur Eligible Vacancies...</Text>
        )}
        {!loading && vacanciesFound.map((val, ind) => {
          const {
            job_desc, vacancy, vac_name, village, city, state, skills, vac_id, applied,
          } = val;
          return (
            <View key={vacanciesFoundNum[ind]}>
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
              {applied && (
                <>
                  <Button title="Applied" disabled />
                  <Button title="Withdraw Application" onPress={() => this.withdrawApplicationHandler(vac_id)} />
                </>
              )}
              {!applied && (
                <Button title="Apply" onPress={() => this.applyForJob(vac_id)} />
              )}
            </View>
          );
        })}
      </ScreenContainer>
    );
  }
}
