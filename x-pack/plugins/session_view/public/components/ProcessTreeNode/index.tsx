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
import React, { useRef, useLayoutEffect, MouseEvent } from 'react';
import { EuiButton, EuiIcon, EuiToolTip } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { Process } from '../../../common/types/process_tree';
import { useStyles, ButtonType } from './styles';
import { ProcessTreeAlerts } from '../ProcessTreeAlerts';

interface ProcessDeps {
  process: Process;
  isSessionLeader?: boolean;
  depth?: number;
  selectedProcess?: Process;
  showGroupLeadersOnly?: boolean;
  onProcessSelected?: (process: Process) => void;
  onToggleChild?: (process: Process) => void;
  onToggleAlerts?: (process: Process) => void;
  onToggleGroupLeadersOnly?: (process: Process) => void;
}

/**
 * Renders a node on the process tree
 * TODO: as well as sections for tty output, alerts and file redirection.
 */
export function ProcessTreeNode({
  process,
  isSessionLeader = false,
  depth = 0,
  showGroupLeadersOnly = false,
  onProcessSelected,
  onToggleChild,
  onToggleAlerts,
  onToggleGroupLeadersOnly,
  selectedProcess,
}: ProcessDeps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const { searchMatched } = process;
  const processDetails = process.getDetails();

  const hasExec = process.hasExec();

  const alerts = process.getAlerts();

  const hasAlerts = !!alerts.length;
  const isSelected = selectedProcess?.id === process.id;

  const styles = useStyles({ depth, hasAlerts, isSelected, isSessionLeader });

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
  const onToggleGroupLeadersOnlyClick = () => {
    if (onToggleGroupLeadersOnly) {
      onToggleGroupLeadersOnly(process);
    }
  };

  useLayoutEffect(() => {
    if (searchMatched !== null && textRef.current) {
      const regex = new RegExp(searchMatched);
      const text = textRef.current.textContent;

      if (text) {
        const html = text.replace(regex, (match) => {
          return `<span data-test-subj="processNodeSearchHighlight" style="${styles.searchHighlight}">${match}</span>`;
        });

        // eslint-disable-next-line no-unsanitized/property
        textRef.current.innerHTML = html;
      }
    }
  }, [searchMatched, styles.searchHighlight]);

  if (!processDetails?.process) {
    return null;
  }

  const { interactive } = processDetails.process;

  const renderChildren = () => {
    const children = process.getChildren(showGroupLeadersOnly);

    if (isSessionLeader || !expanded || !children || children.length === 0) {
      return;
    }

    const newDepth = depth + 1;

    return (
      <div css={styles.children}>
        <div css={styles.processIdentMarker} />
        {children.map((child: Process) => {
          return (
            <ProcessTreeNode
              key={child.id}
              process={child}
              depth={newDepth}
              onProcessSelected={onProcessSelected}
              onToggleChild={onToggleChild}
              onToggleAlerts={onToggleAlerts}
              selectedProcess={selectedProcess}
            />
          );
        })}
      </div>
    );
  };

  const getExpandedIcon = (expanded: boolean) => {
    return expanded ? 'arrowUp' : 'arrowDown';
  };

  const renderButtons = () => {
    const { expanded, alertsExpanded } = process;

    const buttons = [];
    const childCount = process.getChildren(false).length;

    if (isSessionLeader) {
      const groupLeaderCount = process.getChildren(true).length;
      const sameGroupCount = childCount - groupLeaderCount;

      if (sameGroupCount > 0) {
        buttons.push(
          <EuiToolTip
            key="samePgidTooltip"
            position="top"
            content={
              <p>
                <FormattedMessage
                  id="xpack.sessionView.groupLeaderTooltip"
                  defaultMessage="Hide or show other processes in the same 'process group' (pgid) as the session leader. This typically includes forks from bash builtins, auto completions and other shell startup activity."
                />
              </p>
            }
          >
            <EuiButton
              key="child-processes-button"
              css={styles.getButtonStyle(ButtonType.children)}
              onClick={onToggleGroupLeadersOnlyClick}
              data-test-subj="processTreeNodeChildProcessesButton"
            >
              <FormattedMessage
                id="xpack.sessionView.plusCountMore"
                defaultMessage="+{count} more"
                values={{
                  count: sameGroupCount,
                }}
              />
              <EuiIcon
                css={styles.buttonArrow}
                size="s"
                type={getExpandedIcon(!showGroupLeadersOnly)}
              />
            </EuiButton>
          </EuiToolTip>
        );
      }
    } else if (childCount > 0) {
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
    const { name, args, user } = process.getDetails().process;
    const sessionIcon = interactive ? 'consoleApp' : 'compute';

    return (
      <>
        <EuiIcon type={sessionIcon} /> <b css={styles.darkText}>{name || args[0]}</b>
        &nbsp;
        <FormattedMessage id="xpack.sessionView.startedBy" defaultMessage="started by" />
        &nbsp;
        <EuiIcon type="user" />
        &nbsp;
        <b css={styles.darkText}>{user.name}</b>
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
          <span css={styles.workingDir}>{workingDirectory}</span>&nbsp;
          <span css={styles.darkText}>{executable}</span>&nbsp;
        </span>
      );
    }
  };

  const renderProcess = () => {
    return (
      <span css={styles.processText}>
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
        <div
          data-test-subj={`processTreeNodeRow-${id}`}
          css={styles.wrapper}
          onClick={onProcessClicked}
        >
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
