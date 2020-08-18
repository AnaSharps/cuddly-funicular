/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { Component, useState, useEffect } from 'react';
import {
  Text, View, TextInput, Button,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';

export const WelcomeLogin = ({ route, navigation }) => {
  const { error } = route.params;
  let email = null;
  let password = null;
  let mobile = null;
  return (
    <ScreenContainer>
      {error && (
        <Text>{error}</Text>
      )}
      <TextInput placeholder="Email-Id" keyboardType="email-address" onChangeText={(e) => { email = e; }} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={(e) => { password = e; }} />
      <Button
        title="Submit"
        onPress={() => {
          fetch('https://90b07c9dffef.ngrok.io/users/login', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }).then((res) => res.json()).then((json) => {
            if (json.success) {
              const authToken = JSON.stringify(json);
              SecureStore.setItemAsync('authToken', authToken);
              navigation.navigate('LoggedIn', {
                user: json.user,
                userType: json.userType,
                details: json.details,
                token: json.token,
                createVacancy: false,
              });
            } else {
              navigation.push('WelcomeLogin', {
                error: json.msg,
              });
            }
          });
        }}
      />
      <Button title="Register" onPress={() => navigation.navigate('Register', { error: null })} />
    </ScreenContainer>
  );
};

// class AppForm extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       clientLoggedIn: false,
//       loginFormDisplay: false,
//       registrationFormDisplay: false,
//       clientType: 'labour',
//       user: null,
//       error: null,
//       token: null,
//       userMsg: null,
//       detailsSubmitted: false,
//       createVacancy: false,
//       skillNum: 1,
//     };
//     this.radioProps = [
//       { label: 'Labour', value: 0 },
//       { label: 'Employer', value: 1 },
//       { label: 'Admin', value: 2 },
//     ];
//     this.selectedValue = 'labour';
//     this.usernameInput = null;
//     this.passwordInput = null;
//     this.userSkills = [];
//     this.skillNum = 1;
//     this.userCity = null;
//     this.userVillage = null;
//     this.userState = null;
//     this.vacancies = 1;
//     this.jd = null;
//   }

//   componentDidMount() {
//     const authToken = SecureStore.getItemAsync('authToken');
//     if (authToken) {
//       authToken.then((res) => {
//         const resObject = JSON.parse(res);
//         if (resObject) {
//           this.setState({
//             clientLoggedIn: true, user: resObject.user, clientType: resObject.userType, token: resObject.token,
//           });
//         }
//       });
//     }
//   }

//   loginHandler() {
//     fetch('https://1547de35fa16.ngrok.io/users/login', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         username: this.usernameInput,
//         password: this.passwordInput,
//       }),
//     }).then((res) => res.json()).then((json) => {
//       if (json.success) {
//         const authToken = JSON.stringify(json);
//         SecureStore.setItemAsync('authToken', authToken);
//         this.setState({
//           user: json.user, clientType: json.userType, token: json.token, clientLoggedIn: true, loginFormDisplay: false,
//         });
//       } else {
//         this.setState({ error: json.msg });
//       }
//     });
//   }

//   registrationHandler() {
//     fetch('https://1547de35fa16.ngrok.io/users/register', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         username: this.usernameInput,
//         password: this.passwordInput,
//         userType: this.selectedValue,
//       }),
//     }).then((res) => res.json()).then((json) => {
//       if (json.success) {
//         const authToken = JSON.stringify(json);
//         SecureStore.setItemAsync('authToken', authToken);
//         this.setState({
//           user: json.user, clientType: json.userType, token: json.token, clientLoggedIn: true, registrationFormDisplay: false,
//         });
//       } else {
//         this.setState({ error: json.msg });
//       }
//     });
//   }

//   applicationHandler() {
//     const { user, token, clientType } = { ...this.state };
//     const skills = this.userSkills.join(':');
//     fetch('https://1547de35fa16.ngrok.io/users/protected', {
//       method: 'POST',
//       headers: {
//         Authorization: token,
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         username: user,
//         userType: clientType,
//         skillset: skills,
//         village: this.userVillage,
//         city: this.userCity,
//         state: this.userState,
//         vacancy: this.vacancies,

