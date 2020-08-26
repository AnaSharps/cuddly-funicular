/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import * as React from 'react';
import {
  AsyncStorage, Button, Text, TextInput, View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
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
import SignIn from './components/signIn';
import AuthContext from './components/AuthContext';
// SignIn.contextType = AuthContext;
// Register.contextType = AuthContext;
// LabourLoggedIn.contextType = AuthContext;
// EmployerLoggedIn.contextType = AuthContext;

function SplashScreen() {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App({ navigation }) {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            userType: action.userType,
            user: action.user,
            details: action.details,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            userType: action.userType,
            user: action.user,
            details: action.details,
            isLoading: false,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            userType: null,
            user: null,
            details: null,
            isLoading: false,
          };
        default:
          //
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      userType: null,
      user: null,
      details: null,
    },
  );

  React.useEffect(() => {
    const authToken = SecureStore.getItemAsync('authToken');
    if (authToken) {
      authToken.then((res) => {
        const resObject = JSON.parse(res);
        if (resObject) {
          dispatch({
            type: 'RESTORE_TOKEN', token: JSON.stringify(resObject), userType: resObject.userType, user: resObject.user, details: resObject.details,
          });
        } else dispatch({ type: 'SIGN_OUT' });
      });
    } else dispatch({ type: 'SIGN_OUT' });
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: ({
        token, userType, user, details,
      }) => dispatch({
        type: 'SIGN_IN', token, userType, user, details,
      }),
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.isLoading && (
            <Stack.Screen name="Splash" component={SplashScreen} />
          )}
          {!state.isLoading && !state.userToken && (
            <>
              <Stack.Screen
                name="SignIn"
                component={SignIn}
                options={{
                  animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                }}
                initialParams={null}
              />
              <Stack.Screen name="Register" component={Register} initialParams={null} />
            </>
          )}
          {!state.isLoading && state.userToken && state.userType === 'labour' && (
            <>
              {/* <Stack.Screen name="HomeScreen" component={HomeScreen} /> */}
              <Stack.Screen
                name="LabourLoggedIn"
                component={LabourLoggedIn}
                initialParams={{
                  user: 'abc', userType: 'labour', details: 0, token: state.userToken, userDetails: null, skillList: null, error: null,
                }}
              />
              <Stack.Screen name="ShowJobs" component={ShowJobs} />
              <Stack.Screen name="ViewMe" component={ViewMe} />
            </>
          )}
          {!state.isLoading && state.userToken && state.userType === 'employer' && (
            <>
              <Stack.Screen
                name="EmployerLoggedIn"
                component={EmployerLoggedIn}
                initialParams={{
                  user: 'abc', userType: 'employer', token: state.userToken, createVacancy: null, error: null,
                }}
              />
              <Stack.Screen name="ViewVacancies" component={ViewVacancies} />
              <Stack.Screen name="ViewApplicants" component={ViewApplicants} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
