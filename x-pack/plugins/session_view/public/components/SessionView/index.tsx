/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState, ComponentType } from 'react';
import {
  EuiEmptyPrompt,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiResizableContainer,
} from '@elastic/eui';
import { EuiResizableButtonProps } from '@elastic/eui/src/components/resizable_container/resizable_button';
import { EuiResizablePanelProps } from '@elastic/eui/src/components/resizable_container/resizable_panel';
import { FormattedMessage } from '@kbn/i18n-react';
import { SectionLoading } from '../../shared_imports';
import { ProcessTree } from '../ProcessTree';
import { Process, ProcessEvent } from '../../../common/types/process_tree';
import { SessionViewDetailPanel } from '../SessionViewDetailPanel';
import { SessionViewSearchBar } from '../SessionViewSearchBar';
import { useStyles } from './styles';
import { useFetchSessionViewProcessEvents } from './hooks';

interface SessionViewDeps {
  // the root node of the process tree to render. e.g process.entry.entity_id or process.session_leader.entity_id
  sessionEntityId: string;
  height?: number;
  jumpToEvent?: ProcessEvent;
}

/**
 * The main wrapper component for the session view.
 */
export const SessionView = ({ sessionEntityId, height, jumpToEvent }: SessionViewDeps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  const styles = useStyles({ height });

  const onProcessSelected = (process: Process) => {
    setSelectedProcess(process);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Process[] | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    fetchPreviousPage,
    hasPreviousPage,
  } = useFetchSessionViewProcessEvents(sessionEntityId, jumpToEvent);

  const hasData = data && data.pages.length > 0 && data.pages[0].events.length > 0;
  const renderNoData = () => {
    return (
      <EuiEmptyPrompt
        data-test-subj="sessionViewProcessEventsEmpty"
        title={
          <h2>
            <FormattedMessage
              id="xpack.sessionView.emptyDataMessage"
              defaultMessage="No data to render"
            />
          </h2>
        }
        body={<p>No process events found for this query.</p>}
      />
    );
  };

  const renderProcessTree = () => {
    // we only show this loader on initial load
    // otherwise as more pages are loaded it renders to full component
    if (isFetching && !data) {
      return (
        <SectionLoading>
          <FormattedMessage
            id="xpack.sessionView.loadingProcessTree"
            defaultMessage="Loading session…"
          />
        </SectionLoading>
      );
    }
    if (error) {
      return (
        <EuiEmptyPrompt
          iconType="alert"
          color="danger"
          title={
            <h2>
              <FormattedMessage
                id="xpack.sessionView.errorHeading"
                defaultMessage="Error loading Session View"
              />
            </h2>
          }
          body={
            <p>
              <FormattedMessage
                id="xpack.sessionView.errorMessage"
                defaultMessage="There was an error loading the Session View."
              />
            </p>
          }
        />
      );
    }
    if (hasData) {
      return (
        <div css={styles.processTree}>
          <ProcessTree
            sessionEntityId={sessionEntityId}
            data={data.pages}
            searchQuery={searchQuery}
            selectedProcess={selectedProcess}
            onProcessSelected={onProcessSelected}
            jumpToEvent={jumpToEvent}
            isFetching={isFetching}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            fetchPreviousPage={fetchPreviousPage}
            setSearchResults={setSearchResults}
          />
        </div>
      );
    }
  };

  const renderSessionViewDetailPanel = (
    EuiResizableButton: ComponentType<EuiResizableButtonProps>,
    EuiResizablePanel: ComponentType<EuiResizablePanelProps>
  ) => {
    if (isDetailOpen) {
      return (
        <>
          <EuiResizableButton />

          <EuiResizablePanel
            id="session-detail-panel"
            initialSize={30}
            minSize="200px"
            paddingSize="none"
            css={styles.detailPanel}
          >
            <SessionViewDetailPanel
              selectedProcess={selectedProcess}
              onProcessSelected={onProcessSelected}
            />
          </EuiResizablePanel>
        </>
      );
    }

    return <></>;
  };

  const toggleDetailPanel = () => {
    setIsDetailOpen(!isDetailOpen);
  };

  if (!isFetching && !hasData) {
    return renderNoData();
  }

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem data-test-subj="sessionViewProcessEventsSearch" css={{ position: 'relative' }}>
          <SessionViewSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSelectedProcess={setSelectedProcess}
            searchResults={searchResults}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={toggleDetailPanel}
            iconType="list"
            fill
            data-test-subj="sessionViewDetailPanelToggle"
          >
            <FormattedMessage
              id="xpack.sessionView.buttonOpenDetailPanel"
              defaultMessage="Detail panel"
            />
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiResizableContainer>
        {(EuiResizablePanel, EuiResizableButton, { togglePanel }) => (
          <>
            <EuiResizablePanel
              initialSize={isDetailOpen ? 70 : 100}
              minSize="600px"
              paddingSize="none"
            >
              {renderProcessTree()}
            </EuiResizablePanel>

            {renderSessionViewDetailPanel(EuiResizableButton, EuiResizablePanel)}
          </>
        )}
      </EuiResizableContainer>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export { SessionView as default };
