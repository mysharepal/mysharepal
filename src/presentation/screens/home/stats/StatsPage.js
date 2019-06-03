import React, { Component } from 'react'

import StatsPageConnect from './StatsPageConnect'

import { withNavigation } from 'react-navigation';

import renderStatsContent from './StatsPageRenderer';
import { StatsStatus } from '../../../redux/Stats';

class StatsPage extends Component {
    componentDidMount = () => {
        if (this.props.stats.status == StatsStatus.NOT_READY) {
            // Fetch stats
            this.props.fetch(this.props.accountData)
        }
    }

    render = () => renderStatsContent(this.props.stats)
}

// Wrap the component in 'withNavigation' so that navigation can be used, then redux-connect it
export default StatsPageConnect.connect(withNavigation(StatsPage))