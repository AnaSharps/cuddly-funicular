/* eslint-disable linebreak-style */
import React from 'react';
import { View, Text, TextInput, Button, SafeAreaView, TouchableOpacity, Linking, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AuthContext from './AuthContext';
import styles from './cssStylesheet';

const { host } = require('./host');

export default class SearchLabour extends React.Component {
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
      user, token, userType,
    } = route.params;
    const { searchInput, locationInput } = { ...this.state };
    const { signOut, update } = this.context;
    this.setState({ searchHappened: 1 });
    fetch(`${host}/users/searchLabour`, {
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
      }),
    }).then((res) => res.json()).then((json) => {
      this.setState({ searchHappened: 2 });
      if (json.success) {
        this.setState({ searchResults: json.results });
      } else {
        this.setState({ searchResults: [] });
      }
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized' });
    });
  }
  
  render () {
    const { route, navigation } = this.props;
    const { error } = route.params;
    const { searchHappened, searchResults } = { ...this.state };
    return (
      <ScreenContainer style={{
        ...styles.container,
        // justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Animatable.View
          animation="bounceIn"
          duration={2000}
          style={{ ...styles.searchBarContainer }}
        >
          <View style={styles.searchBarCard}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search skills" onChangeText={(e) => this.setState({ searchInput: e })} />
          </View>
          <View style={styles.searchBarCard}>
            <TextInput style={styles.searchBarTextInput} placeholder="Search locations" onChangeText={(e) => this.setState({ locationInput: e })} />
          </View>
          <TouchableOpacity
              onPress={() => {
                this.searchHandler();
              }}
              styles={{ ...styles.button, marginTop: 40 }}
            >
              <LinearGradient
                colors={['#08d4c4', '#01ab9d']}
                style={{ height: 30, borderRadius: 5, width: 100, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
              >
                <MaterialIcons
                  name="search"
                  color="#fff"
                  size={20}
                />
                <Text>Search</Text>
              </LinearGradient>
            </TouchableOpacity>
        </Animatable.View>
        {searchHappened === 1 && (
          <Text>Retrieving Search Results...</Text>
        )}
        {searchHappened === 2 && !searchResults[0] && (
          <Text>No matching candidates found</Text>
        )}
        <ScrollView>
        {searchHappened === 2 && searchResults[0] && searchResults.map((val) => {
          const {
            username, user_email, village, city, state, mobileNum, skills,
          } = val;
          return (
            <View key={user_email} style={{ ...styles.vacancyCard, width: '100%' }}>
              <View style={{ borderBottomWidth: 1, marginVertical: 5, marginHorizontal: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 22, opacity: 0.8, paddingHorizontal: 20 }}>{username}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Skills: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{skills.join(', ')}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, opacity: 0.8, paddingHorizontal: 15 }}>Location: </Text>
                <Text style={{ fontWeight: '200', fontSize: 15, paddingHorizontal: 5 }}>{village}, {city}, {state}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
              onPress={() => {
                Linking.openURL(`mailto:${user_email}`);
              }}
              styles={{ ...styles.button }}
            >
              <LinearGradient
                colors={['#08d4c4', '#01ab9d']}
                style={{ height: 30, borderRadius: 5, width: 100, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
              >
                <MaterialIcons
                  name='email'
                  color='#fff'
                  size={20}
                />
                <Text>Send Email</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(`tel:${mobileNum}`);
              }}
              styles={{ ...styles.button }}
            >
              <LinearGradient
                colors={['#08d4c4', '#01ab9d']}
                style={{ height: 30, borderRadius: 5, width: 100, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
              >
                <MaterialIcons
                  name='phone'
                  color='#fff'
                  size={20}
                />
                <Text>Call</Text>
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