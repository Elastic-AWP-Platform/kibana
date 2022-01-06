/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 *2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, {
  useMemo,
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
  MouseEvent,
  useCallback,
} from 'react';
import { EuiButton, EuiIcon } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { Process } from '../../../common/types/process_tree';
import { useStyles, ButtonType } from './styles';
import { ProcessTreeAlerts } from '../ProcessTreeAlerts';
// import { useWindowingDispatch } from '../SessionViewPageWindowing/contexts';

interface ProcessDeps {
  process: Process;
  isSessionLeader?: boolean;
  isOrphan?: boolean;
  depth?: number;
  onProcessSelected?: (process: Process) => void;
  onToggleChild?: (process: Process) => void;
  onToggleAlerts?: (process: Process) => void;
}

/**
 * Renders a node on the process tree
 * TODO: as well as sections for tty output, alerts and file redirection.
 */
export function ProcessTreeNode({
  process,
  isSessionLeader = false,
  isOrphan,
  depth = 0,
  onProcessSelected,
  onToggleChild,
  onToggleAlerts,
}: ProcessDeps) {
  const textRef = useRef<HTMLSpanElement>(null);

  const { searchMatched } = process;
  // const dispatch = useWindowingDispatch();

  const processDetails = useMemo(() => {
    return process.getDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process.id]);

  const hasExec = useMemo(() => {
    return process.hasExec();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process.id]);

  const alerts = useMemo(() => {
    return process.getAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process.id]);

  const styles = useStyles({ depth, hasAlerts: !!alerts.length, isSessionLeader });

  useLayoutEffect(() => {
    if (searchMatched !== null && textRef.current) {
      const regex = new RegExp(searchMatched);

      const text = textRef.current.innerText;
      const html = text.replace(regex, (match) => {
        return `<span style="${styles.searchHighlight}">${match}</span>`;
      });

      // eslint-disable-next-line no-unsanitized/property
      textRef.current.innerHTML = html;
    }
  }, [searchMatched, styles.searchHighlight]);

  if (!processDetails) {
    return null;
  }

  const { interactive } = processDetails.process;

  const renderChildren = () => {
    const { children, expanded } = process;

    if (isSessionLeader || !expanded || !children || children.length === 0) {
      return;
    }

    const newDepth = depth + 1;

    return (
      <div css={styles.children}>
        {children.map((child: Process) => {
          return (
            <ProcessTreeNode
              key={child.id}
              process={child}
              depth={newDepth}
              onProcessSelected={onProcessSelected}
              onToggleChild={onToggleChild}
              onToggleAlerts={onToggleAlerts}
            />
          );
        })}
      </div>
    );
  };

  const getExpandedIcon = (expanded: boolean) => {
    return expanded ? 'arrowUp' : 'arrowDown';
  };

  const onChildButtonClick = () => {
    if (onToggleChild) {
      onToggleChild(process);
    }
  };

  const onAlertButtonClick = () => {
    if (onToggleAlerts) {
      onToggleAlerts(process);
    }
  };

  const renderButtons = () => {
    const { children, expanded, alertsExpanded } = process;
    const buttons = [];

    if (!isSessionLeader && children.length > 0) {
      buttons.push(
        <EuiButton
          key="child-processes-button"
          css={styles.getButtonStyle(ButtonType.children)}
          onClick={onChildButtonClick}
          data-test-subj="processTreeNodeChildProcessesButton"
        >
          <FormattedMessage
            id="xpack.sessionView.childProcesses"
            defaultMessage="Child processes"
          />
          <EuiIcon css={styles.buttonArrow} size="s" type={getExpandedIcon(expanded)} />
        </EuiButton>
      );
    }

    if (alerts.length) {
      buttons.push(
        <EuiButton
          key="alert-button"
          css={styles.getButtonStyle(ButtonType.alerts)}
          onClick={onAlertButtonClick}
          data-test-subj="processTreeNodeAlertButton"
        >
          <FormattedMessage id="xpack.sessionView.alerts" defaultMessage="Alerts" />
          <EuiIcon css={styles.buttonArrow} size="s" type={getExpandedIcon(alertsExpanded)} />
        </EuiButton>
      );
    }

    return buttons;
  };

  const renderSessionLeader = () => {
    const { name, executable, user } = process.getDetails().process;
    const sessionIcon = interactive ? 'consoleApp' : 'compute';

    return (
      <>
        <EuiIcon type={sessionIcon} /> <b css={styles.darkText}>{name || executable}</b>
        &nbsp;
        <FormattedMessage id="xpack.sessionView.startedBy" defaultMessage="started by" />
        &nbsp;
        <EuiIcon type="user" /> <b css={styles.darkText}>{user.name}</b>
      </>
    );
  };

  // TODO: not customizable for now (cmd previously offered a template string to render)
  const template = () => {
    const {
      args,
      executable,
      working_directory: workingDirectory,
      exit_code: exitCode,
    } = process.getDetails().process;
    if (hasExec) {
      return (
        <span ref={textRef}>
          <span css={styles.workingDir}>{workingDirectory}</span>&nbsp;
          <span css={styles.darkText}>{args[0]}</span>&nbsp;
          {args.slice(1).join(' ')}
          {exitCode && <small> [exit_code: {exitCode}]</small>}
        </span>
      );
    } else {
      return (
        <span ref={textRef}>
          <span css={styles.darkText}>{executable}</span>&nbsp;
        </span>
      );
    }
  };

  const renderProcess = () => {
    return (
      <span>
        {process.isUserEntered() && (
          <EuiIcon
            data-test-subj="processTreeNodeUserIcon"
            css={styles.userEnteredIcon}
            type="user"
          />
        )}
        {hasExec ? (
          <EuiIcon data-test-subj="processTreeNodeExecIcon" type="console" />
        ) : (
          <EuiIcon type="branch" />
        )}
        {template()}
        {isOrphan ? '(orphaned)' : ''}
      </span>
    );
  };

  const renderRootEscalation = () => {
    const { user, parent } = processDetails.process;

    if (user.name === 'root' && user.id !== parent.user.id) {
      return (
        <EuiButton
          data-test-subj="processTreeNodeRootEscalationFlag"
          css={styles.getButtonStyle(ButtonType.userChanged)}
        >
          <FormattedMessage
            id="xpack.sessionView.execUserChange"
            defaultMessage="Root escalation"
          />
        </EuiButton>
      );
    }
  };

  const onProcessClicked = (e: MouseEvent) => {
    e.stopPropagation();

    const selection = window.getSelection();

    // do not select the command if the user was just selecting text for copy.
    if (selection && selection.type === 'Range') {
      return;
    }

    onProcessSelected?.(process);
  };

  const { id, alertsExpanded, expanded } = process;

  return (
    <>
      <div
        data-id={id}
        key={id + searchMatched}
        css={styles.processNode}
        data-test-subj="processTreeNode"
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div data-test-subj="processTreeNodeRow" css={styles.wrapper} onClick={onProcessClicked}>
          {isSessionLeader ? renderSessionLeader() : renderProcess()}
          {renderRootEscalation()}
          {renderButtons()}
        </div>
      </div>
      {alertsExpanded && <ProcessTreeAlerts alerts={alerts} />}
      {expanded && renderChildren()}
    </>
  );
}
