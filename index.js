/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Text, View, TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './components/cssStylesheet';

const logo = require('./assets/logo.png');

const WelcomeLogin = ({ navigation }) => (
  <ScreenContainer style={styles.container}>
    <View style={styles.welcomeHeader}>
      <Animatable.Image
        animation="bounceIn"
        duration={3500}
        source={logo}
        style={styles.welcomeLogo}
        resizeMode="stretch"
      />
    </View>
    <Animatable.View
      animation="fadeInUpBig"
      style={styles.welcomeFooter}
    >
      <Text style={styles.welcomeTitle}>Stay Connected!</Text>
      <Text style={styles.welcomeText}>Sign In</Text>
      <View style={styles.welcomeButton}>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn', {
          error: null,
        })}
        >
          <LinearGradient
            colors={['#08d4c4', '#01ab9d']}
            style={styles.welcomeSignIn}
          >
            <Text style={styles.welcomeTextSign}>Get Started</Text>
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
