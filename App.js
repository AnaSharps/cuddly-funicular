/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeLogin from './index';
import ViewMe from './components/viewLabour';
import Register from './components/register';
import EmployerLoggedIn from './components/employerLoggedIn';
import LabourLoggedIn from './components/labourLoggedIn';
import ShowJobs from './components/showJobs';
import ViewVacancies from './components/viewVacancies';
import ViewApplicants from './components/viewApplicants';

const AuthStack = createStackNavigator();

export default () => (
  <NavigationContainer>
    <AuthStack.Navigator>
      <AuthStack.Screen name="WelcomeLogin" component={WelcomeLogin} initialParams={null} />
      <AuthStack.Screen name="Register" component={Register} initialParams={null} />
      <AuthStack.Screen name="EmployerLoggedIn" component={EmployerLoggedIn} initialParams={null} />
      <AuthStack.Screen name="LabourLoggedIn" component={LabourLoggedIn} />
      <AuthStack.Screen name="ShowJobs" component={ShowJobs} />
      <AuthStack.Screen name="ViewMe" component={ViewMe} />
      <AuthStack.Screen name="ViewVacancies" component={ViewVacancies} />
      <AuthStack.Screen name="ViewApplicants" component={ViewApplicants} />
    </AuthStack.Navigator>
  </NavigationContainer>
);
