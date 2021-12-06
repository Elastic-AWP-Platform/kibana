/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';
import {
  mockEvents,
  mockProcessMap,
  sessionViewBasicProcessMock,
} from '../../../common/mocks/constants/session_view_process.mock';
import { Process, ProcessEvent, ProcessMap } from '../../../common/types/process_tree';
import {
  updateProcessMap,
  buildProcessTree,
  searchProcessTree,
  autoExpandProcessTree,
} from './helpers';

const SESSION_ENTITY_ID = '3d0192c6-7c54-5ee6-a110-3539a7cf42bc';
const SEARCH_QUERY = 'vi';
const SEARCH_RESULT_PROCESS_ID = '8e4daeb2-4a4e-56c4-980e-f0dcfdbc3727';

describe('process tree hook helpers tests', () => {
  let processMap: ProcessMap;

  beforeEach(() => {
    processMap = {};
  });

  it('updateProcessMap works', () => {
    updateProcessMap(processMap, mockEvents);

    // processes are added to processMap
    mockEvents.forEach((event) => {
      expect(processMap[event.process.entity_id]).toBeTruthy();
    });
  });

  it('buildProcessTree works', () => {
    processMap = mockProcessMap;
    const orphans: Process[] = [];
    buildProcessTree(processMap, mockEvents, orphans, SESSION_ENTITY_ID);

    const sessionLeaderChildrenIds = new Set(
      processMap[SESSION_ENTITY_ID].children.map((child) => child.id)
    );

    // processes are added under their parent's childrean array in processMap
    mockEvents.forEach((event) => {
      expect(sessionLeaderChildrenIds.has(event.process.entity_id));
    });
  });

  it('searchProcessTree works', () => {
    const searchResults = searchProcessTree(mockProcessMap, SEARCH_QUERY);

    // search returns the process with search query in its event args
    expect(searchResults[0].id).toBe(SEARCH_RESULT_PROCESS_ID);
  });

  it('autoExpandProcessTree works', () => {
    processMap = mockProcessMap;
    // mock what buildProcessTree does
    const childProcesses = Object.values(processMap).filter(
      (process) => process.id !== SESSION_ENTITY_ID
    );
    processMap[SESSION_ENTITY_ID].children = childProcesses;

    expect(processMap[SESSION_ENTITY_ID].autoExpand).toBeFalsy();
    autoExpandProcessTree(processMap);
    // session leader should have autoExpand to be true
    expect(processMap[SESSION_ENTITY_ID].autoExpand).toBeTruthy();
  });
});
