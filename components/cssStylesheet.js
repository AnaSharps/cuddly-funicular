/* eslint-disable linebreak-style */
import { StyleSheet, Dimensions, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  welcomeHeader: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeFooter: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  welcomeLogo: {
    width: Dimensions.get('screen').height * 0.28,
    height: Dimensions.get('screen').height * 0.28,
  },
  welcomeTitle: {
    color: '#05375a',
    fontSize: 30,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'grey',
    marginTop: 30,
  },
  welcomeButton: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  welcomeSignIn: {
    width: 150,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    flexDirection: 'row',
  },
  welcomeTextSign: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  signInFooter: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  signUpFooter: {
    flex: 15,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorDisplay: {
    backgroundColor: '#fff',
    borderRadius: 30,
    height: Dimensions.get('screen').height * 0.05,
    marginBottom: 50,
    // paddingBottom: Dimensions.get('screen').height * 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textError: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchBarContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C0C0C0',
    borderRadius: 10,
    height: '20%',
    width: '95%',
  },
  searchBarTextInput: {
    marginTop: 5,
    paddingHorizontal: 5,
    width: '100%',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  searchBarCard: {
    width: '95%',
    height: '20%',
    padding: 5,
    backgroundColor: '#fff',
    marginBottom: 5,
    opacity: 0.85,
    borderRadius: 5,
    // marginHorizontal: 5,
  },
});

export default styles;
