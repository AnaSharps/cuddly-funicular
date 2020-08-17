/* eslint-disable default-case */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
import React, { Component, useState, useEffect } from 'react';
import {
  Text, View, TextInput, Button,
} from 'react-native';
import { ScreenContainer } from 'react-native-screens';

export default class ShowJobs extends React.Component {
  render() {
    const { route, navigation } = { ...this.props };
    const { jdArr, vacNameArr, vacancyArr, villageArr, cityArr, stateArr, skillArr, vacObj } = route.params;
    return (
      <ScreenContainer>
        <Text>{JSON.stringify(vacNameArr)}</Text>
        <Text>{JSON.stringify(vacObj, null, 2)}</Text>
        {/* {vacNameArr.map((val, ind) => (
          <>
            <Text>{vacNameArr[ind]}, {jdArr[ind]}, {vacancyArr[ind]}, {villageArr[ind]}, {cityArr[ind]}, {stateArr[ind]}, {skillArr[ind]}</Text>
            <Button title="Apply" onPress={() => this.setState({ clicked: true })} />
          </>
        ))} */}
      </ScreenContainer>
    );
  }
}
