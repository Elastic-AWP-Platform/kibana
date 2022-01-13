/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { EuiButton } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { ProcessTreeNode } from '../ProcessTreeNode';
import { useProcessTree } from './hooks';
import { Process, ProcessEventsPage, ProcessEvent } from '../../../common/types/process_tree';
import { useScroll } from '../../hooks/use_scroll';
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
  selectedProcess?: Process | null;
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

  const { sessionLeader, processMap, orphans, flattenedLeader, searchResults } = useProcessTree({
    sessionEntityId,
    data,
    searchQuery,
  });

  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectionAreaRef = useRef<HTMLDivElement>(null);

  // useScroll({
  //   div: windowingListRef.current,
  //   handler: (pos: number, endReached: boolean) => {
  //     if (!isFetching && endReached) {
  //       fetchNextPage();
  //     }
  //   },
  // });

  /**
   * highlights a process in the tree
   * we do it this way to avoid state changes on potentially thousands of <Process> components
   */
  const selectProcess = useCallback((process: Process) => {
    if (!selectionAreaRef || !scrollerRef) {
      return;
    }

    if (!selectionAreaRef.current || !scrollerRef.current) {
      return;
    }

    const selectionAreaEl = selectionAreaRef.current;
    selectionAreaEl.style.display = 'block';

    // TODO: concept of alert level unknown wrt to elastic security
    const alertLevel = process.getMaxAlertLevel();

    if (alertLevel && alertLevel >= 0) {
      selectionAreaEl.style.backgroundColor =
        alertLevel > 0 ? 'rgba(229, 115, 115, 0.24)' : '#F2C94C4A';
    } else {
      selectionAreaEl.style.backgroundColor = '';
    }

    // find the DOM element for the command which is selected by id
    const processEl = scrollerRef.current.querySelector<HTMLElement>(`[data-id="${process.id}"]`);

    if (processEl) {
      processEl.prepend(selectionAreaEl);

      const cTop = scrollerRef.current.scrollTop;
      const cBottom = cTop + scrollerRef.current.clientHeight;

      const eTop = processEl.offsetTop;
      const eBottom = eTop + processEl.clientHeight;
      const isVisible = eTop >= cTop && eBottom <= cBottom;

      if (!isVisible) {
        processEl.scrollIntoView({ block: 'center' });
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (selectedProcess) {
      selectProcess(selectedProcess);
    }
  }, [selectedProcess, selectProcess]);

  useEffect(() => {
    if (searchResults.length > 0) {
      selectProcess(searchResults[0]);
    }
  }, [searchResults]);

  useEffect(() => {
    if (jumpToEvent && data.length === 2) {
      const process = processMap[jumpToEvent.process.entity_id];

      if (process) {
        selectProcess(process);
      }
    }
  }, [jumpToEvent, processMap]);

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

  function renderLoadMoreButton(text: JSX.Element, func: FetchFunction) {
    return (
      <EuiButton fullWidth onClick={() => func()} isLoading={isFetching}>
        {text}
      </EuiButton>
    );
  }

  const renderWindowedProcessTree = (reduceHeightPrev: number, reduceHeightNext: number) => {
    return (
      <div ref={scrollerRef} css={styles.scroller} data-test-subj="sessionViewProcessTree">
        <AutoSizer>
          {({ width }) => (
            <List
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
                      />
                    ) : (
                      <ProcessTreeNode
                        process={flattenedLeader[index]}
                        onProcessSelected={onProcessSelected}
                        depth={1}
                        onToggleChild={toggleProcessChildComponent}
                        onToggleAlerts={toggleProcessAlerts}
                      />
                    )}
                  </div>
                );
              }}
              width={width}
            />
          )}
        </AutoSizer>
        <div ref={selectionAreaRef} css={styles.selectionArea} />
      </div>
    );
  };

  return (
    <div ref={scrollerRef} css={styles.scroller} data-test-subj="sessionViewProcessTree">
      {hasPreviousPage &&
        renderLoadMoreButton(
          <FormattedMessage id="xpack.sessionView.loadPrevious" defaultMessage="Load previous" />,
          fetchPreviousPage
        )}
      {flattenedLeader.length > 0 &&
        renderWindowedProcessTree(hasPreviousPage ? 40 : 0, hasNextPage ? 40 : 0)}
      <div ref={selectionAreaRef} css={styles.selectionArea} />
      {hasNextPage &&
        renderLoadMoreButton(
          <FormattedMessage id="xpack.sessionView.loadNext" defaultMessage="Load next" />,
          fetchNextPage
        )}
    </div>
  );
};
