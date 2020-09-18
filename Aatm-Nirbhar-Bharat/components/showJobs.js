/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, View, TextInput, Button,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import AuthContext from './AuthContext';

const { host } = require('./host');

export default class ShowJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      vacanciesFound: [],
      vacanciesFoundNum: [],
      error: null,
    };
    
  }
  static contextType = AuthContext;

  componentDidMount() {
    
  }

  

  

  render() {
    const { route, navigation } = { ...this.props };
    const { error } = route.params;
    const {
      loading, vacanciesFound, vacanciesFoundNum,
    } = { ...this.state };
    return (
      <ScreenContainer>
        {error && (
          <Text>{error}</Text>
        )}
        {loading && (
          <Text>Retrieving YOur Eligible Vacancies...</Text>
        )}
        
      </ScreenContainer>
    );
  }
}
