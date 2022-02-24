/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getBuildingBlockRule } from '../../objects/rule';
import { OVERVIEW_ALERTS_HISTOGRAM } from '../../screens/overview';
import { OVERVIEW } from '../../screens/security_header';
import { goToRuleDetails } from '../../tasks/alerts_detection_rules';
import { createCustomRuleActivated } from '../../tasks/api_calls/rules';
import { cleanKibana } from '../../tasks/common';
import { waitForAlertsToPopulate, waitForTheRuleToBeExecuted } from '../../tasks/create_new_rule';
import { loginAndWaitForPage, loginAndWaitForPageWithoutDateRange } from '../../tasks/login';
import { navigateFromHeaderTo } from '../../tasks/security_header';
import { ALERTS_URL, DETECTIONS_RULE_MANAGEMENT_URL } from '../../urls/navigation';

const EXPECTED_NUMBER_OF_ALERTS = 16;

describe.skip('Alerts generated by building block rules', () => {
  beforeEach(() => {
    cleanKibana();
    loginAndWaitForPageWithoutDateRange(ALERTS_URL);
  });

  it('Alerts should be visible on the Rule Detail page and not visible on the Overview page', () => {
    createCustomRuleActivated(getBuildingBlockRule());
    loginAndWaitForPage(DETECTIONS_RULE_MANAGEMENT_URL);
    goToRuleDetails();
    waitForTheRuleToBeExecuted();

    // Check that generated events are visible on the Details page
    waitForAlertsToPopulate(EXPECTED_NUMBER_OF_ALERTS);

    navigateFromHeaderTo(OVERVIEW);

    // Check that generated events are hidden on the Overview page
    cy.get(OVERVIEW_ALERTS_HISTOGRAM).should('contain.text', 'No data to display');
  });
});
