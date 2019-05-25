import React, { Component } from 'react'
import renderContent, { subtitleViewRef, startOptionsViewRef } from './GetStartedScreenRenderer'
import LogInScreen from '../login/LogInScreen';
import WelcomeScreen from './WelcomeScreen';

import AppConfig from '../../../AppConfig'

export default class GetStartedScreen extends Component {
    static KEY = 'GetStartedScreen'

    static navigationOptions = ({ navigation }) => ({
        header: null
    })

    state = {
        subtitles: [
            'A simple way to share the Gospel',
            'How do you want to start?'
        ],
        currentSubtitle: -1,
        showStartDashboard: false
    }

    animation = {
        fadeInSubtitle:
            () => subtitleViewRef.fadeIn(AppConfig.DEFAULT_ANIM_DURATION),
        fadeOutSubtitle:
            () => subtitleViewRef.fadeOut(AppConfig.DEFAULT_ANIM_DURATION),
        fadeInStartOptions:
            () => startOptionsViewRef.fadeIn(AppConfig.DEFAULT_ANIM_DURATION)
    }

    flipSubtitle = () => {
        if (this.state.currentSubtitle < 0) {
            this.showFirstSubtitle()
            return
        } else if (this.state.currentSubtitle == this.state.subtitles.length - 1) {
            // Next flow
            return
        }

        setTimeout(() => {
            this.animation.fadeOutSubtitle()
                .then(this.onSubtitleFadedOut)
        }, 
            AppConfig.animDuration(3000)
        )
    }

    showFirstSubtitle = () => {
        this.setState({ currentSubtitle: 0 })
        this.animation.fadeInSubtitle()
        this.flipSubtitle()
    }

    onSubtitleFadedOut = () => {
        const newIndex = this.state.currentSubtitle + 1
        const willShowLastSubtitle = newIndex == this.state.subtitles.length - 1
        let onFadeIn = null
        if (!willShowLastSubtitle) {
            onFadeIn = this.flipSubtitle
        }

        this.setState({ currentSubtitle: newIndex })
        this.animation.fadeInSubtitle().then(onFadeIn)

        if (willShowLastSubtitle) {
            this.enableAndFadeInStartDashboard()
        }
    }

    enableAndFadeInStartDashboard = () => {
        this.setState({ showStartDashboard: true })
        this.animation.fadeInStartOptions()
    }

    render() {
        return renderContent({
            currentSubtitle: this.state.currentSubtitle,
            subtitles: this.state.subtitles,
            shouldShowStartOptions: this.state.showStartDashboard,
            onSubtitleReady: this.flipSubtitle,

            onStartSharer: () => { this.props.navigation.navigate(WelcomeScreen.KEY) },
            onStartAdmin: () => { },
            onLearnMore: () => { }
        })
    }
}