//       }),
//     }).then((res) => res.json()).then((json) => {
//       if (json.success) {
//         this.setState({ userMsg: json.msg, createVacancy: false, detailsSubmitted: true });
//       }
//     }, () => {
//       SecureStore.deleteItemAsync('authToken');
//       this.setState({
//         error: 'Unauthorized', clientLoggedIn: false, loginFormDisplay: false, registrationFormDisplay: false, user: null, token: null, clientType: 'labour', detailsSubmitted: false, createVacancy: false, skillNum: 1, userMsg: null, jobsFound: false, laboursFound: false,
//       });
//     });
//   }

//   logoutHandler() {
//     SecureStore.deleteItemAsync('authToken');
//     this.passwordInput = null;
//     this.userCity = null;
//     this.userSkills = [];
//     this.userState = null;
//     this.userVillage = null;
//     this.vacancies = 1;
//     this.usernameInput = null;
//     this.setState({
//       clientLoggedIn: false, loginFormDisplay: false, registrationFormDisplay: false, clientType: null, user: null, token: null, error: null, userMsg: null, createVacancy: null, detailsSubmitted: false, skillNum: 1,
//     });
//   }

//   showJobHandler() {
//     const { clientType, token, user } = { ...this.state };
//     fetch('https://1547de35fa16.ngrok.io/users/protected', {
//       method: 'GET',
//       headers: {
//         Authorization: token,
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         username: user,
//         userType: clientType,
//       }),
//     }).then((res) => res.json()).then((json) => {
//       if (json.success) {
//         // this.jobs = json.users.split(':');
//         this.setState({ jobsFound: true });
//       }
//     }, () => {
//       SecureStore.deleteItemAsync('authToken');
//       this.setState({
//         error: 'Unauthorized', clientLoggedIn: false, loginFormDisplay: false, registrationFormDisplay: false, user: null, token: null, clientType: 'labour', detailsSubmitted: false, createVacancy: false, skillNum: 1, userMsg: null, jobsFound: false, laboursFound: false,
//       });
//     });
//   }

