import React from 'react'
import PropTypes from 'prop-types'
import { Tree, Icon, Menu, Dropdown, Button, Tooltip, Progress, Spin, Modal } from 'antd'
import { formatMib } from '../../utils/formater'
import moment from 'moment'
import { disabledSnapshotAction } from '../../routes/volume/helper/index'
import './Snapshot.less'

const TreeNode = Tree.TreeNode

function StartPoint() {
  return (
    <div className="tree-snapshot-start-point">
    </div>
  )
}

function VolumeHead(props) {
  return (
    props ? (<Tooltip placement="right"
      autoAdjustOverflow={false}
      title={<div>
      <p className="snapshot-name">Name: {props.name}</p>
      <p className="snapshot-created">Created: {props.created}</p>
      <p className="snapshot-name">Size: {formatMib(props.size)}</p>
      <p className="snapshot-name">Created By User: {props.usercreated ? 'True' : 'False'}</p>
    </div>}>
    <div className="snapshot-current-desc">
      <Button>
        <Icon type="caret-right" />Volume Head
        </Button>
    </div>
    </Tooltip>) : (<div className="snapshot-current-desc">
        <Button>
          <Icon type="caret-right" />Volume Head
          </Button>
      </div>)
  )
}
VolumeHead.propTypes = {
  removed: PropTypes.bool,
  name: PropTypes.string,
  created: PropTypes.string,
  size: PropTypes.string,
  usercreated: PropTypes.string,
}

function SnapshotIcon(props, snapshotProps) {
  function doAction(key) {
    snapshotProps.onAction({
      type: key,
      payload: {
        volume: snapshotProps.volume,
        snapshot: props,
      },
    })
  }
  function onClick({ key }) {
    if (key === 'snapshotRevert') {
      const title = (
        <div>
          <h3 style={{ margin: 0, padding: 0, marginTop: -2 }}> {!snapshotProps.volume.disableFrontend ? 'Cannot revert with frontend enabled' : 'Confirm snapshot revert?' }</h3>
          {!snapshotProps.volume.disableFrontend ? (<div style={{ marginTop: '15px' }}>
              <p>Please reattach the volume in maintenance mode to revert the volume.</p>
              <p>Workload shutdown might be needed.</p>
            </div>) : ''
          }
        </div>
      )

      Modal.confirm({
        title,
        okText: 'Ok',
        cancelText: 'Cancel',
        onOk: () => {
          doAction('snapshotRevert')
        },
      })
      return
    }
    // Move to normal popup
    // if (key === 'snapshotBackup') {
    //   backupProgressModal(snapshotProps.volume.name)
    // }
    doAction(key)
  }

  const menu = (
    <Menu
      className="lh-snapshot-dropdown"
      onClick={onClick}
    >
      { props.usercreated ? <Menu.Item className="revert-menu-item" key="snapshotRevert">
          {snapshotProps.volume.disableFrontend ? <div>Revert</div> : <Tooltip title={<div>
            <p>Please reattach the volume in maintenance mode to revert the volume.</p>
            <p>Workload shutdown might be needed.</p>
          </div>}><div className="saic-Popconfirm-Revert">Revert</div></Tooltip> }
        </Menu.Item> : ''
      }
      { props.usercreated ? <Menu.Item key="snapshotBackup">
          <div>Backup</div>
        </Menu.Item> : ''
      }
      <Menu.Item key="snapshotDelete">
        <div>Delete</div>
      </Menu.Item>
    </Menu>
  )
  let backupStatusList = snapshotProps.volume.backupStatus
  let backupStatusObject = null

  if (backupStatusList && backupStatusList.length > 0) {
    let backupStatusObjectList = backupStatusList.filter((item) => {
      return item.snapshot === props.name
    })
    if (backupStatusObjectList && backupStatusObjectList.length > 0) {
      let total = 0
      let backupStatusErrorMsg = []
      backupStatusObjectList.forEach((ele) => {
        if (ele.error) {
          backupStatusErrorMsg.push({ replica: ele.replica, error: ele.error })
        }
        total += ele.progress
      })
      backupStatusObject = {}
      backupStatusObject.backupError = backupStatusErrorMsg
      backupStatusObject.progress = Math.floor(total / backupStatusObjectList.length)
      backupStatusObject.snapshot = props.name
      backupStatusObject.replicas = backupStatusObjectList.filter(item => item.replica).map(item => item.replica).join(', ')
      backupStatusObject.backupIds = backupStatusObjectList.filter(item => item.replica).map(item => item.id).join(',')
    }
  }
  let backupStatusErrorMsg = backupStatusObject && backupStatusObject.backupError && backupStatusObject.backupError.length > 0 ? <div>{ backupStatusObject.backupError.map((ele, index) => {
    return <p key={index} className="snapshot-name">{ele.replica ? ele.replica : 'Error'}: {ele.error}</p>
  }) }</div> : ''

  return (
    <Dropdown
      placement="bottomRight"
      overlay={menu}
      trigger={props.removed ? [] : ['click']}
      key={props.name}
    >
      <Tooltip placement="right"
        autoAdjustOverflow={false}
        title={<div>
        <p className="snapshot-name">Name: {props.name}</p>
        <p className="snapshot-created">Created: {props.created}</p>
        <p className="snapshot-name">Size: {formatMib(props.size)}</p>
        <p className="snapshot-name">Created By User: {props.usercreated ? 'True' : 'False'}</p>
        <p className="snapshot-name">Removed: {props.removed ? 'True' : 'False'}</p>
        {
          backupStatusObject ? <div>
            <p className="snapshot-created">Progress: {backupStatusObject.progress}%</p>
           {backupStatusObject.replicas && <p className="snapshot-created" style={{ wordBreak: 'break-all' }}>Replicas: {backupStatusObject.replicas}</p>}
           {backupStatusObject.replicas && <p className="snapshot-created" style={{ wordBreak: 'break-all' }}>Backups: {backupStatusObject.backupIds}</p>}
            {/* <p className="snapshot-created">Backup URL: {backupStatusObject.backupURL}</p> */}
            {backupStatusErrorMsg}</div> : ''
        }
      </div>}>
        <div>
          <div className="tree-snapshot-icon" style={{ background: props.usercreated ? '#3085d5' : 'rgb(241, 196, 15)' }}>
            <Icon className="snapshot-icon" type="camera" />
            { backupStatusObject && backupStatusObject.progress > 0 && backupStatusObject.progress < 100 ? <div style={{ position: 'absolute', background: 'rgba(255,255,255,1)', top: '-5px', left: '-5px' }}>
                <Progress type="circle" percent={backupStatusObject.progress} width={40} />
              </div> : ''
            }
          </div>
          <div className="tree-snapshot-desc">
            <p className="snapshot-name">{props.name.substr(0, 5)}</p>
            <p className="snapshot-time">{moment(new Date(props.created)).fromNow()}</p>
          </div>
        </div>
      </Tooltip>
    </Dropdown>
  )
}
SnapshotIcon.propTypes = {
  removed: PropTypes.bool,
  name: PropTypes.string,
  created: PropTypes.string,
  size: PropTypes.string,
  usercreated: PropTypes.string,
}

