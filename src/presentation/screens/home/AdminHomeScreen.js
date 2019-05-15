import React, { Component } from 'react'

import { View, WebView } from 'react-native'

import Styles from '../../style/Styles'

import { connect } from 'react-redux'

class AdminHomeScreen extends Component {
    static KEY = 'AdminHomeScreen'

    render() {
        const { charts } = this.props

        return (
            <View style={Styles.rootContainer}>
                <View style={{ height: 250, width: '100%' }}>
                    <WebView
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        source={{ html: `${charts[0].embed}` }}
                        useWebKit={true}
                        style={{ backgroundColor: 'black' }}
                    />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    charts: state.ministry.charts
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(AdminHomeScreen)