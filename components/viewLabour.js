/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import {
  Text, TextInput, View, Button,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';

export default class ViewMe extends React.Component {
  render() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token, village, city, state, skills,
    } = route.params;
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
            navigation.navigate('LoggedIn', {
              user, userType, details: 0, token, createVacancy: null, userDetails: [village, city, state], skillList: skills.join(':'),
            });
          }}
        />
      </ScreenContainer>
    );
  }
}
