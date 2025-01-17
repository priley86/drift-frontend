import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TextInput } from '@patternfly/react-core';
import PropTypes from 'prop-types';

import { compareActions } from '../../modules';

export class SearchBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <TextInput
                    placeholder="Filter by Fact"
                    value={ this.props.factFilter }
                    onChange={ this.props.changeFactFilter }
                    aria-label="filter by fact"
                />
            </React.Fragment>
        );
    }
}

SearchBar.propTypes = {
    factFilter: PropTypes.string,
    changeFactFilter: PropTypes.func
};

function mapStateToProps(state) {
    return {
        factFilter: state.compareState.factFilter
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeFactFilter: (value) => dispatch(compareActions.filterByFact(value))
    };
}

export default (connect(mapStateToProps, mapDispatchToProps)(SearchBar));
