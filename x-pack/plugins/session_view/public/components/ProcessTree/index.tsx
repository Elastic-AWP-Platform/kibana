/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useRef, useEffect, useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { EuiButton } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { ProcessTreeNode } from '../ProcessTreeNode';
import { useProcessTree } from './hooks';
import { Process, ProcessEventsPage, ProcessEvent } from '../../../common/types/process_tree';
import { useStyles } from './styles';

type FetchFunction = () => void;

interface ProcessTreeDeps {
  // process.entity_id to act as root node (typically a session (or entry session) leader).
  sessionEntityId: string;

  data: ProcessEventsPage[];

  jumpToEvent?: ProcessEvent;
  isFetching: boolean;
  hasNextPage: boolean | undefined;
  hasPreviousPage: boolean | undefined;
  fetchNextPage: FetchFunction;
  fetchPreviousPage: FetchFunction;

  // plain text search query (only searches "process.working_directory process.args.join(' ')"
  searchQuery?: string;

  // currently selected process
  selectedProcess?: Process;
  height?: number;
  onProcessSelected?: (process: Process) => void;
}

export const ProcessTree = ({
  sessionEntityId,
  data,
  jumpToEvent,
  isFetching,
  hasNextPage,
  hasPreviousPage,
  fetchNextPage,
  fetchPreviousPage,
  searchQuery,
  selectedProcess,
  onProcessSelected,
  height = 500,
}: ProcessTreeDeps) => {
  const styles = useStyles();

  const windowingListRef = useRef<List>(null);

  const [showGroupLeadersOnly, setShowGroupLeadersOnly] = useState(true);

  const { sessionLeader, processMap, getFlattenedLeader } = useProcessTree({
    sessionEntityId,
    data,
    searchQuery,
  });

  const flattenedLeader = getFlattenedLeader(showGroupLeadersOnly);

  useEffect(() => {
    // after 2 pages are loaded (due to bi-directional jump to), auto select the process
    // for the jumpToEvent
    if (jumpToEvent && data.length === 2) {
      const process = processMap[jumpToEvent.process.entity_id];

      if (process) {
        onProcessSelected?.(process);
        windowingListRef.current?.scrollToRow(
          flattenedLeader.findIndex((p) => p.id === jumpToEvent.process.entity_id)
        );
      }
    }
  }, [jumpToEvent, processMap, onProcessSelected, data, flattenedLeader]);

  // auto selects the session leader process if no selection is made yet
  useEffect(() => {
    if (!selectedProcess && onProcessSelected) {
      onProcessSelected(sessionLeader);
    }
  }, [sessionLeader, onProcessSelected, selectedProcess]);

  const toggleProcessChildComponent = (process: Process) => {
    process.expanded = !process.expanded;
    windowingListRef.current?.recomputeRowHeights();
    windowingListRef.current?.forceUpdate();
  };

  const toggleProcessAlerts = (process: Process) => {
    process.alertsExpanded = !process.alertsExpanded;
    windowingListRef.current?.recomputeRowHeights();
    windowingListRef.current?.forceUpdate();
  };

  const toggleGroupLeadersOnly = () => {
    setShowGroupLeadersOnly(!showGroupLeadersOnly);
  };

  function renderLoadMoreButton(text: JSX.Element, func: FetchFunction) {
    return (
      <EuiButton fullWidth onClick={() => func()} isLoading={isFetching}>
        {text}
      </EuiButton>
    );
  }

  const renderWindowedProcessTree = (reduceHeightPrev: number, reduceHeightNext: number) => {
    return (
      <div css={styles.scroller} data-test-subj="sessionViewProcessTree">
        <AutoSizer>
          {({ width }) => (
            <List
              scrollToAlignment="center"
              onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
                const endReached = scrollTop + clientHeight > scrollHeight - 100;
                if (!isFetching && endReached) {
                  fetchNextPage();
                }
              }}
              ref={windowingListRef}
              height={height - reduceHeightPrev - reduceHeightNext}
              rowCount={flattenedLeader.length}
              rowHeight={({ index }) =>
                flattenedLeader[index].getHeight(flattenedLeader[index].id === sessionEntityId)
              }
              rowRenderer={({ index, style }) => {
                return (
                  <div style={style}>
                    {index === 0 ? (
                      <ProcessTreeNode
                        isSessionLeader
                        process={sessionLeader}
                        onProcessSelected={onProcessSelected}
                        onToggleChild={toggleProcessChildComponent}
                        onToggleAlerts={toggleProcessAlerts}
                        onToggleGroupLeadersOnly={toggleGroupLeadersOnly}
                        showGroupLeadersOnly={showGroupLeadersOnly}
                        selectedProcess={selectedProcess}
                      />
                    ) : (
                      <ProcessTreeNode
                        process={flattenedLeader[index]}
                        onProcessSelected={onProcessSelected}
                        depth={1}
                        onToggleChild={toggleProcessChildComponent}
                        onToggleAlerts={toggleProcessAlerts}
                        selectedProcess={selectedProcess}
                      />
                    )}
                  </div>
                );
              }}
              width={width || 800}
            />
          )}
        </AutoSizer>
      </div>
    );
  };

  return (
    <div css={styles.scroller}>
      {hasPreviousPage &&
        renderLoadMoreButton(
          <FormattedMessage id="xpack.sessionView.loadPrevious" defaultMessage="Load previous" />,
          fetchPreviousPage
        )}
      {flattenedLeader.length > 0 &&
        renderWindowedProcessTree(hasPreviousPage ? 40 : 0, hasNextPage ? 40 : 0)}
      {hasNextPage &&
        renderLoadMoreButton(
          <FormattedMessage id="xpack.sessionView.loadNext" defaultMessage="Load next" />,
          fetchNextPage
        )}
    </div>
  );
};
