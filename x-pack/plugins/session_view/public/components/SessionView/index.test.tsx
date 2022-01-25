/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';
import { ProcessEvent } from '../../../common/types/process_tree';
import {
  sessionViewSessionEntityId,
  sessionViewProcessEventsMock,
  sessionViewJumpToEvent,
} from '../../../common/mocks/responses/session_view_process_events.mock';
import { AppContextTestRender, createAppRootMockRenderer } from '../../test';
import { SessionView } from './index';

describe('SessionView component', () => {
  let render: (props?: any) => ReturnType<AppContextTestRender['render']>;
  let renderResult: ReturnType<typeof render>;
  let mockedContext: AppContextTestRender;
  let mockedApi: AppContextTestRender['coreStart']['http']['get'];

  const waitForApiCall = () => waitFor(() => expect(mockedApi).toHaveBeenCalled());

  beforeEach(() => {
    mockedContext = createAppRootMockRenderer();
    mockedApi = mockedContext.coreStart.http.get;
    render = (props = {}) =>
      (renderResult = mockedContext.render(
        <SessionView sessionEntityId={sessionViewSessionEntityId} {...props} />
      ));
  });

  describe('When SessionView is mounted', () => {
    describe('And no data exists', () => {
      beforeEach(async () => {
        mockedApi.mockResolvedValue({
          events: [],
        });
      });

      it('should show the Empty message', async () => {
        render();
        await waitForApiCall();
        expect(renderResult.getByTestId('sessionViewProcessEventsEmpty')).toBeTruthy();
      });

      it('should not display the search bar', async () => {
        render();
        await waitForApiCall();
        expect(renderResult.queryByTestId('sessionViewProcessEventsSearch')).toBeFalsy();
      });
    });

    describe('And data exists', () => {
      beforeEach(async () => {
        mockedApi.mockResolvedValue(sessionViewProcessEventsMock);
      });

      it('should show loading indicator while retrieving data and hide it when it gets it', async () => {
        let releaseApiResponse: (value?: unknown) => void;

        // make the request wait
        mockedApi.mockReturnValue(new Promise((resolve) => (releaseApiResponse = resolve)));
        render();
        await waitForApiCall();

        // see if loader is present
        expect(renderResult.getByTestId('sectionLoading')).toBeTruthy();

        // release the request
        releaseApiResponse!(mockedApi);

        //  check the loader is gone
        await waitForElementToBeRemoved(renderResult.getByTestId('sectionLoading'));
      });

      it('should display the search bar', async () => {
        render();
        await waitForApiCall();
        expect(renderResult.getByTestId('sessionViewProcessEventsSearch')).toBeTruthy();
      });

      it('should show items on the list', async () => {
        render();
        await waitForApiCall();

        expect(renderResult.getAllByTestId('processTreeNode')).toBeTruthy();
      });

      it('should jump To Event', async () => {
        const jumpToEvent = sessionViewJumpToEvent as unknown as ProcessEvent;

        const sessionView = render({ jumpToEvent });
        await waitForApiCall();
        expect(
          sessionView.getByTestId(`processTreeNodeRow-${jumpToEvent.process.entity_id}`)
        ).toBeInTheDocument();
      });
    });
  });
});
