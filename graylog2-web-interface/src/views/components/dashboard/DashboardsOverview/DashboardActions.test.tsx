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

import { render, waitFor, screen } from 'wrappedTestingLibrary';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { PluginStore } from 'graylog-web-plugin/plugin';

import { asMock } from 'helpers/mocking';
import { ViewManagementActions } from 'views/stores/ViewManagementStore';
import DashboardActions from 'views/components/dashboard/DashboardsOverview/DashboardActions';
import { simpleView } from 'views/test/ViewFixtures';

jest.mock('views/stores/ViewManagementStore', () => ({
  ViewManagementActions: {
    delete: jest.fn(),
  },
}));

describe('DashboardActions', () => {
  let oldWindowConfirm;

  const simpleDashboard = simpleView();

  const clickDashboardAction = async (action: string) => {
    userEvent.click(await screen.findByRole('button', { name: action }));
  };

  beforeEach(() => {
    oldWindowConfirm = window.confirm;
    window.confirm = jest.fn();
  });

  afterEach(() => {
    window.confirm = oldWindowConfirm;
  });

  it('does not delete dashboard when user clicks cancel', async () => {
    asMock(window.confirm).mockReturnValue(false);

    render(<DashboardActions dashboard={simpleView()} refetchDashboards={() => Promise.resolve()} />);

    await clickDashboardAction('Delete');

    await waitFor(() => expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Foo"?'));

    expect(ViewManagementActions.delete).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'foo' }));
  });

  it('deletes dashboard when user confirms deletion', async () => {
    asMock(window.confirm).mockReturnValue(true);

    render(<DashboardActions dashboard={simpleView()} refetchDashboards={() => Promise.resolve()} />);

    await clickDashboardAction('Delete');

    await waitFor(() => expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Foo"?'));

    expect(ViewManagementActions.delete).toHaveBeenCalledWith(expect.objectContaining({ id: 'foo' }));
  });

  describe('supports dashboard deletion hook', () => {
    const deletingDashboard = jest.fn(() => Promise.resolve(true));

    const plugin = {
      exports: {
        'views.hooks.confirmDeletingDashboard': [deletingDashboard],
      },
    };

    beforeEach(() => {
      PluginStore.register(plugin);
      asMock(ViewManagementActions.delete).mockClear();
      asMock(ViewManagementActions.delete).mockImplementation((view) => Promise.resolve(view));
    });

    afterEach(() => {
      PluginStore.unregister(plugin);
    });

    it('triggers hook when deleting dashboard', async () => {
      render(<DashboardActions dashboard={simpleDashboard} refetchDashboards={() => Promise.resolve()} />);

      await clickDashboardAction('Delete');

      await waitFor(() => expect(ViewManagementActions.delete).toHaveBeenCalledWith(expect.objectContaining({ id: 'foo' })));

      expect(deletingDashboard).toHaveBeenCalledWith(simpleDashboard);
    });

    it('does not delete dashboard when hook returns false', async () => {
      asMock(deletingDashboard).mockResolvedValue(false);

      render(<DashboardActions dashboard={simpleDashboard} refetchDashboards={() => Promise.resolve()} />);

      await clickDashboardAction('Delete');

      await waitFor(() => expect(deletingDashboard).toHaveBeenCalledWith(simpleDashboard));

      expect(ViewManagementActions.delete).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'foo' }));
    });

    it('resorts to default behavior when hook returns `null`', async () => {
      asMock(deletingDashboard).mockReturnValue(null);
      asMock(window.confirm).mockReturnValue(true);

      render(<DashboardActions dashboard={simpleDashboard} refetchDashboards={() => Promise.resolve()} />);

      await clickDashboardAction('Delete');

      await waitFor(() => expect(deletingDashboard).toHaveBeenCalledWith(simpleDashboard));

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Foo"?');

      expect(ViewManagementActions.delete).toHaveBeenCalledWith(expect.objectContaining({ id: 'foo' }));
    });

    it('resorts to default behavior when hook throws error', async () => {
      const error = Error('Boom!');
      asMock(deletingDashboard).mockImplementation(() => { throw error; });
      asMock(window.confirm).mockReturnValue(true);

      render(<DashboardActions dashboard={simpleDashboard} refetchDashboards={() => Promise.resolve()} />);

      /* eslint-disable no-console */
      const oldConsoleTrace = console.trace;
      console.trace = jest.fn();

      await clickDashboardAction('Delete');

      await waitFor(() => expect(console.trace).toHaveBeenCalledWith('Exception occurred in deletion confirmation hook: ', error));
      console.trace = oldConsoleTrace;
      /* eslint-enable no-console */

      await waitFor(() => expect(deletingDashboard).toHaveBeenCalledWith(simpleDashboard));

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Foo"?');

      expect(ViewManagementActions.delete).toHaveBeenCalledWith(expect.objectContaining({ id: 'foo' }));
    });
  });
});
