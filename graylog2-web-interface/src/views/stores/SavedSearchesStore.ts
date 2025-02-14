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
import Reflux from 'reflux';

import * as URLUtils from 'util/URLUtils';
import { singletonActions, singletonStore } from 'logic/singleton';
import fetch from 'logic/rest/FetchProvider';
import type { RefluxActions } from 'stores/StoreTypes';

import type { PaginatedViews, SortOrder } from './ViewManagementStore';

export type SavedSearchesActionsType = RefluxActions<{
  search: ({
    query,
    page,
    perPage,
    sortBy,
    order,
  }: {
    query?: string,
    page?: number,
    perPage?: number,
    sortBy?: string,
    order?: SortOrder
  }) => Promise<PaginatedViews>,
}>;

const SavedSearchesActions: SavedSearchesActionsType = singletonActions(
  'views.SavedSearches',
  () => Reflux.createActions({
    search: { asyncResult: true },
  }),
);

const savedSearchesUrl = URLUtils.qualifyUrl('/search/saved');

const SavedSearchesStore = singletonStore(
  'views.SavedSearches',
  () => Reflux.createStore({
    listenables: [SavedSearchesActions],

    search({ query = '', page = 1, perPage = 10, sortBy = 'title', order = 'asc' }): Promise<PaginatedViews> {
      const promise = fetch('GET', `${savedSearchesUrl}?query=${query}&page=${page}&per_page=${perPage}&sort=${sortBy}&order=${order}`)
        .then((response) => ({
          list: response.elements,
          pagination: {
            count: response.count,
            page: response.page,
            perPage: response.per_page,
            query: response.query,
            total: response.total,
          },
        }));

      SavedSearchesActions.search.promise(promise);

      return promise;
    },
  }),
);

export { SavedSearchesActions, SavedSearchesStore };
