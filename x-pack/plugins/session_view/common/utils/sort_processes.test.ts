/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { sortProcesses } from './sort_processes';
import { Process } from '../types/process_tree';
import { mockProcessMap } from '../mocks/constants/session_view_process.mock';

describe('sortProcesses(a, b)', () => {
  it('works', () => {
    const processes = Object.values(mockProcessMap);

    // shuffle some things to ensure all sort lines are hit
    const c = processes[0];
    processes[0] = processes[processes.length - 1];
    processes[processes.length - 1] = c;

    const sorted = processes.sort(sortProcesses);

    let lastProcess: Process;

    sorted.forEach((process) => {
      if (
        lastProcess &&
        lastProcess.getDetails().process.start > process.getDetails().process.start
      ) {
        throw new Error('processes not sorted by process.start');
      }
    });
  });
});
