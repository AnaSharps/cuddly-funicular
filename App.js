/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import * as React from 'react';
import {
  Text, View, TouchableOpacity, SafeAreaView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import WelcomeLogin from './index';
import ViewMe from './components/viewLabour';
import Register from './components/register';
import EmployerLoggedIn from './components/employerLoggedIn';
import LabourLoggedIn from './components/labourLoggedIn';
import ViewVacancies from './components/viewVacancies';
import ViewApplicants from './components/viewApplicants';
import SignIn from './components/signIn';
import Logout from './components/logout';
import AuthContext from './components/AuthContext';
import SearchVacancies from './components/searchVacancy';
import SearchLabour from './components/searchLabour';

// const { host } = require('./components/host');
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
const Drawer = createDrawerNavigator();
const LabStack = createStackNavigator();
const LabTab = createBottomTabNavigator();
const EmpStack = createStackNavigator();
const EmpTab = createBottomTabNavigator();
const ViewMeStack = createStackNavigator();

const ViewMeStackNavigator = ({ route, navigation }) => (
  <ViewMeStack.Navigator>
    <ViewMeStack.Screen
      name="ViewMe"
      component={ViewMe}
      initialParams={{ ...route.params }}
      options={{
        headerLeft: () => (
          <View>
            <SafeAreaView style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ alignItems: 'flex-end', margin: 16 }}
                onPress={navigation.openDrawer}
              >
                <FontAwesome5 name="bars" size={24} color="#161924" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        ),
      }}
    />
    {/* <ViewMeStack.Screen
      name="Home"
      component={LabTabNavigator}
      initialParams={{ ...route.params }}
      options={{
        headerLeft: () => (
          <View>
            <SafeAreaView style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ alignItems: 'flex-end', margin: 16 }}
                onPress={navigation.openDrawer}
              >
                <FontAwesome5 name="bars" size={24} color="#161924" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        ),
      }}
    /> */}
  </ViewMeStack.Navigator>
);

const LabTabNavigator = ({ route, navigation }) => (
  <LabTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        let iconName;
        let filled;
        if (route.name === 'Home') {
          iconName = 'home';
          filled = !focused;
        } else if (route.name === 'Search') {
          iconName = 'search';
          filled = !focused;
        }
        return <MaterialIcons name={iconName} size={30} color="black" filled={filled} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    }}
  >
    <LabTab.Screen name="Home" component={LabourLoggedIn} initialParams={{ ...route.params }} />
    <LabTab.Screen name="Search" component={SearchVacancies} initialParams={{ ...route.params }} />
  </LabTab.Navigator>
);

const LabourStack = ({ route, navigation }) => {
  const { routeName } = useNavigationState((state) => state.index);
  return (
    <LabStack.Navigator>
      <LabStack.Screen
        name="Home"
        component={LabTabNavigator}
        initialParams={{ ...route.params }}
        options={{
          headerLeft: () => (
            <View>
              <SafeAreaView style={{ flex: 1 }}>
                <TouchableOpacity
                  style={{ alignItems: 'flex-end', margin: 16 }}
                  onPress={navigation.openDrawer}
                >
                  <FontAwesome5 name="bars" size={24} color="#161924" />
                </TouchableOpacity>
              </SafeAreaView>
            </View>
          ),
          headerTitle: routeName,
        }}
      />
    </LabStack.Navigator>
  );
};

const EmployerTabNavigator = ({ route, navigation }) => {
  <EmpTab.Navigator>
    <EmpTab.Screen name="Home" component={EmployerLoggedIn} initialParams={{ ...route.params }} />
    <EmpTab.Screen name="Search" component={SearchLabour} initialParams={{ ...route.params }} />
  </EmpTab.Navigator>;
};

