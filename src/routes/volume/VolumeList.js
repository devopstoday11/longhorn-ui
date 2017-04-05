import React, { PropTypes } from 'react'
import { Table } from 'antd'
import { DropOption } from '../../components'
import { Link } from 'dva/router'
import { formatMib } from '../../utils/formater'

function list({ loading, dataSource, showAttachHost, showRecurring, showSnapshots }) {
  const handleMenuClick = (event) => {
    if (event.key === '2') {
      showAttachHost()
    } else if (event.key === '6') {
      showRecurring()
    } else if (event.key === '4') {
      showSnapshots()
    }
  }
  const columns = [
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      className: 'active',
      render: (text) => {
        return (
          <div>
            {text.hyphenToHump()}
          </div>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      render: (text) => {
        return (
          <div>
            <Link to={`/volume/${text}`}>
              {text}
            </Link>
          </div>
        )
      },
    }, {
      title: 'Host',
      dataIndex: 'hostId',
      key: 'hostId',
    }, {
      title: 'External Id',
      dataIndex: 'externalId',
      key: 'externalId',
    }, {
      title: 'Frontend',
      dataIndex: 'frontEnd',
      key: 'frontEnd',
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: () => {
        return (
          <DropOption menuOptions={[
            { key: '1', name: 'Delete' },
            { key: '2', name: 'Attach' },
            { key: '3', name: 'Detach' },
            { key: '4', name: 'Snapshots' },
            { key: '5', name: 'Backups' },
            { key: '6', name: 'Recurring Snapshot and Backup' },
          ]} onMenuClick={handleMenuClick}
          />
        )
      },
    },
  ]

  const pagination = false

  return (
    <div>
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.id}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  showAttachHost: PropTypes.func,
  showRecurring: PropTypes.func,
  showSnapshots: PropTypes.func,
}

export default list
