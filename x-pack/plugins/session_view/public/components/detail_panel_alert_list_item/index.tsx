/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState, useCallback } from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import {
  EuiText,
  EuiAccordion,
  EuiPanel,
  EuiPopover,
  EuiContextMenuPanel,
  EuiButtonIcon,
  EuiContextMenuItem,
} from '@elastic/eui';
import { Process, ProcessEvent } from '../../../common/types/process_tree';
import { ProcessImpl } from '../process_tree/hooks';
import { useStyles } from './styles';

interface DetailPanelAlertsListItemDeps {
  event: ProcessEvent;
  onProcessSelected: (process: Process) => void;
  isInvestigated: boolean;
}

/**
 * Detail panel description list item.
 */
export const DetailPanelAlertListItem = ({
  event,
  onProcessSelected,
  isInvestigated,
}: DetailPanelAlertsListItemDeps) => {
  const styles = useStyles({ isInvestigated });
  const [isPopoverOpen, setPopover] = useState(false);

  const onClosePopover = useCallback(() => {
    setPopover(false);
  }, []);

  const onToggleMenu = useCallback(() => {
    setPopover(!isPopoverOpen);
  }, [isPopoverOpen]);

  const onJumpToAlert = () => {
    const process = new ProcessImpl(event.process.entity_id);

    onProcessSelected(process);
    setPopover(false);
  };

  const onShowDetails = useCallback(() => {
    // TODO: call into alert flyout
  }, []);

  if (!event.kibana) {
    return null;
  }

  const { uuid, name } = event.kibana.alert.rule;
  const { args } = event.process;

  const menuItems = [
    <EuiContextMenuItem key="details" onClick={onShowDetails}>
      <FormattedMessage
        id="xpack.sessionView.detailPanelAlertListItem.showDetailsAction"
        defaultMessage="View alert details"
      />
    </EuiContextMenuItem>,
    <EuiContextMenuItem key="jumpTo" onClick={onJumpToAlert}>
      <FormattedMessage
        id="xpack.sessionView.detailPanelAlertListItem.jumpToAlert"
        defaultMessage="Jump to alerted process"
      />
    </EuiContextMenuItem>,
  ];

  return (
    <EuiAccordion
      id={uuid}
      arrowDisplay="right"
      buttonContent={name}
      css={styles.alertItem}
      extraAction={
        <EuiPopover
          id={uuid}
          button={
            <EuiButtonIcon
              display="base"
              size="s"
              iconType="boxesVertical"
              aria-label="More"
              onClick={onToggleMenu}
            />
          }
          isOpen={isPopoverOpen}
          closePopover={onClosePopover}
          panelPaddingSize="none"
          anchorPosition="leftCenter"
        >
          <EuiContextMenuPanel size="s" items={menuItems} />
        </EuiPopover>
      }
    >
      <EuiText>{name}</EuiText>
      <EuiPanel>
        <EuiText css={styles.processArgs}>{args.join(' ')}</EuiText>
      </EuiPanel>
      {isInvestigated && (
        <div css={styles.investigatedLabel}>
          <FormattedMessage
            id="xpack.sessionView.detailPanelAlertListItem.investigatedLabel"
            defaultMessage="Investigated alert"
          />
        </div>
      )}
    </EuiAccordion>
  );
};
