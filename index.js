/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, TextInput, Button, Dimensions, StyleSheet, View, Image, TouchableOpacity,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ScreenContainer } from 'react-native-screens';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const logo = require('./assets/logo.png');

const { height } = Dimensions.get('screen');
const heightLogo = height * 0.28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  logo: {
    width: heightLogo,
    height: heightLogo,
  },
  title: {
    color: '#05375a',
    fontSize: 30,
    fontWeight: 'bold',
  },
  text: {
    color: 'grey',
    marginTop: 30,
  },
  button: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  signIn: {
    width: 150,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    flexDirection: 'row',
  },
  textSign: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const WelcomeLogin = ({ navigation }) => (
  <ScreenContainer style={styles.container}>
    <View style={styles.header}>
      <Animatable.Image
        animation="bounceIn"
        duration={3500}
        source={logo}
        style={styles.logo}
        resizeMode="stretch"
      />
    </View>
    <Animatable.View
      animation="fadeInUpBig"
      style={styles.footer}
    >
      <Text style={styles.title}>Stay Connected!</Text>
      <Text style={styles.text}>Sign In</Text>
      <View style={styles.button}>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn', {
          error: null,
        })}
        >
          <LinearGradient
            colors={['#08d4c4', '#01ab9d']}
            style={styles.signIn}
          >
            <Text style={styles.textSign}>Get Started</Text>
            <MaterialIcons
              name="navigate-next"
              color="#fff"
              size={20}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  </ScreenContainer>
);

export default WelcomeLogin;
