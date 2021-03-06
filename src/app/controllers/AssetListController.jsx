import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { toastr } from 'react-redux-toastr'
import Fuse from 'fuse.js'
import AssetList from 'Views/AssetList'
import { sortByProperty } from 'Utilities/helpers'

let fuse

class AssetListController extends Component {
  constructor () {
    super()
    this.state = {
      value: '',
      list: [],
      originalList: []
    }
    this._setList = this._setList.bind(this)
    this._handleChange = this._handleChange.bind(this)
    this._handleSubmit = this._handleSubmit.bind(this)
    this._handleSelect = this._handleSelect.bind(this)
  }

  componentWillMount () {
    this._setList(this.props.type)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.type !== nextProps.type) {
      this._setList(nextProps.type)
    }
  }

  _setList (type) {
    const filteredList = this.props.assets.filter((a) => {
      return (!a.onlyShow || a.onlyShow === type)
    })
    // sort by `type`=true (i.e. deposit=true)
    const list = sortByProperty(filteredList, type)
    fuse = new Fuse(list, {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      keys: ['name']
    })
    this.setState({
      value: '',
      list,
      originalList: list
    })
  }

  _handleChange (event) {
    const newValue = event.target.value
    let newList
    if (!newValue) {
      newList = this.state.originalList
    } else {
      newList = sortByProperty(fuse.search(newValue), this.props.type)
    }
    this.setState({
      value: newValue,
      list: newList
    })
  }

  _handleSubmit () {
    const list = this.state.list
    if (this.state.value && list.length) {
      this._handleSelect(list[0])
    }
  }

  _handleSelect (asset) {
    const type = this.props.type
    if (!this.props.ignoreUnavailable && !asset[type]) {
      return toastr.warning('COMING SOON', `${asset.name} is not yet available to ${type}`)
    }
    this.props.selectAsset(asset)
  }

  render () {
    return (
      <AssetList
        type={this.props.type}
        columns={this.props.columns}
        list={this.state.list}
        handleSelect={this._handleSelect}
        ignoreUnavailable={this.props.ignoreUnavailable}
        showBalance={this.props.showBalance}
        searchValue={this.state.value}
        handleSearchChange={this._handleChange}
        handleClose={this.props.handleClose}
        onSubmit={this._handleSubmit}
      />
    )
  }
}

AssetListController.propTypes = {
  type: PropTypes.string,
  columns: PropTypes.number,
  assets: PropTypes.array,
  ignoreUnavailable: PropTypes.bool,
  showBalance: PropTypes.bool,
  handleClose: PropTypes.func
}

export default AssetListController
