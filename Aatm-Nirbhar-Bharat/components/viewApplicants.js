/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, View, TextInput, Button, Linking, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AuthContext from './AuthContext';
import { ScreenContainer } from 'react-native-screens';
import styles from './cssStylesheet';

const { host } = require('./host');

export default class ViewApplicants extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      applications: [],
    };
  }
  static contextType = AuthContext;

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { user, token, vacancyId } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/viewApplications`, {
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
        this.setState({
          loading: false, applicationsFound: true, applications: json.applications,
        });
      } else {
        navigation.navigate('ViewApplicants', {
          user, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    }).catch((err) => {
      throw err;
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { user, token, error } = route.params;
    const {
      loading, applications,
    } = { ...this.state };
    return (
      <ScreenContainer style={{
        ...styles.container,
        // justifyContent: 'center',
        alignItems: 'center',
      }}>
        {loading && (
          <Text style={{ marginHorizontal: 40, marginVertical: 70, fontSize: 20, fontWeight: '200' }}> Retrieving Applications...</Text>
        )}
        {!loading && applications.length === 0 && (
          <Text style={{ marginHorizontal: 40, marginVertical: 70, fontSize: 20, fontWeight: '200' }}>No applications yet</Text>
        )}
        {!loading && applications.length > 0 && applications.map((val) => {
          const {
            applicant, applicant_mobile, applicant_email, applicant_address, applicant_skills,
          } = val;
          return (
            <View key={val.applicant} style={styles.vacancyCard}>
              <View style={{ borderBottomWidth: 1, marginVertical: 5, marginHorizontal: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, opacity: 0.8, paddingHorizontal: 20 }}>{applicant}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Skills: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{applicant_skills}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Location: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{applicant_address}</Text>
              </View>
              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`mailto:${applicant_email}`);
                  }}
                  styles={{ ...styles.button, flex: 1 }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                  >
                    <MaterialIcon
                      name="email"
                      color="#fff"
                      size={20}
                    />
                    <Text>Email</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`tel:${applicant_mobile}`);
                  }}
                  styles={{ ...styles.button, flex: 2 }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>Call</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              {/* <Button
                title="Send Email"
                onPress={() => {
                  Linking.openURL(`mailto:${val.applicant_email}`);
                }}
              /> */}
              {/* <Button
                title="Call"
                onPress={() => {
                  Linking.openURL(`tel:${val.applicant_mobile}`);
                }}
              /> */}
            </View>
          );
        })}
      </ScreenContainer>
    );
  }
}
