/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import {
  TextInput, Button, Text, Linking, View, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import * as Animatable from 'react-native-animatable';
import AuthContext from './AuthContext';
import styles from './cssStylesheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ScrollView } from 'react-native-gesture-handler';

const { host } = require('./host');

export default class CreateVacancy extends React.Component {
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
      errorState: null,
    };
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
    const { signOut, update } = this.context;
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
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.navigate('EmployerLoggedIn', {
                ...route.params, error: null,
              });
            } else {
              navigation.navigate('Home', {
                user, userType, details: null, token, createVacancy: false, error: null,
              });
            }
          });
        }
      } else {
        this.setState({ errorState: json.msg });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { error } = route.params;
    const {
      userVillage, userCity, userState, vacancy, jobDesc, jobName, userSkills, skillNum, errorState,
    } = { ...this.state };
    return (
      <ScreenContainer
        style={{
          ...styles.container,
          alignItems: 'center',
        }}
      >
        {error && (
          <Text>{error}</Text>
        )}
        {errorState && (
          <Text>{errorState}</Text>
        )}
        <ScrollView>
          <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%', paddingHorizontal: 10 }}>
            {/* <View style={{ ...styles.searchBarCard, height: '95%', marginTop: 10, flex: 1, paddingBottom: 10 }}> */}
              {/* <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%', paddingHorizontal: 10 }}> */}
                <Text style={{ fontWeight: 'bold', fontSize: 24, width: 300, marginTop: 5, alignSelf: 'baseline', paddingLeft: 3 }}>Please Enter the Vacancy details:</Text>
              {/* </View> */}
              <View style={{ ...styles.searchBarCard, height: '95%', width: '100%', marginTop: 10, flex: 1, paddingBottom: 10 }}>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>Job Name</Text>
                </View>
                <View style={styles.detailsBox}>
                  <TextInput placeholder="Job Name" defaultValue={jobName} onChangeText={(e) => this.setState({ jobName: e })} style={styles.detailsValue} />
                </View>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>Job Description</Text>
                </View>
                <View style={{ ...styles.detailsBox }}>
                  <TextInput placeholder="Job Description" defaultValue={jobDesc} onChangeText={(e) => this.setState({ jobDesc: e })} style={styles.detailsValue} />
                </View>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>No. of Vacancies</Text>
                </View>
                <View style={{ ...styles.detailsBox }}>
                  <TextInput placeholder="No. of Vacancies" defaultValue={`${vacancy}`} keyboardType="number-pad" onChangeText={(e) => this.setState({ vacancy: e })} style={styles.detailsValue} />
                </View>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>Village</Text>
                </View>
                <View style={{ ...styles.detailsBox }}>
                  <TextInput placeholder="Village" defaultValue={userVillage} onChangeText={(e) => this.setState({ userVillage: e })} style={styles.detailsValue} />
                </View>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>City</Text>
                </View>
                <View style={{ ...styles.detailsBox }}>
                  <TextInput placeholder="City" defaultValue={userCity} onChangeText={(e) => this.setState({ userCity: e })} style={styles.detailsValue} />
                </View>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>State</Text>
                </View>
                <View style={{ ...styles.detailsBox }}>
                  <TextInput placeholder="State" defaultValue={userState} onChangeText={(e) => this.setState({ userState: e })} style={styles.detailsValue} />
                </View>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>Skills</Text>
                </View>
                {skillNum.map((val, ind) => (
                <View key={val} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ ...styles.detailsBox, flex: 1, marginRight: 2 }}>
                    <TextInput
                      placeholder="Enter Your Skill"
                      defaultValue={userSkills[ind]}
                      style={{ ...styles.detailsValue }}
                      onChangeText={(e) => {
                        const newSkills = [...userSkills];
                        newSkills[ind] = e;
                        this.setState({ userSkills: newSkills });
                      }}
                    />
                  </View>
                  <View style={{  marginRight: 15, marginLeft: 5, marginVertical: 2 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const skillCopy = userSkills;
                        const skillNumCopy = skillNum;
                        skillNumCopy.splice(ind, 1);
                        skillCopy.splice(ind, 1);
                        this.setState({ userSkills: skillCopy, skillNum: skillNumCopy });
                      }}
                      styles={{ ...styles.button }}
                    >
                      <LinearGradient
                        colors={['#08d4c4', '#01ab9d']}
                        style={{ height: 30, borderRadius: 5, width: 25, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <MaterialIcons
                          name="delete"
                          color="#fff"
                          size={20}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
                ))}
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ userSkills: [...userSkills, ''], skillNum: [...skillNum, uuid.v4()] })}
                    styles={{ ...styles.button }}
                  >
                    <LinearGradient
                      colors={['#08d4c4', '#01ab9d']}
                      style={styles.addSkills}
                    >
                      <MaterialIcons
                        name="add"
                        color="black"
                        size={20}
                      />
                      <Text >Add Skill</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginHorizontal: 50, marginBottom: 50 }}>
              <TouchableOpacity
                onPress={() => this.createVacancyHandler()}
                styles={{ ...styles.button, flex: 1 }}
              >
                <LinearGradient
                  colors={['#08d4c4', '#01ab9d']}
                  style={{ height: 30, borderRadius: 5, width: 200, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text>Confirm Details</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const authToken = SecureStore.getItemAsync('authToken');
                  if (authToken) {
                    authToken.then((res) => {
                      const resObject = JSON.parse(res);
                      if (resObject && resObject.userType === 'admin') {
                        navigation.navigate('EmployerLoggedIn', {
                          ...route.params,
                        });
                      } else {
                        navigation.navigate('Home', {
                          user, token, error: null,
                        });
                      } 
                    });
                  }
                }}
                styles={{ ...styles.button }}
              >
                <LinearGradient
                  colors={['#08d4c4', '#01ab9d']}
                  style={{ height: 30, borderRadius: 5, width: 200, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text>Cancel</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }
}
