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
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiResizableContainer,
  EuiPopover,
  EuiSelectable,
  EuiPopoverTitle,
  EuiPanel,
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
import { METRIC_TYPE } from '@kbn/analytics';
import { IDataPluginServices } from '../../../../../../src/plugins/data/public';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import { UsageCollectionSetup } from 'src/plugins/usage_collection/target/types/public/plugin';

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

  const [isFilterToggleOpen, setFilterToggleOpen] = useState(false)

  const kibana = useKibana<IDataPluginServices>();
  const { appName="session_view_proto", usageCollection } = kibana.services;

  const reportUiCounter = usageCollection?.reportUiCounter(appName, METRIC_TYPE.CLICK, 'TEST A5');

  console.log(kibana)

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
        title={<h2>No data to render</h2>}
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
          title={<h2>Error loading Session View</h2>}
          body={<p>There was an error loading the Session View.</p>}
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

  const renderFilterToggleDropDown = () => {
    return(
      <>
        <EuiPopover
          button={FilterButton}
          isOpen={isFilterToggleOpen}
          closePopover={closeFilterButton}
        >
          <EuiSelectable 
            options={options}
            onChange={newOptions => setOptions(newOptions)}>
            {(list) => (
              <div style={{width:240}}>
              <EuiPopoverTitle>TEST TITLE</EuiPopoverTitle>
              {list}
              </div>
            )}
          </EuiSelectable>
        </EuiPopover>
      </>
    )
  }

  const toggleDetailPanel = () => {
    setIsDetailOpen(!isDetailOpen);
    reportUiCounter();
  };

  const toggleFilterButton =() => {
    setFilterToggleOpen(!isFilterToggleOpen)
  }

  const closeFilterButton =() =>{
    //reportUiCounter();
    setFilterToggleOpen(false)
  }

  if (!isFetching && !hasData) {
    return renderNoData();
  }

  const FilterButton = (
    <EuiFlexItem grow={false}>
     <EuiButtonIcon
       iconType="filter"
       display="base"
       onClick={toggleFilterButton}
       size="m"
     />
    </EuiFlexItem>
  ) 

  const optionsList = [
        {
          label: 'Filter A',
        },
        {
          label: 'Filter B',
        },
        {
          label: 'Filter C',
        }
  ]

  const [options, setOptions] = useState(optionsList)

  return (
    <>
    <EuiPanel color={"subdued"}>
      <EuiFlexGroup>
        <EuiFlexItem data-test-subj="sessionViewProcessEventsSearch">
          <SessionViewSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSelectedProcess={setSelectedProcess}
            searchResults={searchResults}
          />
        </EuiFlexItem>

      <EuiFlexItem grow={false} data-test-subj="sessionViewFilterButton">
        {renderFilterToggleDropDown()}
      </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={toggleDetailPanel}
            iconType="list"
            
            data-test-subj="sessionViewDetailPanelToggle"
          >
            <FormattedMessage
              id="xpack.sessionView.buttonOpenDetailPanel"
              defaultMessage="Detail panel"
            />
          
          </EuiButton>
        </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
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
