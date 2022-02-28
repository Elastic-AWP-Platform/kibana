/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { EuiTabs, EuiTab, EuiNotificationBadge } from '@elastic/eui';
import { EuiTabProps } from '../../types';
import { Process, ProcessEvent } from '../../../common/types/process_tree';
import { getDetailPanelProcess, getSelectedTabContent } from './helpers';
import { DetailPanelProcessTab } from '../detail_panel_process_tab';
import { DetailPanelHostTab } from '../detail_panel_host_tab';
import { DetailPanelAlertTab } from '../detail_panel_alert_tab';
import { ALERT_COUNT_THRESHOLD } from '../../../common/constants';

interface SessionViewDetailPanelDeps {
  alerts: ProcessEvent[] | undefined;
  selectedProcess: Process;
  onProcessSelected: (process: Process) => void;
}

/**
 * Detail panel in the session view.
 */
export const SessionViewDetailPanel = ({
  alerts,
  selectedProcess,
  onProcessSelected,
}: SessionViewDetailPanelDeps) => {
  const [selectedTabId, setSelectedTabId] = useState('process');
  const processDetail = useMemo(() => getDetailPanelProcess(selectedProcess), [selectedProcess]);

  const getAlertCount = useCallback(() => {
    if (!alerts) {
      return;
    }

    return alerts.length >= ALERT_COUNT_THRESHOLD ? ALERT_COUNT_THRESHOLD + '+' : alerts.length;
  }, [alerts]);

  const tabs: EuiTabProps[] = useMemo(
    () => [
      {
        id: 'process',
        name: 'Process',
        content: <DetailPanelProcessTab processDetail={processDetail} />,
      },
      {
        id: 'host',
        name: 'Host',
        content: <DetailPanelHostTab processHost={selectedProcess.events[0].host} />,
      },
      {
        id: 'alerts',
        name: 'Alerts',
        append: (
          <EuiNotificationBadge className="eui-alignCenter" size="m">
            {getAlertCount()}
          </EuiNotificationBadge>
        ),
        content: alerts && (
          <DetailPanelAlertTab alerts={alerts} onProcessSelected={onProcessSelected} />
        ),
      },
    ],
    [alerts, getAlertCount, processDetail, selectedProcess.events, onProcessSelected]
  );

  const onSelectedTabChanged = useCallback((id: string) => {
    setSelectedTabId(id);
  }, []);

  const tabContent = useMemo(
    () => getSelectedTabContent(tabs, selectedTabId),
    [tabs, selectedTabId]
  );

  return (
    <>
      <EuiTabs size="l" expand>
        {tabs.map((tab, index) => (
          <EuiTab
            key={index}
            onClick={() => onSelectedTabChanged(tab.id)}
            isSelected={tab.id === selectedTabId}
            disabled={tab.disabled}
            prepend={tab.prepend}
            append={tab.append}
          >
            {tab.name}
          </EuiTab>
        ))}
      </EuiTabs>
      {tabContent}
    </>
  );
};