const EmployerStack = ({ route, navigation }) => (
  <EmpStack.Navigator>
    <EmpStack.Screen
      name="Home"
      component={EmployerTabNavigator}
      initialParams={{ ...route.params }}
      options={{
        headerLeft: () => (
          <View>
            <SafeAreaView style={{ flex: 1 }}>
              <TouchableOpacity
                style={{ alignItems: 'flex-end', margin: 16 }}
                onPress={navigation.openDrawer}
              >
                <FontAwesome5 name="bars" size={24} color="#161924" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        ),
      }}
    />
  </EmpStack.Navigator>
);

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
            userDetails: action.userDetails,
            skillList: action.skillList,
            createVacancy: action.createVacancy,
            error: action.error,
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
            userDetails: null,
            skillList: null,
            createVacancy: null,
            error: null,
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
            userDetails: null,
            skillList: null,
            createVacancy: null,
            error: action.error,
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
      userDetails: null,
      skillList: null,
      error: null,
      createVacancy: null,
    },
  );

  React.useEffect(() => {
    const authToken = SecureStore.getItemAsync('authToken');
    if (authToken) {
      authToken.then((res) => {
        const resObject = JSON.parse(res);
        if (resObject) {
          dispatch({
            type: 'RESTORE_TOKEN', token: resObject.token, userType: resObject.userType, user: resObject.user, details: resObject.details,
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
      signOut: ({ error }) => dispatch({ type: 'SIGN_OUT', error }),
      update: ({
        token, userType, user, details, userDetails, skillList, createVacancy, error,
      }) => dispatch({
        type: 'RESTORE_TOKEN', token, userType, user, details, userDetails, skillList, error, createVacancy,
      }),
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {state.isLoading && (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
          </Stack.Navigator>
        )}
        {!state.isLoading && !state.userToken && (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{
              animationTypeForReplace: state.isSignout ? 'pop' : 'push',
            }}
            initialParams={null}
          />
          <Stack.Screen name="Register" component={Register} initialParams={null} />
        </Stack.Navigator>
        )}
        {!state.isLoading && state.userToken && state.userType === 'labour' && (
        <Drawer.Navigator initialRouteName={state.details === 0 ? 'ViewMe' : 'Home'}>
          <Drawer.Screen
            name="Home"
            component={LabourStack}
            initialParams={{
              user: state.user, userType: state.userType, details: state.details, token: state.userToken, userDetails: null, skillList: null, error: null,
            }}
          />
          {/* <Drawer.Screen
            name="Home"
            component={LabourLoggedIn}
            initialParams={{
              user: state.user, userType: state.userType, details: state.details, token: state.userToken, userDetails: null, skillList: null, error: null,
            }}
          /> */}
          <Drawer.Screen name="ViewMe" component={ViewMeStackNavigator} initialParams={{ user: state.user, userType: state.userType, details: state.details, token: state.userToken, userDetails: null, skillList: null, error: null }} />
          <Drawer.Screen
            name="Logout"
            component={Logout}
            initialParams={{
              user: state.user, userType: state.userType, details: state.details, token: state.userToken, userDetails: null, skillList: null, error: null,
            }}
          />
        </Drawer.Navigator>
        )}
        {!state.isLoading && state.userToken && state.userType === 'employer' && (
          <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen
              name="Home"
              component={EmployerStack}
              initialParams={{
                user: state.user, userType: state.userType, token: state.userToken, createVacancy: null, error: null,
              }}
            />
            <Drawer.Screen name="ViewMe" component={ViewMeStackNavigator} initialParams={{ user: state.user, userType: state.userType, token: state.userToken }} />
            <Drawer.Screen
              name="Logout"
              component={Logout}
              initialParams={{
                user: state.user, userType: state.userType, token: state.userToken, createVacancy: null, error: null,
              }}
            />
            {/* <Drawer.Screen name="ViewVacancies" component={ViewVacancies} />
            <Drawer.Screen name="ViewApplicants" component={ViewApplicants} /> */}
            {/* <Drawer.Screen name="Logout" component={Logout} /> */}
          </Drawer.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
