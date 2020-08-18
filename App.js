/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { WelcomeLogin } from './index';
import ViewMe from './components/viewLabour';
import Register from './components/register';
import LoggedIn from './components/loggedIn';
import ShowJobs from './components/showJobs';
import ViewVacancies from './components/viewVacancies';

const AuthStack = createStackNavigator();

export default () => (
  <NavigationContainer>
    <AuthStack.Navigator>
      <AuthStack.Screen name="WelcomeLogin" component={WelcomeLogin} initialParams={null} />
      <AuthStack.Screen name="Register" component={Register} initialParams={null} />
      <AuthStack.Screen name="LoggedIn" component={LoggedIn} initialParams={null} />
      <AuthStack.Screen name="ShowJobs" component={ShowJobs} />
      <AuthStack.Screen name="ViewMe" component={ViewMe} />
      <AuthStack.Screen name="ViewVacancies" component={ViewVacancies} />
    </AuthStack.Navigator>
  </NavigationContainer>
);
