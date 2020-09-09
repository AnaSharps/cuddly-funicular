/* eslint-disable linebreak-style */
import React from 'react';
import { View, Text, TextInput, Button, SafeAreaView, TouchableOpacity, Linking, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';
import * as Animatable from 'react-native-animatable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AuthContext from './AuthContext';
import styles from './cssStylesheet';

const { host } = require('./host');

export default class SearchVacancies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      searchHappened: 0,
      searchInput: '',
      locationInput: '',
      companyInput: '',
    };
  }
  static contextType = AuthContext;

  searchHandler() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token,
    } = route.params;
    const { searchInput, locationInput, companyInput } = { ...this.state };
    const { signOut } = this.context;
    this.setState({ searchHappened: 1 });
    fetch(`${host}/users/searchVacancy`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        skills: searchInput,
        location: locationInput,
        company: companyInput,
      }),
    }).then((res) => res.json()).then((json) => {
      this.setState({ searchHappened: 2 });
      if (json.success) {
        this.setState({ searchResults: json.results });
      } else {
        this.setState({ searchResults: [] });
        navigation.push('Search', {
          user, userType, token, error: json.msg,
        });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User'});
    });
  }
  
  render () {
    const { route, navigation } = this.props;
    const { error } = route.params;
    const { searchHappened, searchInput, companyInput, locationInput, searchResults } = { ...this.state };
    return (
      <ScreenContainer style={{
        ...styles.container,
        // justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Animatable.View
          animation="bounceIn"
          duration={2000}
          style={{ ...styles.searchBarContainer, marginTop: 20, position: 'relative' }}
        >
          <View style={{ ...styles.searchBarCard, position: 'relative' }}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search skills" onChangeText={(e) => this.setState({ searchInput: e })} />
          </View>
          <View style={{ ...styles.searchBarCard, position: 'relative' }}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search Companies" onChangeText={(e) => this.setState({ companyInput: e })} />
          </View>
          <View style={{ ...styles.searchBarCard, position: 'relative' }}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search locations" onChangeText={(e) => this.setState({ locationInput: e })} />
          </View>
          <Button
            title="Search"
            onPress={() => {
              this.searchHandler();
            }}
          />
        </Animatable.View>
        {searchHappened === 1 && (
          <Text>Retrieving vacancies...</Text>
        )}
        {searchHappened === 2 && !searchResults[0] && (
          <Text>No matching vacancies found</Text>
        )}
        {searchHappened === 2 && searchResults[0] && searchResults.map((val) => {
          const {
            job_desc, vacancy, vac_name, village, city, state, skills, vac_id, user_email,
          } = val;
          return (
            <View key={vac_id}>
              <Text>
                {job_desc}
                ,
                {' '}
                {vacancy}
                ,
                {' '}
                {vac_name}
                ,
                {' '}
                {village}
                ,
                {' '}
                {city}
                ,
                {' '}
                {state}
                ,
                {' '}
                {skills.join(', ')}
              </Text>
              <Button title="Email" onPress={() => Linking.openURL(`mailto:${user_email}`)} />
            </View>
          );
        })}
      </ScreenContainer>
    );
  }
}