function CurrentPoint(props) {
  function onClick() {
    props.onAction({
      type: 'snapshotCreate',
      payload: {
        volume: props.volume,
      },
    })
  }
  const menu = (
    <Menu
      onClick={onClick}
    >
      <Menu.Item key="1" disabled={disabledSnapshotAction(props.volume, props.state)}>
        <span>Take Snapshot</span>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      key={props.volume.id}
    >
    {VolumeHead(props.volumeHead)}
    </Dropdown>
  )
}
CurrentPoint.propTypes = {
  onAction: PropTypes.func,
  volume: PropTypes.object,
  state: PropTypes.bool,
  volumeHead: PropTypes.object,
}

const loop = (data, props) => data.map((item) => {
  let title
  if (item.name) {
    title = SnapshotIcon(item, props)
  } else {
    title = CurrentPoint(props)
    return <TreeNode key={item} title={title} />
  }
  if (item.childrenNode && item.childrenNode.length) {
    return <TreeNode key={item.name} title={title} disabled={item.removed}>{loop(item.childrenNode, props)}</TreeNode>
  }
  return <TreeNode isLeaf key={item.name} title={title} disabled={item.removed} />
})

class Snapshot extends React.Component {
  state = {
    key: Math.random(),
    loadingState: true,
    loading: false,
    previousCreated: '',
  }

  showReomve = () => {
    this.state.key = Math.random()
  }

  render() {
    let props = this.props
    let children = null

    if (props.snapshotTree) {
      children = props.snapshotTree.length > 0 ? loop(props.snapshotTree, props) : <TreeNode key="1" title={CurrentPoint(props)} />
      if (props.loading || this.state.loadingState !== props.loading) {
        this.state.loadingState = props.loading
        this.state.loading = true
        setTimeout(() => {
          this.state.loading = false
          this.state.key = Math.random()
        }, 0)
      }
    } else if (!props.volume.actions.snapshotList) {
      this.state.loading = false
    }

    if (props.volumeHead) {
      if (props.volumeHead.created && props.volumeHead.created !== this.state.previousCreated) {
        this.state.loading = true
        setTimeout(() => {
          this.state.loading = false
          this.state.key = Math.random()
        }, 0)
        this.state.previousCreated = props.volumeHead.created
        // this.setState({
        //   ...this.state,
        //   previousCreated: props.volumeHead.created,
        // })
      }
    }

    return (
      <Spin spinning={this.state.loading}>
        <Tree
          defaultExpandAll
          className="lh-tree-snapshot"
          autoExpandParent={false}
          key={this.state.key}
        >
          <TreeNode className="tree-start-wrap" title={StartPoint()} key={`${props.volume.id}`}>
            {children}
          </TreeNode>
        </Tree>
      </Spin>
    )
  }
}
Snapshot.propTypes = {
  snapshotTree: PropTypes.array,
  loading: PropTypes.bool,
  volume: PropTypes.object,
  state: PropTypes.bool,
  volumeHead: PropTypes.object,
}

export default Snapshot
