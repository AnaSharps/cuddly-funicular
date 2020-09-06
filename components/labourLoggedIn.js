/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { useContext } from 'react';
import {
  TextInput, Button, Text, Linking, View,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import * as Animatable from 'react-native-animatable';
import styles from './cssStylesheet';
import AuthContext from './AuthContext';
const { host } = require('./host');

export default class LabourLoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userVillage: '',
      userCity: '',
      useState: '',
      userSkills: [''],
      skillNum: [uuid.v4()],
      searchHappened: 0,
      searchInput: '',
      locationInput: '',
      companyInput: '',
      searchResults: [],
    };
    this.applicationHandler = this.applicationHandler.bind(this);
    this.updateDetails = true;
    this.sendUpdate = null;
  }
  static contextType = AuthContext;

  applicationHandler() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token,
    } = route.params;
    const {
      userSkills, userVillage, userCity, userState,
    } = { ...this.state };
    fetch(`${host}/users/updateMe`, {
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
        details: 1,
        updateInfo: this.sendUpdate,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        if (this.sendUpdate) this.sendUpdate = null;
        navigation.navigate('LabourLoggedIn', {
          user, userType, details: 1, token, userDetails: null, skillList: null, error: null,
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
      user, userType, token,
    } = route.params;
    const { searchInput, locationInput, companyInput } = { ...this.state };
    this.setState({ searchHappened: 1 });
    fetch(`${host}/users/searchVacancy`, {
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
        company: companyInput,
      }),
    }).then((res) => res.json()).then((json) => {
      this.setState({ searchHappened: 2 });
      if (json.success) {
        this.setState({ searchResults: json.results });
      } else {
        this.setState({ searchResults: [] });
        navigation.navigate('LabourLoggedIn', {
          user, userType, details: null, token, userDetails: null, skillList: null, error: json.msg,
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
      user, userType, details, token, userDetails, skillList, error,
    } = route.params;
    const {
      userVillage, userCity, userState, userSkills, skillNum, searchHappened, searchResults,
    } = { ...this.state };
    const { signOut } = this.context;
    if (userDetails && skillList && this.updateDetails) {
      const skillSet = skillList.split(':');
      const skillNumDup = [uuid.v4()];
      for (let i = 1; i < skillSet.length; i += 1) {
        skillNumDup.push(uuid.v4());
      }
      this.updateDetails = false;
      this.setState({
        userVillage: userDetails[0], userCity: userDetails[1], userState: userDetails[2], skillNum: skillNumDup, userSkills: skillSet,
      });
    }
    return (
      <ScreenContainer style={{
        ...styles.container,
        // justifyContent: 'center',
        alignItems: 'center',
      }}
      >
        {error && (
          <Text>{error}</Text>
        )}
        <Animatable.View
          animation="bounceIn"
          duration={2000}
          style={styles.searchBarContainer}
        >
          <View style={styles.searchBarCard}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search skills" onChangeText={(e) => this.setState({ searchInput: e })} />
          </View>
          <View style={styles.searchBarCard}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search Companies" onChangeText={(e) => this.setState({ companyInput: e })} />
          </View>
          <View style={styles.searchBarCard}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search locations" onChangeText={(e) => this.setState({ locationInput: e })} />
          </View>
          <Button
            title="Search"
            onPress={() => {
              this.searchHandler();
            }}
          />
        </Animatable.View>
        {searchHappened === 1 && (
          <Text>Retrieving vacancies...</Text>
        )}
        {searchHappened === 2 && !searchResults[0] && (
          <Text>No matching vacancies found</Text>
        )}
        {searchHappened === 2 && searchResults[0] && searchResults.map((val) => {
          const {
            job_desc, vacancy, vac_name, village, city, state, skills, vac_id, user_email,
          } = val;
          return (
            <View key={vac_id}>
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
              <Button title="Email" onPress={() => Linking.openURL(`mailto:${user_email}`)} />
            </View>
          );
        })}
        {!searchHappened && details !== 0 && (
        <>
          <Text>Welcome</Text>
          <Text> Look for your eligible jobs below! </Text>
          <Button
            title="Explore Job Opportunities"
            onPress={() => {
              navigation.navigate('ShowJobs', {
                user, token, error: null,
              });
            }}
          />
          <Button
            title="View your details"
            onPress={() => {
              navigation.navigate('ViewMe', {
                user, userType, token,
              });
            }}
          />
          <Button
            title="Logout"
            onPress={() => {
              SecureStore.deleteItemAsync('authToken');
              navigation.navigate('WelcomeLogin', { error: 'You have Successfully Logged Out!' });
            }}
          />
        </>
        )}
        {!searchHappened && details === 0 && (
        <>
          {userDetails && skillList && (
          <Text>You can Edit the following details!</Text>
          )}
          {!userDetails && (
          <Text>Please Enter the following details:</Text>
          )}
          <TextInput placeholder="Village" defaultValue={userVillage} onChangeText={(e) => this.setState({ userVillage: e })} />
          <TextInput placeholder="City" defaultValue={userCity} onChangeText={(e) => this.setState({ userCity: e })} />
          <TextInput placeholder="State" defaultValue={userState} onChangeText={(e) => this.setState({ userState: e })} />
          <TextInput placeholder="Earlier Employer Name" />
          {skillNum.map((val, ind) => (
            <TextInput
              placeholder="Enter Your Skill"
              defaultValue={userSkills[ind]}
              onChangeText={(e) => {
                const newSkills = [...userSkills];
                newSkills[ind] = e;
                this.setState({ userSkills: newSkills });
              }}
              key={val}
            />
          ))}
          <Button title="Add another Skill" onPress={() => { this.setState({ userSkills: [...userSkills, ''] }); this.setState({ skillNum: [...skillNum, uuid.v4()] }); }} />
          <Button
            title="Confirm Details"
            onPress={() => {
              if (userDetails && skillList) {
                this.sendUpdate = true;
                this.updateDetails = true;
              }
              this.applicationHandler();
            }}
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
