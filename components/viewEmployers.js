/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import {
  TextInput, Button, Text, Linking, View, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from 'react-native-screens';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import AuthContext from './AuthContext';
import * as Animatable from 'react-native-animatable';
const { host } = require('./host');
import styles from './cssStylesheet';
import { ScrollView } from 'react-native-gesture-handler';

export default class ViewEmployersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      empList: [],
      error: null,
    };
  }
  static contextType = AuthContext;

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { user, token, userType } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/viewEmployersList`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        userType,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        this.setState({ empList: json.users });
      } else this.setState({ error: json.msg });
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  removeEmployer(email) {
    const { route, navigation } = { ...this.props };
    const { user, userType, token } = route.params;
    const { signOut } = this.context;
    fetch(`${host}/users/removeMember`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        removeMemberId: email,
        userType: 'employer',
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        navigation.push('Home', {
          ...route.params,
        });
      } else this.setState({ error: json.msg });
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const{ user, userType, token } = route.params;
    const { empList, error } = { ...this.state };
    return (
      <ScreenContainer style={{
        ...styles.container,
        alignItems: 'center',
        flexDirection: 'column',
      }}>
        {error && (
          <Text>{error}</Text>
        )}
        <ScrollView>
        {!error && empList.length > 0 && empList.map((val) => {
          const { username, user_email, mobileNum, details, village, city, state } = val;
          return (
            <View key={user_email} style={{ ...styles.vacancyCard, flexDirection: 'column', width: '100%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 20, opacity: 0.8, paddingHorizontal: 15 }}>Username: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{username}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flex: 2 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Email Id: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{user_email}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', flex: 3 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Location: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{village}, {city}, {state}.</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 4 }}>
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`mailto:${user_email}`);
                  }}
                  styles={{ ...styles.button, flex: 1 }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 90, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
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
                    Linking.openURL(`tel:${mobileNum}`);
                  }}
                  styles={{ ...styles.button, flex: 1 }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 90, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                  >
                    <MaterialIcon
                      name="phone"
                      color="#fff"
                      size={20}
                    />
                    <Text>Call</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('ViewMe', {
                      user: user_email, userType: 'employer', token, details: 1, userDetails: null, skillList: null,
                    });
                  }}
                  styles={{ ...styles.button, flex: 1 }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 90, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>View Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('EmployerLoggedIn', {
                      user: user_email, userType: 'employer', token, details: 1, userDetails: null, skillList: null,
                    });
                  }}
                  styles={{ ...styles.button, flex: 1 }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>View Vacancies</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Remove Employer",
                      "Are you sure you want to remove this employer?",
                      [
                        {
                          text: "Yes",
                          onPress: () => this.removeEmployer(user_email),
                        },
                        {
                          text: "No",
                          onPress: () => {},
                          style: "cancel",
                        }
                      ],
                      { cancelable: false }
                    );
                  }}
                  styles={{ ...styles.button, flex: 2 }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 150, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                  >
                    <MaterialIcon
                      name="clear"
                      color="#fff"
                      size={20}
                    />
                    <Text>Remove</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        </ScrollView>
      </ScreenContainer>
    );
  }
}
