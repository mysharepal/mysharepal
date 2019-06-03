import React, { Component } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, TextInput, StyleSheet } from 'react-native';
import { View, Text, Button } from 'react-native-ui-lib';
import { alertError } from '../components/Foundation'
import { Colors, CommonStyles } from '../Styles'

import firebase from 'react-native-firebase'
import Analytics from 'appcenter-analytics';
import * as AnalyticsConstants from '../AnalyticsConstants';

import { uid, listenForAuthenticationChange } from '../data/AuthInteractor'

export default class Welcome extends Component {
    static navigationOptions = {
        header: null
    }

    state = {
        authInProgress: false,
        isAuthenticated: false,
        awaitingPhoneNumber: false,
        confirmResult: null,
        awaitingCode: false,
    }

    constructor(props) {
        super(props)
    }

    setIsAuthenticated = (isAuthenticated) => {
        if (isAuthenticated) {
            this.setState({ isAuthenticated: true, authInProgress: false, awaitingPhoneNumber: false, confirmResult: null, awaitingCode: false })
        } else {
            this.setState({ isAuthenticated: isAuthenticated })
        }
    }

    phoneAuth = (phoneNumber) => {
        actionButton =
            console.log("Authenticating via phone")

        this.setState({ authInProgress: true })
        // Erroneously assume US country code only for now...
        firebase.auth().signInWithPhoneNumber('+1' + phoneNumber)
            .then(confirmResult => {
                if (this.state.isAuthenticated == true) {
                    this.setState({ authInProgress: false, confirmResult: null, awaitingCode: false, awaitingPhoneNumber: false })
                } else {
                    this.setState({ authInProgress: false, confirmResult: confirmResult, awaitingCode: true, awaitingPhoneNumber: false })
                }
            })
            .catch((error) => {
                console.log(error);
                this.setState({ authInProgress: false })
                alertError('An error occurred while authenticating your phone number. Please try again later.')
            })
    }

    confirmPhoneAuth = (code) => {
        console.log('confirming: ' + code)

        this.setState({ authInProgress: true })
        this.state.confirmResult
            .confirm(code)
            .then(user => { // User is logged in
                console.log('authed')
                this.setState({ authInProgress: false, isAuthenticated: true, awaitingCode: false })
            })
            .catch(error => {
                console.log(error)
                // Error with verification code);
                this.setState({ authInProgress: false, isAuthenticated: false, awaitingCode: false })
                alertError('An error occurred while confirming your phone number. Please try again')
            })
    }

    requestPhoneNumber = () => {
        this.setState({ awaitingPhoneNumber: true })
    }

    showVideos = () => {
        this.props.navigation.navigate('Intro')
    }

    componentDidMount() {
        listenForAuthenticationChange(user => {
            if (user !== null) {
                this.setIsAuthenticated(true)
            }
        }, null)
    }

    authInProgress = () => {
        const { authInProgress, awaitingPhoneNumber, awaitingCode } = this.state
        return authInProgress || awaitingPhoneNumber || awaitingCode
    }

    render() {
        let actionButton = null;

        if (this.state.authInProgress) {
            actionButton =
                <View>
                    <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 10 }} />
                    <Text style={styles.loadingMessage}>Authenticating...</Text>
                </View>
        } else if (this.state.awaitingPhoneNumber) {
            actionButton =
                <KeyboardAvoidingView style={{ width: '80%' }}>
                    <TextInput
                        key='phoneNumber'
                        placeholder='10-digit phone number'
                        placeholderTextColor='white'
                        maxLength={10}
                        keyboardType={"numeric"}
                        returnKeyType='done'
                        returnKeyLabel='Sign in'
                        onSubmitEditing={(event) => { this.phoneAuth(event.nativeEvent.text) }}
                        style={{ borderColor: 'white', borderWidth: 1, color: 'white', padding: 15, fontSize: 16 }} />
                </KeyboardAvoidingView>
        } else if (this.state.awaitingCode) {
            actionButton =
                <KeyboardAvoidingView style={{ width: '80%' }}>
                    <Text style={{ ...styles.authMessage, marginBottom: 15, textAlign: 'center' }}>
                        We've sent you a 6 digit code via SMS. You should receive it shortly.
                    </Text>
                    <TextInput
                        key='confCode'
                        placeholder='Enter your 6 digit code'
                        placeholderTextColor='white'
                        maxLength={10}
                        keyboardType={"numeric"}
                        returnKeyType='done'
                        returnKeyLabel='Confirm'
                        onSubmitEditing={(event) => { this.confirmPhoneAuth(event.nativeEvent.text) }}
                        style={{ borderColor: 'white', borderWidth: 1, color: 'white', padding: 15, fontSize: 16 }} />
                </KeyboardAvoidingView>
        } else if (this.state.isAuthenticated || this.props.isAuthenticated) {
            actionButton = (<Button
                label='Share now'
                style={styles.mainButton}
                onPress={
                    () => {
                        //this.props.navigation.navigate(steps[0].key)
                        this.props.navigation.navigate('ShareContact')
                        // this.props.navigation.navigate('Intro')
                        Analytics.trackEvent(AnalyticsConstants.EVENT_SHARE_STARTED, {
                            user: uid()
                        })
                    }
                } />)
        } else {
            actionButton = (<Button
                label="Sign in"
                style={styles.mainButton}
                onPress={() => {
                    this.requestPhoneNumber()
                }} />)
        }

        let secondaryButton = null
        if (!this.authInProgress()) {
            secondaryButton = <Button
                label="Learn more"
                style={{ ...styles.secondaryButton, marginTop: 20 }}
                onPress={this.showVideos} />
        }

        return (
            <View style={{ ...styles.container }}>
                <Text text10 style={{ fontSize: 48, fontWeight: '100', color: '#ffffff' }}>MySharePal</Text>
                <Text text10 style={{ fontSize: 18, color: '#ffffff', marginBottom: 20 }}>A Simple Way to Share the Gospel</Text>

                {actionButton}

                {secondaryButton}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    ...CommonStyles,
    container: {
        ...CommonStyles.container,
        flex: 1,
        paddingTop: 50
    },
    loadingMessage: {
        color: 'white',
        fontSize: 16
    },
    mainButton: {
        backgroundColor: Colors.primary,
        paddingLeft: 20,
        paddingRight: 20,
        borderWidth: 2,
        borderColor: Colors.primary,
        width: '50%'
    },
    secondaryButton: {
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'black',
        width: '50%'
    },
    authMessage: {
        color: 'white',
        fontSize: 16
    }
});