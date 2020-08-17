/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import { TextInput, Button, Text } from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';

export default class LoggedIn extends React.Component {
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
    };
    this.applicationHandler = this.applicationHandler.bind(this);
    this.newDetails = '';
    this.updateDetails = true;
    this.sendUpdate = null;
  }

  applicationHandler() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, details, token, createVacancy,
    } = route.params;
    const {
      userSkills, userVillage, userCity, userState, vacancy, jobDesc, jobName,
    } = { ...this.state };
    fetch('https://90b07c9dffef.ngrok.io/users/protected', {
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
        details: 1,
        updateInfo: this.sendUpdate,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        if (userType === 'labour') {
          if (this.sendUpdate) this.sendUpdate = null;
          navigation.navigate('LoggedIn', {
            user, userType, details: 1, token, createVacancy: false, userDetails: null, skillList: null,
          });
        } else if (userType === 'employer') {
          navigation.navigate('ViewVacancies', {
            user, userType, details: null, token, createVacancy: false,
          });
        }
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, details, token, createVacancy, userDetails, skillList,
    } = route.params;
    const {
      userVillage, userCity, userState, vacancy, jobDesc, jobName, userSkills, skillNum, applicationSuccess,
    } = { ...this.state };
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
      <ScreenContainer>
        <Text>You have successfully logged in!</Text>
        {user && userType === 'labour' && details !== 0 && (
        <>
          <Text>Welcome</Text>
          <Text> Look for your eligible jobs below! </Text>
          <Button
            title="Explore Job Opportunities"
            onPress={() => {
              fetch('https://90b07c9dffef.ngrok.io/users/viewJobsLabour', {
                method: 'POST',
                headers: {
                  Authorization: token,
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user,
                  userType,
                  viewJobs: true,
                }),
              }).then((res) => res.json()).then((json) => {
                if (json.success) {
                  const jdArr = json.vacObj.map((val) => (val.job_desc));
                  const vacNameArr = json.vacObj.map((val) => (val.vac_name));
                  const vacancyArr = json.vacObj.map((val) => (val.vacancy));
                  const villageArr = json.vacObj.map((val) => (val.village));
                  const cityArr = json.vacObj.map((val) => (val.city));
                  const stateArr = json.vacObj.map((val) => (val.state));
                  navigation.navigate('ShowJobs', {
                    jdArr, vacNameArr, vacObj: json.vacObj, vacancyArr, villageArr, cityArr, stateArr, skillArr: json.skillArr,
                  });
                }
              }, () => {
                SecureStore.deleteItemAsync('authToken');
                navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
              });
              navigation.navigate('ShowJobs', { user, token });
            }}
          />
          <Button
            title="View your details"
            onPress={() => {
              let skills;
              fetch('https://90b07c9dffef.ngrok.io/users/protected', {
                method: 'POST',
                headers: {
                  Authorization: token,
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user,
                  userType,
                  getInfo: true,
                }),
              }).then((res) => res.json()).then((json) => {
                if (json.success) {
                  if (userType === 'labour') {
                    if (json.users) {
                      skills = json.users.map((val) => val.skills);
                    }
                    navigation.navigate('ViewMe', {
                      user, userType, village: json.users[0].village, city: json.users[0].city, state: json.users[0].state, skills, token,
                    });
                  } else if (userType === 'employer') {
                    navigation.navigate('ViewVacancies', {
                      user, userType, details: null, token, createVacancy: false,
                    });
                  }
                }
              }, () => {
                SecureStore.deleteItemAsync('authToken');
                navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
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
        {user && userType === 'labour' && details === 0 && (
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
        </>
        )}
        {user && userType === 'employer' && createVacancy && (
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
            onPress={this.applicationHandler}
          />
        </>
        )}
        {user && userType === 'employer' && !createVacancy && (
        <>
          <Button
            title="Create Vacancy"
            onPress={() => navigation.navigate('LoggedIn', {
              user, userType, details: 1, token, createVacancy: true, userDetails: null, skillList: null,
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
              navigation.navigate('WelcomeLogin', { error: 'You have Successfully Logged Out!' });
            }}
          />
        </>
        )}
      </ScreenContainer>
    );
  }
}
