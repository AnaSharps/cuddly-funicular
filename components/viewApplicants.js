/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, View, TextInput, Button, Linking,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';
import uuid from 'react-native-uuid';

export default class ViewApplicants extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      applications: [],
      applicationsNum: [],
      applicationsFound: null,
    };
  }

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const { user, token, vacancyId } = route.params;
    fetch('https://19485340cb67.ngrok.io/users/viewApplications', {
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
        const appNum = json.applications.map(() => uuid.v4());
        if (json.applications.length === 0) this.setState({ loading: false, applicationsFound: false });
        else {
          this.setState({
            loading: false, applicationsFound: true, applications: json.applications, applicationsNum: appNum,
          });
        }
      } else {
        navigation.navigate('ViewVacancies', {
          user, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      navigation.navigate('WelcomeLogin', { error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const { user, token } = route.params;
    const {
      loading, applications, applicationsNum, applicationsFound,
    } = { ...this.state };
    return (
      <ScreenContainer>
        {loading && (
          <Text> Retrieving Applications...</Text>
        )}
        {!loading && !applicationsFound && (
          <Text>No applications found for this vacancy</Text>
        )}
        {!loading && applicationsFound && applications.map((val, ind) => (
          <View key={applicationsNum[ind]}>
            <Text>
              {val.applicant}
              ,
              {' '}
              {val.applicant_mobile}
              ,
              {' '}
              {val.applicant_email}
              ,
              {' '}
              {val.applicant_address}
              ,
              {' '}
              {val.applicant_skills}
            </Text>
            <Button
              title="Send Email"
              onPress={() => {
                Linking.openURL(`mailto:${val.applicant_email}`);
              }}
            />
            <Button
              title="Call"
              onPress={() => {
                Linking.openURL(`tel:${val.applicant_mobile}`);
              }}
            />
          </View>
        ))}
      </ScreenContainer>
    );
  }
}
