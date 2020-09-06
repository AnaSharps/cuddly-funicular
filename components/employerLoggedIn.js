/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import {
  TextInput, Button, Text, Linking, View,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import AuthContext from './AuthContext';
const { host } = require('./host');
import styles from './cssStylesheet';

export default class EmployerLoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userVillage: '',
      userCity: '',
      useState: '',
      vacancy: 1,
      jobDesc: '',
      jobName: '',
      userSkills: [''],
      skillNum: [uuid.v4()],
      searchInput: '',
      locationInput: '',
      searchResults: [],
      searchHappened: 0,
    };
    this.createVacancyHandler = this.createVacancyHandler.bind(this);
  }
  static contextType = AuthContext;

  createVacancyHandler() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token,
    } = route.params;
    const {
      userSkills, userVillage, userCity, userState, vacancy, jobDesc, jobName,
    } = { ...this.state };
    fetch(`${host}/users/createVacancy`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        userType,
        userSkills,
        userVillage,
        userCity,
        userState,
        vacancy,
        jobDesc,
        jobName,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        if (userType === 'employer') {
          navigation.navigate('ViewVacancies', {
            user, userType, details: null, token, createVacancy: false,
          });
        }
      } else {
        navigation.navigate('EmployerLoggedIn', {
          user, userType, token, createVacancy: true, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  searchHandler() {
    const { route, navigation } = { ...this.props };
    const {
      user, token, userType,
    } = route.params;
    const { searchInput, locationInput } = { ...this.state };
    this.setState({ searchHappened: 1 });
    fetch(`${host}/users/searchLabour`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        skills: searchInput,
        location: locationInput,
      }),
    }).then((res) => res.json()).then((json) => {
      this.setState({ searchHappened: 2 });
      if (json.success) {
        this.setState({ searchResults: json.results });
      } else {
        this.setState({ searchResults: [] });
        navigation.navigate('EmployerLoggedIn', {
          user, userType, token, createVacancy: true, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token, createVacancy, error,
    } = route.params;
    const {
      userVillage, userCity, userState, vacancy, jobDesc, jobName, userSkills, skillNum, searchResults, searchHappened,
    } = { ...this.state };
    const { signOut } = this.context;
    return (
      <ScreenContainer>
        {error && (
          <Text>{error}</Text>
        )}
        <Text>You have successfully logged in!</Text>
        <TextInput placeholder="Search skills" onChangeText={(e) => this.setState({ searchInput: e })} />
        <TextInput placeholder="Search locations" onChangeText={(e) => this.setState({ locationInput: e })} />
        <Button
          title="Search"
          onPress={() => {
            this.searchHandler();
          }}
        />
        {searchHappened === 1 && (
          <Text>Retrieving Search Results...</Text>
        )}
        {searchHappened === 2 && !searchResults[0] && (
          <Text>No matching candidates found</Text>
        )}
        {searchHappened === 2 && searchResults[0] && searchResults.map((val) => {
          const {
            username, user_email, village, city, state, mobileNum, skills,
          } = val;
          return (
            <View key={user_email}>
              <Text>
                {username}
                ,
                {' '}
                {mobileNum}
                ,
                {' '}
                {user_email}
                ,
                {` ${village}, ${city}, ${state}`}
                ,
                {' '}
                {skills.join(', ')}
              </Text>
              <Button
                title="Send Email"
                onPress={() => {
                  Linking.openURL(`mailto:${user_email}`);
                }}
              />
              <Button
                title="Call"
                onPress={() => {
                  Linking.openURL(`tel:${mobileNum}`);
                }}
              />
            </View>
          );
        })}
        {!searchHappened && createVacancy && (
        <>
          <Text>Please Enter the Vacancy details:</Text>
          <TextInput placeholder="Job Name" defaultValue={jobName} onChangeText={(e) => this.setState({ jobName: e })} />
          <TextInput placeholder="Job Description" defaultValue={jobDesc} onChangeText={(e) => this.setState({ jobDesc: e })} />
          <TextInput placeholder="Number of Vacancies" defaultValue={vacancy} keyboardType="numeric" onChangeText={(e) => this.setState({ vacancy: e })} />
          <TextInput placeholder="Village" defaultValue={userVillage} onChangeText={(e) => this.setState({ userVillage: e })} />
          <TextInput placeholder="City" defaultValue={userCity} onChangeText={(e) => this.setState({ userCity: e })} />
          <TextInput placeholder="State" defaultValue={userState} onChangeText={(e) => this.setState({ userState: e })} />
          {skillNum.map((val, ind) => (
            <TextInput
              placeholder="Enter Skill Required"
              defaultValue={userSkills[ind]}
              onChangeText={(e) => {
                const newSkills = [...userSkills];
                newSkills[ind] = e;
                this.setState({ userSkills: newSkills });
              }}
              key={val}
            />
          ))}
          <Button title="Add another Skill" onPress={() => this.setState({ userSkills: [...userSkills, ''], skillNum: [...skillNum, uuid.v4()] })} />
          <Button
            title="Confirm Details"
            onPress={this.createVacancyHandler}
          />
        </>
        )}
        {!searchHappened && !createVacancy && (
        <>
          <Button
            title="Create Vacancy"
            onPress={() => navigation.navigate('EmployerLoggedIn', {
              user, userType, token, createVacancy: true, error: null,
            })}
          />
          <Button
            title="View Your Created Vacancies"
            onPress={() => navigation.navigate('ViewVacancies', { user, token })}
          />
          <Button
            title="Logout"
            onPress={() => {
              SecureStore.deleteItemAsync('authToken');
              signOut();
            }}
          />
        </>
        )}
      </ScreenContainer>
    );
  }
}
