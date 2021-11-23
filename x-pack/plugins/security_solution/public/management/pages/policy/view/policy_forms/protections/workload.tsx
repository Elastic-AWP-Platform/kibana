/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { EuiCallOut, EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { Immutable, OperatingSystem } from '../../../../../../../common/endpoint/types';
import { WorkloadProtectionOSes, OS } from '../../../types';
import { ConfigForm } from '../../components/config_form';
import { RadioButtons } from '../components/radio_buttons';
import { UserNotification } from '../components/user_notification';
import { ProtectionSwitch } from '../components/protection_switch';
import { APP_UI_ID } from '../../../../../../../common/constants';
import { LinkToApp } from '../../../../../../common/components/endpoint/link_to_app';
import { SecurityPageName } from '../../../../../../app/types';

/** The Workload Protections form for policy details
 *  which will configure for all relevant OSes.
 */
export const WorkloadProtection = React.memo(() => {
  const OSes: Immutable<WorkloadProtectionOSes[]> = [OS.windows, OS.mac, OS.linux];
  const protection = 'workload_protection';
  const protectionLabel = i18n.translate(
    'xpack.securitySolution.endpoint.policy.protections.workload',
    {
      defaultMessage: 'Workload protections',
    }
  );
  return (
    <ConfigForm
      type={i18n.translate('xpack.securitySolution.endpoint.policy.details.workload_protection', {
        defaultMessage: 'Workload',
      })}
      supportedOss={[OperatingSystem.LINUX]}
      dataTestSubj="workloadProtectionsForm"
      rightCorner={
        <ProtectionSwitch protection={protection} protectionLabel={protectionLabel} osList={OSes} />
      }
    >
      <RadioButtons protection={protection} osList={OSes} />
      <UserNotification protection={protection} osList={OSes} />
      <EuiSpacer size="m" />
      <EuiCallOut iconType="iInCircle">
        <FormattedMessage
          id="xpack.securitySolution.endpoint.policy.details.detectionRulesMessage"
          defaultMessage="View {detectionRulesLink}. Prebuilt rules are tagged “Elastic” on the Detection Rules page."
          values={{
            detectionRulesLink: (
              <LinkToApp appId={APP_UI_ID} deepLinkId={SecurityPageName.rules}>
                <FormattedMessage
                  id="xpack.securitySolution.endpoint.policy.details.detectionRulesLink"
                  defaultMessage="related detection rules"
                />
              </LinkToApp>
            ),
          }}
        />
      </EuiCallOut>
    </ConfigForm>
  );
});

WorkloadProtection.displayName = 'WorkloadProtection';
