/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { AutoSizer, InfiniteLoader, List, defaultTableRowRenderer } from 'react-virtualized';
import { ProcessTreeNode } from '../ProcessTreeNodeWindowing';
import { useProcessTree } from './hooks';
import { ProcessEvent, Process } from '../../../common/types/process_tree';
import { useScroll } from '../../hooks/use_scroll';
import { useStyles } from './styles';
import { useWindowingState } from '../SessionViewPageWindowing/contexts';
// import { useWindowing } from '../SessionViewPageWindowing/contexts';

interface ProcessTreeDeps {
  // process.entity_id to act as root node (typically a session (or entry session) leader).
  sessionEntityId: string;

  // bi-directional paging support. allows us to load
  // processes before and after a particular process.entity_id
  // implementation in-complete. see hooks.js
  forward: ProcessEvent[]; // load next
  backward?: ProcessEvent[]; // load previous

  // plain text search query (only searches "process.working_directory process.args.join(' ')"
  searchQuery?: string;

  // currently selected process
  selectedProcess?: Process | null;
  onProcessSelected?: (process: Process) => void;
  hideOrphans?: boolean;
}

// const extractProcessCount = (process: Process): number => {
//   let count = 0;
//   if (process.getDetails()) {
//     if (process.children.length > 0) {
//       for (const proc of process.children) {
//         count += extractProcessCount(proc);
//       }
//     }

//     return count + 1;
//   }

//   return count;
// };

export const ProcessTree = ({
  sessionEntityId,
  forward,
  backward,
  searchQuery,
  selectedProcess,
  onProcessSelected,
  hideOrphans = true,
}: ProcessTreeDeps) => {
  const [, updateState] = useState<object>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const styles = useStyles();

  const windowingState = useWindowingState();

  const { sessionLeader, orphans, flattenedLeader } = useProcessTree({
    sessionEntityId,
    forward,
    backward,
    searchQuery,
  });

  // const processList = extractProcessCount(sessionLeader);

  // console.log(processList);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectionAreaRef = useRef<HTMLDivElement>(null);

  useScroll({
    div: scrollerRef.current,
    handler: (pos: number, endReached: boolean) => {
      if (endReached) {
        // eslint-disable-next-line no-console
        console.log('end reached');
        // TODO: call load more
      }

      // eslint-disable-next-line no-console
      console.log(pos);
    },
  });

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

      const container = processEl.parentElement;

      if (container) {
        const cTop = container.scrollTop;
        const cBottom = cTop + container.clientHeight;

        const eTop = processEl.offsetTop;
        const eBottom = eTop + processEl.clientHeight;
        const isVisible = eTop >= cTop && eBottom <= cBottom;

        if (!isVisible) {
          processEl.scrollIntoView();
        }
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (selectedProcess) {
      selectProcess(selectedProcess);
    }
  }, [selectedProcess, selectProcess]);

  // TODO: bubble the results up to parent component session_view, and show results navigation
  // navigating should

  const renderOrphans = () => {
    if (!hideOrphans) {
      return orphans.map((process) => {
        return (
          <ProcessTreeNode
            key={process.id}
            isOrphan
            process={process}
            onProcessSelected={onProcessSelected}
          />
        );
      });
    }
  };

  const toggleProcessChildComponent = (process: Process) => {
    process.expanded = !process.expanded;
    forceUpdate();
  };

  const toggleProcessAlerts = (process: Process) => {
    process.alertsExpanded = !process.alertsExpanded;
    forceUpdate();
  };

  if (windowingState && flattenedLeader.length > 0) {
    return (
      <div ref={scrollerRef} css={styles.scroller} data-test-subj="sessionViewProcessTree">
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref="ProcessTreeList"
              height={height}
              // onRowsRendered={onRowsRendered}
              rowCount={flattenedLeader.length}
              rowHeight={({ index }) => {
                // console.log(flattenedLeader[index].alertsExpanded)
                return flattenedLeader[index].getHeight(
                  flattenedLeader[index].id === sessionEntityId
                );
              }}
              overscanRowCount={2}
              rowRenderer={({ index }) => {
                return index === 0 ? (
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
                );
              }}
              width={width}
            />
          )}
          {/* {sessionLeader && (
            <ProcessTreeNode
              isSessionLeader
              process={sessionLeader}
              onProcessSelected={onProcessSelected}
            />
          )}
          {renderOrphans()}
   */}
        </AutoSizer>
        <div ref={selectionAreaRef} css={styles.selectionArea} />
      </div>
    );
  }

  return (
    <div ref={scrollerRef} css={styles.scroller} data-test-subj="sessionViewProcessTree">
      {sessionLeader && (
        <ProcessTreeNode
          isSessionLeader
          process={sessionLeader}
          onProcessSelected={onProcessSelected}
        />
      )}
      {renderOrphans()}
      <div ref={selectionAreaRef} css={styles.selectionArea} />
    </div>
  );
};
