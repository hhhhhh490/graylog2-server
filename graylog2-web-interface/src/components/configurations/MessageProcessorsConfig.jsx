/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import PropTypes from 'prop-types';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';

import { defaultCompare as naturalSort } from 'logic/DefaultCompare';
import { Button, Alert, Table } from 'components/bootstrap';
import { IfPermitted, SortableList } from 'components/common';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import ObjectUtils from 'util/ObjectUtils';

const MessageProcessorsConfig = createReactClass({
  // eslint-disable-next-line react/no-unused-class-component-methods
  displayName: 'MessageProcessorsConfig',

  // eslint-disable-next-line react/no-unused-class-component-methods
  propTypes: {
    config: PropTypes.object,
    updateConfig: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        disabled_processors: [],
        processor_order: [],
      },
    };
  },

  getInitialState() {
    const { config } = this.props;

    return {
      config: {
        disabled_processors: config.disabled_processors,
        processor_order: config.processor_order,
      },
      showConfigModal: false,
    };
  },

  inputs: {},

  _openModal() {
    this.setState({ showConfigModal: true });
  },

  _closeModal() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _saveConfig() {
    const { updateConfig } = this.props;
    const { config } = this.state;

    if (!this._hasNoActiveProcessor()) {
      updateConfig(config).then(() => {
        this._closeModal();
      });
    }
  },

  _updateSorting(newSorting) {
    const { config } = this.state;
    const update = ObjectUtils.clone(config);

    update.processor_order = newSorting.map((item) => {
      return { class_name: item.id, name: item.title };
    });

    this.setState({ config: update });
  },

  _toggleStatus(className) {
    return () => {
      const { config } = this.state;
      const disabledProcessors = config.disabled_processors;
      const update = ObjectUtils.clone(config);
      const { checked } = this.inputs[className];

      if (checked) {
        update.disabled_processors = disabledProcessors.filter((p) => p !== className);
      } else if (disabledProcessors.indexOf(className) === -1) {
        update.disabled_processors.push(className);
      }

      this.setState({ config: update });
    };
  },

  _hasNoActiveProcessor() {
    const { config } = this.state;

    return config.disabled_processors.length >= config.processor_order.length;
  },

  _summary() {
    const { config } = this.state;

    return config.processor_order.map((processor, idx) => {
      const status = config.disabled_processors.filter((p) => p === processor.class_name).length > 0 ? 'disabled' : 'active';

      return (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td>{processor.name}</td>
          <td>{status}</td>
        </tr>
      );
    });
  },

  _sortableItems() {
    const { config } = this.state;

    return config.processor_order.map((processor) => {
      return { id: processor.class_name, title: processor.name };
    });
  },

  _statusForm() {
    const { config } = this.state;

    return ObjectUtils.clone(config.processor_order).sort((a, b) => naturalSort(a.name, b.name)).map((processor, idx) => {
      const enabled = config.disabled_processors.filter((p) => p === processor.class_name).length < 1;

      return (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={idx}>
          <td>{processor.name}</td>
          <td>
            <input ref={(elem) => { this.inputs[processor.class_name] = elem; }}
                   type="checkbox"
                   checked={enabled}
                   onChange={this._toggleStatus(processor.class_name)} />
          </td>
        </tr>
      );
    });
  },

  render() {
    return (
      <div>
        <h2>Message Processors Configuration</h2>
        <p>The following message processors are executed in order. Disabled processors will be skipped.</p>

        <Table striped bordered condensed className="top-margin">
          <thead>
            <tr>
              <th>#</th>
              <th>Processor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this._summary()}
          </tbody>
        </Table>

        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>Edit configuration</Button>
        </IfPermitted>

        <BootstrapModalForm show={this.state.showConfigModal}
                            title="Update Message Processors Configuration"
                            onSubmitForm={this._saveConfig}
                            onCancel={this._closeModal}
                            submitButtonText="Update configuration">
          <>
            <h3>Order</h3>
            <p>Use drag and drop to change the execution order of the message processors.</p>
            <SortableList items={this._sortableItems()} onMoveItem={this._updateSorting} displayOverlayInPortal />

            <h3>Status</h3>
            <p>Change the checkboxes to change the status of a message processor.</p>
            <Table striped bordered condensed className="top-margin">
              <thead>
                <tr>
                  <th>Processor</th>
                  <th>Enabled</th>
                </tr>
              </thead>
              <tbody>
                {this._statusForm()}
              </tbody>
            </Table>
            {this._hasNoActiveProcessor() && (
              <Alert bsStyle="danger">
                <strong>ERROR:</strong> No active message processor!
              </Alert>
            )}
          </>
        </BootstrapModalForm>
      </div>
    );
  },
});

export default MessageProcessorsConfig;
