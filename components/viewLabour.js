/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import {
  Text, TextInput, View, Button,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
const { host } = require('./host');

export default class ViewMe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      village: '',
      city: '',
      state: '',
      skills: [],
    };
  }

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token,
    } = route.params;
    fetch(`${host}/users/viewLabour`, {
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
        if (json.users) {
          const skills = json.users.map((val) => val.skills);
          this.setState({
            village: json.users[0].village, city: json.users[0].city, state: json.users[0].state, skills,
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
      user, userType, token,
    } = route.params;
    const {
      village, city, state, skills,
    } = { ...this.state };
    return (
      <ScreenContainer>
        <Text>Hello</Text>
        <Text>
          {user}
          ,
          {village}
          ,
          {city}
          ,
          {state}
          ,
          {skills.join(',')}
        </Text>
        <Text>Successfully fetched your details!</Text>
        <Button
          title="Edit"
          onPress={() => {
            navigation.navigate('LabourLoggedIn', {
              user, userType, details: 0, token, userDetails: [village, city, state], skillList: skills.join(':'), error: null,
            });
          }}
        />
      </ScreenContainer>
    );
  }
}
