/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import {
  Text, TextInput, View, Button, SafeAreaView, ScrollView, TouchableOpacity
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import * as SecureStore from 'expo-secure-store';
import AuthContext from './AuthContext';
import uuid from 'react-native-uuid';
import styles from './cssStylesheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { host } = require('./host');

export default class ViewMe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      village: '',
      city: '',
      state: '',
      username: '',
      skills: [],
      mobile: '',
      company: '',
      skillNum: [uuid.v4()],
      detailsPresent: null,
      userDetails: null,
      skillList: null,
      error: null,
    };
    this.applicationHandler = this.applicationHandler.bind(this);
    this.updateDetails = true;
    this.sendUpdate = null;
  }

  static contextType = AuthContext;

  componentDidMount() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, details, token, userDetails, skillList,
    } = route.params;
    // const { userDetails, skillList } = { ...this.state };
    const { signOut } = this.context;
    const authToken = SecureStore.getItemAsync('authToken');
    if (authToken) {
      authToken.then((res) => {
        const resObject = JSON.parse(res);
        if (resObject.details === 1) this.setState({ detailsPresent: true });
        else this.setState({ detailsPresent: false });
      })
    }
    this.viewDetails();
  }

  // componentDidUpdate() {
  //   const { route, navigation } = { ...this.props };
  //   const {
  //     user, userType, details, token, userDetails, skillList,
  //   } = route.params;
  //   // const { userDetails, skillList } = { ...this.state };
  //   const { signOut } = this.context;
  //   const authToken = SecureStore.getItemAsync('authToken');
  //   if (authToken) {
  //     authToken.then((res) => {
  //       const resObject = JSON.parse(res);
  //       if (resObject.details === 1) this.setState({ detailsPresent: true });
  //       else this.setState({ detailsPresent: false });
  //     })
  //   }
  //   this.viewDetails();
  // }

  viewDetails() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, details, token, userDetails, skillList, username, company,
    } = route.params;
    const { signOut } = this.context;
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
        if (json.msg === 'Details not entered') {
          this.setState({ detailsPresent: false });
        } else if (json.users) {
          let skills = [];
          if (userType === 'labour') {
            skills = json.users.map((val) => val.skills);
          }
          this.setState({
            village: json.users[0].village, city: json.users[0].city, state: json.users[0].state, skills, detailsPresent: true, username: json.users[0].username, mobile: `${json.users[0].mobileNum}`, company: userType === 'employer' ? json.users[0].company : '',
          });
        }
      } else this.setState({ error: json.msg });
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    }).catch((err) => {
      throw err;
    });
  }

  editMyDetails() {
    const { route, navigation } = { ...this.props };
    const { user, userType, token } = route.params;
    const { village, city, state, skills, username, mobile, company } = { ...this.state };
    this.setState({ userDetails: [village, city, state], skillList: skills.join(':'), detailsPresent: false });
    navigation.navigate('ViewMe', {
      user, userType, token, skillList: userType === 'labour' ? skills.join(':') : null, userDetails:[village, city, state, username, mobile, userType === 'employer' ? company : null], details: 0,
    });
  }

  applicationHandler() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token, details,
    } = route.params;
    const {
      skills, village, city, state, userDetails, skillList, username, mobile, company
    } = { ...this.state };
    const { signOut, update } = this.context;
    fetch(`${host}/users/updateMe`, {
      method: 'POST',
      headers: {
        Authorization: token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        userType,
        username: userDetails ? username : '',
        company: userType === 'employer' ? company : '',
        userSkills: skills,
        userVillage: village,
        userCity: city,
        userState: state,
        mobile,
        details: 1,
        updateInfo: userDetails ? true : false,
      }),
    }).then((res) => res.json()).then((json) => {
      if (json.success) {
        if (this.sendUpdate) this.sendUpdate = null;
        const authToken = SecureStore.getItemAsync('authToken');
        if (authToken) {
          authToken.then((res) => {
            const resObject = JSON.parse(res);
            if (resObject.userType != 'admin') {
              resObject.details = 1;
              SecureStore.setItemAsync('authToken', JSON.stringify(resObject));
            }
          });
        }
        navigation.push('ViewMe', { user, token, userType, details: 1, userDetails: null, skillList: null, error: null });
      } else navigation.push('ViewMe', { token, userType, details: 0, userDetails: null, skillList: null, error: null });
    }, () => {
      SecureStore.deleteItemAsync('authToken');
      signOut({ error: 'Unauthorized User' });
    });
  }

  render() {
    const { route, navigation } = { ...this.props };
    const {
      user, userType, token, details, userDetails, skillList,
    } = route.params;
    const {
      village, city, state, skills, skillNum, error, detailsPresent, username, mobile, company,
    } = { ...this.state };
    const { update } = this.context;
    if (userDetails && skillList && this.updateDetails) {
      const skillSet = skillList.split(':');
      const skillNumDup = [uuid.v4()];
      for (let i = 1; i < skillSet.length; i += 1) {
        skillNumDup.push(uuid.v4());
      }
      this.updateDetails = false;
      this.setState({
        village: userDetails[0], city: userDetails[1], state: userDetails[2], skillNum: skillNumDup, skills: skillSet, username: userDetails[3], mobile: userDetails[4], company: userType === 'employer' ? userDetails[5] : '',
      });
    }
    return (
      <ScreenContainer style={{ ...styles.container, height: '100%', width: '100%', alignItems: 'center', justifyContent: 'space-evenly' }}>
        {error && (
          <Text> {error} </Text>
        )}
        {!error && !userDetails && details === 1 && (
          <ScrollView>
          <View style={{ flexDirection: 'column', alignItems: 'center'}}>
            <View style={{ ...styles.searchBarCard, height: '95%', marginTop: 10, flex: 1, paddingBottom: 10 }}>
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>Username</Text>
              </View>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsValue}> {username} </Text>
              </View>
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>Email Address</Text>
              </View>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsValue}> {user} </Text>
              </View>
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>Mobile Number</Text>
              </View>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsValue}> {mobile} </Text>
              </View>
              {userType === 'employer' && (
                <>
                  <View style={styles.detailsHeading}>
                    <Text style={styles.detailsText}>Company's Name</Text>
                  </View>
                  <View style={styles.detailsBox}>
                    <Text style={styles.detailsValue}> {company} </Text>
                  </View>
                </>
              )}
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>Village</Text>
              </View>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsValue}> {village} </Text>
              </View>
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>City</Text>
              </View>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsValue}> {city} </Text>
              </View>
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>State</Text>
              </View>
              <View style={styles.detailsBox}>
                <Text style={styles.detailsValue}> {state} </Text>
              </View>
              {userType === 'labour' && (
                <>
                  <View style={styles.detailsHeading}>
                    <Text style={styles.detailsText}>Skills</Text>
                  </View>
                  {skills.map((val) => (
                    <View style={{ ...styles.detailsBox, marginVertical: 2 }} key={val} >
                      <Text style={styles.detailsValue}> {val} </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
            <View style={{ ...styles.detailsCard, flex: 2 }}>
              <TouchableOpacity
                onPress={() => {
                  this.editMyDetails();
                }}
                styles={{ ...styles.button }}
              >
                <LinearGradient
                  colors={['#08d4c4', '#01ab9d']}
                  style={{ height: 30, borderRadius: 5, width: 75, borderColor: '#fff', borderWidth: 1 }}
                >
                  <Text style={{ ...styles.textSign, color: '#fff', textAlign: 'center' }}>
                    Edit
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Home', {
                    ...route.params
                  });
                }}
                styles={{ ...styles.button, width: '40%', flex: 1 }}
              >
                <LinearGradient
                  colors={['#08d4c4', '#01ab9d']}
                  style={{ height: 30, borderRadius: 5, width: 75, borderColor: '#fff', borderWidth: 1 }}
                >
                  <Text style={{ ...styles.textSign, color: '#fff', textAlign: 'center' }}>
                    Home
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        )}
            {/* {details === 0 && detailsPresent && (
            <>
              <Text>Welcome</Text>
              <Text> Look for your eligible jobs below! </Text>
              <Button
                title="Explore Job Opportunities"
                onPress={() => {
                  navigation.navigate('Home', {
                    user, token, error: null,
                  });
                }}
              />
            </>
            )} */}
        {details === 0 && (
        <ScrollView>
          <View style={{ flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%', paddingHorizontal: 10 }}>
            {userDetails && (
                <Text style={{ fontWeight: 'bold', fontSize: 24, width: 300, marginTop: 5, alignSelf: 'baseline', paddingLeft: 3 }}>Edit Details</Text>
            )}
            {!userDetails && (
              <Text style={{ fontWeight: 'bold', fontSize: 24, width: 300 }}>Please fill in your details</Text>
            )}
            <View style={{ ...styles.searchBarCard, height: '95%', width: '100%', marginTop: 10, flex: 1, paddingBottom: 10 }}>
              {userDetails && (
              <>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>Username</Text>
                </View>
                <View style={{ ...styles.detailsBox }}>
                  <TextInput placeholder="Username" defaultValue={username} onChangeText={(e) => this.setState({ username: e })} style={styles.detailsValue} />
                </View>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>Mobile Number</Text>
                </View>
                <View style={{ ...styles.detailsBox }}>
                  <TextInput placeholder="Mobile" defaultValue={mobile} keyboardType="number-pad" onChangeText={(e) => this.setState({ mobile: e })} style={styles.detailsValue} />
                </View>
              </> 
              )}
              {userType === 'employer' && (
                <>
                  <View style={styles.detailsHeading}>
                    <Text style={styles.detailsText}>Company's Name</Text>
                  </View>
                  <View style={styles.detailsBox}>
                    <TextInput placeholder="Company's Name" defaultValue={company} onChangeText={(e) => this.setState({ company: e })} style={styles.detailsValue} />
                  </View>
                </>
              )}
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>Village</Text>
              </View>
              <View style={styles.detailsBox}>
                <TextInput placeholder="Village" defaultValue={village} onChangeText={(e) => this.setState({ village: e })} style={styles.detailsValue} />
              </View>
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>City</Text>
              </View>
              <View style={styles.detailsBox}>
                <TextInput placeholder="City" defaultValue={city} onChangeText={(e) => this.setState({ city: e })} style={styles.detailsValue} />
              </View>
              <View style={styles.detailsHeading}>
                <Text style={styles.detailsText}>State</Text>
              </View>
              <View style={styles.detailsBox}>
                <TextInput placeholder="State" defaultValue={state} onChangeText={(e) => this.setState({ state: e })} style={styles.detailsValue} />
              </View>
              {!userDetails && userType === 'labour' && (
                <>
                <View style={styles.detailsHeading}>
                  <Text style={styles.detailsText}>Earlier Employer Name</Text>
                </View>
                <View style={styles.detailsBox}>
                  <TextInput placeholder="Earlier Employer Name" style={styles.detailsValue} />
                </View>
                </>
              )}
              {userType === 'labour' && (
                <>
                  <View style={styles.detailsHeading}>
                    <Text style={styles.detailsText}>Skills</Text>
                  </View>
                  {skillNum.map((val, ind) => (
                    <View key={val} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <View style={{ ...styles.detailsBox, flex: 1, marginRight: 2 }}>
                      <TextInput
                        placeholder="Enter Your Skill"
                        defaultValue={skills[ind]}
                        style={{ ...styles.detailsValue }}
                        onChangeText={(e) => {
                          const newSkills = [...skills];
                          newSkills[ind] = e;
                          this.setState({ skills: newSkills });
                        }}
                      />
                      </View>
                      <View style={{  marginRight: 15, marginLeft: 5, marginVertical: 2 }}>
                      <TouchableOpacity
                        onPress={() => {
                          const skillCopy = skills;
                          const skillNumCopy = skillNum;
                          skillNumCopy.splice(ind, 1);
                          skillCopy.splice(ind, 1);
                          this.setState({ skills: skillCopy, skillNum: skillNumCopy });
                        }}
                        styles={{ ...styles.button }}
                      >
                        <LinearGradient
                          colors={['#08d4c4', '#01ab9d']}
                          style={{ height: 30, borderRadius: 5, width: 25, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <MaterialIcons
                            name="delete"
                            color="#fff"
                            size={20}
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                      {/* <Button title="Remove Skill" onPress={() => } /> */}
                      </View>
                    </View>
                  ))}
                </>
              )}
              {userType === 'labour' && (
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ skills: [...skills, ''], skillNum: [...skillNum, uuid.v4()] })}
                    styles={{ ...styles.button }}
                  >
                    <LinearGradient
                      colors={['#08d4c4', '#01ab9d']}
                      style={styles.addSkills}
                    >
                      <MaterialIcons
                        name="add"
                        color="black"
                        size={20}
                      />
                      <Text >Add Skill</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginHorizontal: 50, marginBottom: 50 }}>
              <TouchableOpacity
                onPress={() => {
                  if (userDetails) {
                    this.updateDetails = true;
                  }
                  this.applicationHandler();
                }}
                styles={{ ...styles.button, flex: 1 }}
              >
                <LinearGradient
                  colors={['#08d4c4', '#01ab9d']}
                  style={{ height: 30, borderRadius: 5, width: 200, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text>Confirm Details</Text>
                </LinearGradient>
              </TouchableOpacity>
              {userDetails && (
                <TouchableOpacity
                  onPress={() => {
                    const authToken = SecureStore.getItemAsync('authToken');
                    if (authToken) {
                      authToken.then((res) => {
                        const resObject = JSON.parse(res);
                        if (resObject) {
                          if (resObject.userType === 'admin') {
                            navigation.push('ViewMe', {
                              user, userType, token, skillList: null, userDetails: null, details: 1, error: null,
                            });
                          } else if (resObject.details === 1)  {
                            navigation.push('ViewMe', {
                              user, userType, token, skillList: null, userDetails: null, details: 1, error: null,
                            });
                          } else  {
                            navigation.push('ViewMe', {
                              user, userType, token, skillList: null, userDetails: null, details: 0, error: null,
                            });
                          }
                        }
                      })  
                    }
                  }}
                  styles={{ ...styles.button }}
                >
                  <LinearGradient
                    colors={['#08d4c4', '#01ab9d']}
                    style={{ height: 30, borderRadius: 5, width: 200, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
    );
  }
}
