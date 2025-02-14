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
import * as React from 'react';
import { fireEvent, render, screen } from 'wrappedTestingLibrary';

import FavoriteIcon from 'views/components/FavoriteIcon';
import { asMock } from 'helpers/mocking';
import useFavoriteItemMutation from 'hooks/useFavoriteItemMutation';

jest.mock('hooks/useFavoriteItemMutation');

describe('FavoriteIcon', () => {
  const putItem = jest.fn(() => Promise.resolve());
  const deleteItem = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    asMock(useFavoriteItemMutation).mockReturnValue({ putItem, deleteItem });
  });

  it('has correct state for favorite', async () => {
    render(<FavoriteIcon isFavorite id="111" />);

    const favIcon = await screen.findByTitle('Remove from favorites');
    fireEvent.click(favIcon);

    await expect(deleteItem).toHaveBeenCalledWith('111');
  });

  it('has correct state for non-favorite', async () => {
    render(<FavoriteIcon isFavorite={false} id="111" />);

    const favIcon = await screen.findByTitle('Add to favorites');
    fireEvent.click(favIcon);

    await expect(putItem).toHaveBeenCalledWith('111');
  });
});
