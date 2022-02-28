/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { ProcessEvent, Process } from '../../../common/types/process_tree';
import { useStyles } from './styles';

interface DetailPanelAlertTabDeps {
  alerts: ProcessEvent[];
  onProcessSelected: (process: Process) => void;
}

/**
 * Host Panel of  session view detail panel.
 */
export const DetailPanelAlertTab = ({ alerts, onProcessSelected }: DetailPanelAlertTabDeps) => {
  const styles = useStyles();

  return (
    <div css={styles}>
      {alerts.map((alert) => {
        return <div>{alert.kibana?.alert.rule.name}</div>;
      })}
    </div>
  );
};
