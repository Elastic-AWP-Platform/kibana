/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export const SESSION_VIEW_TAB = '[data-test-subj="navigation-sessions"]';

export const SESSION_TABLE = '[data-test-subj="session-leader-table"]';

export const SESSION_VIEW_EMPTY_STATE = `${SESSION_TABLE} [data-test-subj="tGridEmptyState"]`;

export const SESSION_TABLE_HEADER = (column: string) =>
  `${SESSION_TABLE} [data-test-subj="dataGridHeaderCell-${column}"]`;

export const SESSION_TABLE_HEADER_ACTIONS = (column: string) =>
  `[data-test-subj="dataGridHeaderCellActionGroup-${column}"]`;

export const SESSION_TABLE_ROW_CONTROL = `${SESSION_TABLE} [data-test-subj="dataGridRowCell"].euiDataGridRowCell--firstColumn`;

export const SESSION_TABLE_ROW_MORE_BUTTON = (eventId: string) =>
  `[data-test-subj="session-leader-table-more-actions-${eventId}"]`;

export const SESSION_TABLE_OPEN_SESSION_VIEW_TEXT = 'Open in session viewer';

export const SESSION_VIEW = '[data-test-subj="sessionViewProcessTree"]';

export const SESSION_VIEW_CLOSE_BUTTON = '[data-test-subj="session-view-close-button"]';
