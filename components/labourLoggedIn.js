/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { useContext } from 'react';
import {
  TextInput, Button, Text, Linking, View, SafeAreaView, TouchableOpacity
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import * as Animatable from 'react-native-animatable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import styles from './cssStylesheet';
import AuthContext from './AuthContext';
import { ScrollView } from 'react-native-gesture-handler';
const { host } = require('./host');

export default class LabourLoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      vacanciesFound: [],
      vacanciesFoundNum: [],
      error: null,
    };
    this.applyForJob = this.applyForJob.bind(this);
  }
  static contextType = AuthContext;

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/viewJobsLabour`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        userType: 'labour',
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        const vacancyNum = json.vacancyDetails.map(() => uuid.v4());
        this.setState({ loading: false, vacanciesFoundNum: vacancyNum, vacanciesFound: json.vacancyDetails });
      } else {
        this.setState({ loading: false, vacanciesFound: json.vacancyDetails, error: 'No matching Jobs Found' });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  componentWillReceiveProps

  // componentWillReceiveProps() {
  //   const { route, navigation } = { ...this.props };
  //   const { token, user } = route.params;
  //   const { signOut } = this.context;
  //   fetch(`${host}/users/viewJobsLabour`, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: token,
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       user,
  //       userType: 'labour',
  //     }),
  //   }).then((res) => res.json()).then((json) => {
  //     if (json.success) {
  //       const vacancyNum = json.vacancyDetails.map(() => uuid.v4());
  //       this.setState({ loading: false, vacanciesFoundNum: vacancyNum, vacanciesFound: json.vacancyDetails });
  //     } else {
  //       this.setState({ loading: false, vacanciesFound: json.vacancyDetails, error: 'No matching Jobs Found' });
  //     }
  //   }, () => {
  //     SecureStore.deleteItemAsync('authToken');
  //     signOut({ error: 'Unauthorized User' });
  //   });
  // }

  applyForJob(vacancyId) {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/applyforJob`, {
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
        navigation.push('Home', {
          user, token, error: null,
        });
      } else {
        navigation.push('Home', {
          user, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  withdrawApplicationHandler(vacancyId) {
    const { route, navigation } = { ...this.props };
    const { token, user } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/withdrawJob`, {
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
        navigation.push('Home', {
          user, token, error: null,
        });
      } else {
        navigation.push('Home', {
          user, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, details, token, userDetails, skillList,
    } = route.params;
    const {
      loading, vacanciesFound, vacanciesFoundNum, error
    } = { ...this.state };
    const { signOut } = this.context;
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
        {loading && (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 200, marginHorizontal: 100 }}>
            <Text style={{fontSize: 18, fontWeight: '200' }}>Retrieving Your Eligible Vacancies...</Text>
          </View>
        )}
        {/* {!loading && vacanciesFoundNum.length <=0 && vacanciesFound.length <=0 && (
          <Text> No vacancies found for your skills</Text>
        )} */}
        {/* <ScrollView> */}
        {!loading && vacanciesFoundNum && vacanciesFound && vacanciesFound.map((val, ind) => {
          const {
            job_desc, vacancy, vac_name, village, city, state, skills, vac_id, applied,
          } = val;
          return (
            <View key={vacanciesFoundNum[ind]} style={{ ...styles.searchBarCard, marginVertical: 10, height: '30%' }}>
              <View style={{ borderBottomWidth: 1, marginVertical: 5, marginHorizontal: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, opacity: 0.8, paddingHorizontal: 20 }}>{vac_name}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Description: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{vac_name}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Skills Required: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{skills.join(', ')}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>No. of Vacancies: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{vacancy}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Location: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{village}, {city}, {state}</Text>
              </View>
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
        {/* </ScrollView> */}
      </ScreenContainer>
    );
  }
}
