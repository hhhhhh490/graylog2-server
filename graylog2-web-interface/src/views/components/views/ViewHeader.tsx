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

import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';

import { Link } from 'components/common/router';
import { useStore } from 'stores/connect';
import { ViewStore } from 'views/stores/ViewStore';
import { Icon } from 'components/common';
import { Row } from 'components/bootstrap';
import ViewPropertiesModal from 'views/components/dashboard/DashboardPropertiesModal';
import onSaveView from 'views/logic/views/OnSaveViewAction';
import View from 'views/logic/views/View';
import Routes from 'routing/Routes';
import viewTitle from 'views/logic/views/ViewTitle';

const links = {
  [View.Type.Dashboard]: {
    link: Routes.DASHBOARDS,
    label: 'Dashboards',
  },
  [View.Type.Search]: {
    link: Routes.SEARCH,
    label: 'Search',
  },
};

const Content = styled.div(({ theme }) => css`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: ${theme.spacings.xs};
  gap: 4px;
`);

const EditButton = styled.div(({ theme }) => css`
  color: ${theme.colors.gray[60]};
  font-size: ${theme.fonts.size.tiny};
  cursor: pointer;
`);

const TitleWrapper = styled.span`
  display: flex;
  gap: 4px;
  align-items: center;

  & ${EditButton} {
    display: none;
  }

  &:hover ${EditButton} {
    display: block;
  }
`;

const StyledIcon = styled(Icon)`
font-size: 0.50rem;
`;

const ViewHeader = () => {
  const { view } = useStore(ViewStore);
  const isSavedView = view?.id && view?.title;
  const [showMetadataEdit, setShowMetadataEdit] = useState<boolean>(false);
  const toggleMetadataEdit = useCallback(() => setShowMetadataEdit((cur) => !cur), [setShowMetadataEdit]);

  const typeText = view.type.toLocaleLowerCase();
  const title = viewTitle(view.title, view.type);

  return (
    <Row>
      <Content>
        <Link to={links[view.type].link}>
          {links[view.type].label}
        </Link>
        <StyledIcon name="chevron-right" />
        <TitleWrapper>
          <span>{title}</span>
          {isSavedView && (
          <EditButton onClick={toggleMetadataEdit}
                      role="button"
                      title={`Edit ${typeText} ${view.title} metadata`}
                      tabIndex={0}>
            <Icon name="pen-to-square" />
          </EditButton>
          )}
        </TitleWrapper>
        {showMetadataEdit && (
        <ViewPropertiesModal show
                             view={view}
                             title={`Editing saved ${typeText}`}
                             onClose={toggleMetadataEdit}
                             onSave={onSaveView}
                             submitButtonText={`Save ${typeText}`} />
        )}
      </Content>
    </Row>
  );
};

export default ViewHeader;
