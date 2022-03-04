/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { ProcessEvent, Process } from '../../../common/types/process_tree';
import { useStyles } from './styles';
import { DetailPanelAlertListItem } from '../detail_panel_alert_list_item';

interface DetailPanelAlertTabDeps {
  alerts: ProcessEvent[];
  onProcessSelected: (process: Process) => void;
  investigatedAlert?: ProcessEvent;
}

/**
 * Host Panel of  session view detail panel.
 */
export const DetailPanelAlertTab = ({
  alerts,
  onProcessSelected,
  investigatedAlert,
}: DetailPanelAlertTabDeps) => {
  const styles = useStyles();

  return (
    <div css={styles}>
      {alerts.map((event) => {
        const isInvestigatedAlert =
          event.kibana?.alert.uuid === investigatedAlert?.kibana?.alert.uuid;

        return (
          <DetailPanelAlertListItem
            event={event}
            onProcessSelected={onProcessSelected}
            isInvestigated={isInvestigatedAlert}
          />
        );
      })}
    </div>
  );
};
