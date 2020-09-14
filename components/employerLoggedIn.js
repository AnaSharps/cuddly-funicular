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
import AuthContext from './AuthContext';
import * as Animatable from 'react-native-animatable';
const { host } = require('./host');
import styles from './cssStylesheet';
import { ScrollView } from 'react-native-gesture-handler';

export default class EmployerLoggedIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      errorState: null,
      vacancyNameList: null,
    };
  }
  static contextType = AuthContext;

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { user, token } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/viewVacancies`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        userType: 'employer',
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        this.setState({ loading: false, vacancyNameList: json.vacancies });
      } else {
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject && resObject.userType === 'admin') {
              navigation.navigate('EmployerLoggedIn', {
                ...route.params, error: json.msg,
              });
            } else {
              this.setState({ errorState: json.msg });
            } 
          });
        }
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { user, token, error } = route.params;
    const { loading, vacancyNameList, errorState } = { ...this.state };
    return (
      <ScreenContainer style={{
        ...styles.container,
        // justifyContent: 'center',
        alignItems: 'center',
      }}>
        {error && (
          <View style={{ margin: 20 }}>
            <Text>{error}</Text>
          </View>
        )}
        {errorState && (
          <View style={{ margin: 20 }}>
            <Text>{errorState}</Text>
          </View>
        )}
        {!error && !errorState && loading && (
          <Text>
            Retrieving Vacancies
            ...
          </Text>
        )}
        <ScrollView>
        {!loading && vacancyNameList.map((val) => {
          const {
            job_desc, vacancy, vac_name, village, city, state,
          } = val;
          return (
            <View key={vac_name} style={styles.vacancyCard}>
              <View style={{ borderBottomWidth: 1, marginVertical: 5, marginHorizontal: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, opacity: 0.8, paddingHorizontal: 20 }}>{vac_name}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Description: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{job_desc}</Text>
              </View>
              {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Skills Required: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{skills.join(', ')}</Text>
              </View> */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>No. of Vacancies: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{vacancy}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Location: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{village}, {city}, {state}</Text>
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ViewApplicants', {
                    user, token, vacancyId: val.vac_id,
                  })}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>View Applicants</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              {/* <Button
                title="View Applicants"
                onPress={() => navigation.navigate('ViewApplicants', {
                  user, token, vacancyId: val.vac_id,
                })}
              /> */}
            </View>
          );
        })}
        </ScrollView>
      </ScreenContainer>
    );
  }
}