//   render() {
//     const {
//       error, user, userMsg, jobsFound, laboursFound, createVacancy, skillNum, detailsSubmitted, clientLoggedIn, clientType, loginFormDisplay, registrationFormDisplay,
//     } = { ...this.state };
//     const skillInput = [];
//     if (clientType === 'labour') {
//       for (let i = 0; i < skillNum; i += 1) {
//         skillInput.push(
//           <>
//             <View>
//               <TextInput placeholder="Enter Your Skill" defaultValue={this.userSkills[i]} onChangeText={(e) => this.userSkills.push(e)} />
//             </View>
//           </>,
//         );
//       }
//     } else if (clientType === 'employer') {
//       for (let i = 0; i < skillNum; i += 1) {
//         skillInput.push(
//           <>
//             <View>
//               <TextInput placeholder="Enter Skill Required" defaultValue={this.userSkills[i]} onChangeText={(e) => this.userSkills.push(e)} />
//             </View>
//           </>,
//         );
//       }
//     }
//     return (
//       <>
//         {!clientLoggedIn && !loginFormDisplay && !registrationFormDisplay && (
//           <>
//             {error === 'Unauthorized' && (
//               <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//                 <Text>{error}</Text>
//               </View>
//             )}
//             <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//               <Button
//                 onPress={() => {
//                   if (error === 'Unauthorized') {
//                     this.setState({ loginFormDisplay: true, error: null });
//                   } else this.setState({ loginFormDisplay: true });
//                 }}
//                 title="Login"
//               />
//               <Button
//                 onPress={() => {
//                   if (error === 'Unauthorized') {
//                     this.setState({ registrationFormDisplay: true, error: null });
//                   } else this.setState({ registrationFormDisplay: true });
//                 }}
//                 title="Register"
//               />
//               <Button title="Proceed" onPress={() => this.applicationHandler()} />
//             </View>
//           </>
//         )}
//         {!clientLoggedIn && loginFormDisplay && (
//           <>
//             {error && (
//               <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//                 <Text>{error}</Text>
//               </View>
//             )}
//             <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//               <TextInput placeholder="Username" onChangeText={(e) => { this.usernameInput = e; }} />
//               <TextInput placeholder="Password" secureTextEntry onChangeText={(e) => { this.passwordInput = e; }} />
//               <Button onPress={(e) => this.loginHandler(e)} title="Submit" />
//             </View>
//           </>
//         )}
//         {!clientLoggedIn && registrationFormDisplay && (
//           <>
//             {error && (
//               <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//                 <Text>{error}</Text>
//               </View>
//             )}
//             <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//               <TextInput
//                 placeholder="Username"
//                 id="register-username"
//                 onChangeText={(e) => {
//                   this.usernameInput = e;
//                 }}
//               />
//               <TextInput
//                 placeholder="password"
//                 secureTextEntry
//                 id="register-password"
//                 onChangeText={(e) => {
//                   this.passwordInput = e;
//                 }}
//               />
//               <RadioForm
//                 radio_props={this.radioProps}
//                 initial={0}
//                 animation
//                 onPress={(value) => {
//                   if (value === 0) this.selectedValue = 'labour';
//                   else if (value === 1) this.selectedValue = 'employer';
//                   else if (value === 2) this.selectedValue = 'admin';
//                 }}
//               />
//               <Button onPress={(e) => this.registrationHandler(e)} title="Submit Register" />
//             </View>
//           </>
//         )}
//         {clientLoggedIn && clientType && !userMsg && (
//           <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//             <Text>
//               Welcome
//               {' '}
//               {user}
//               !
//               {' '}
//               {clientType}
//             </Text>
//             {clientType === 'labour' && (
//               <>
//                 {!detailsSubmitted && (
//                   <View>
//                     <View>
//                       <Text>Please Enter the following details:</Text>
//                     </View>
//                     <View>
//                       <TextInput placeholder="Village" onChangeText={(e) => { this.userVillage = e; }} />
//                       <TextInput placeholder="City" onChangeText={(e) => { this.userCity = e; }} />
//                       <TextInput placeholder="State" onChangeText={(e) => { this.userState = e; }} />
//                       <TextInput placeholder="Earlier Employer Name" />
//                       {skillInput}
//                       <Button title="Add another Skill" onPress={() => { this.userSkills.push(''); this.setState({ skillNum: skillNum + 1 }); }} />
//                       <Button title="Confirm Details" onPress={() => this.applicationHandler()} />
//                     </View>
//                   </View>
//                 )}
//               </>
//             )}
//             {clientType === 'employer' && (
//               <>
//                 <View>
//                   {!createVacancy && (
//                     <Button title="Create Vacancy" onPress={() => this.setState({ createVacancy: true })} />
//                   )}
//                   {createVacancy && (
//                     <>
//                       {() => {
//                         this.vacancies = 1;
//                         this.userSkills = [];
//                         this.userCity = null;
//                         this.userState = null;
//                         this.userVillage = null;
//                       }}
//                     </>
//                   ) && (
//                     <>
//                       <View>
//                         <Text>Please Enter the Vacancy details:</Text>
//                       </View>
//                       <TextInput placeholder="Job Description" defaultValue={this.jd} onChangeText={(e) => { this.jd = e; }} />
//                       <TextInput placeholder="Number of Vacancies" keyboardType="numeric" defaultValue={this.vacancies} onChangeText={(e) => { this.vacancies = e; }} />
//                       <TextInput placeholder="Village" defaultValue={this.userVillage} onChangeText={(e) => { this.userVillage = e; }} />
//                       <TextInput placeholder="City" defaultValue={this.userCity} onChangeText={(e) => { this.userCity = e; }} />
//                       <TextInput placeholder="State" defaultValue={this.userState} onChangeText={(e) => { this.userState = e; }} />
//                       {skillInput}
//                       <Button title="Add another Skill" onPress={() => { this.userSkills.push(''); this.setState({ skillNum: skillNum + 1 }); }} />
//                       <Button title="Confirm Details" onPress={() => this.applicationHandler()} />
//                     </>
//                   )}
//                 </View>
//               </>
//             )}
//             <Button title="Logout" onPress={() => this.logoutHandler()} />
//           </View>
//         )}
//         {clientLoggedIn && userMsg && clientType && (
//           <View style={{ alignItems: 'center', justifyContent: 'center', padding: 100 }}>
//             <Text>{userMsg}</Text>
//             {clientType === 'employer' && !createVacancy && (
//               <Button title="Create Another Vacancy" onPress={() => this.setState({ createVacancy: true })} />
//             )}
//             {clientType === 'labour' && detailsSubmitted && (
//               <Button title="View Your Eligible Jobs" onPress={() => this.showJobHandler()} />
//             )}
//             <Button title="Logout" onPress={() => this.logoutHandler()} />
//           </View>
//         )}
//       </>
//     );
//   }
// }
