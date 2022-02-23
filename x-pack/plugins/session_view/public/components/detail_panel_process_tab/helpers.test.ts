/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { getProcessExecutableCopyText } from './helpers';

describe('detail panel process tab helpers tests', () => {
  it('getProcessExecutableCopyText works with empty array', () => {
    const result = getProcessExecutableCopyText([]);
    expect(result).toEqual('');
  });

  it('getProcessExecutableCopyText works with array of tuples', () => {
    const result = getProcessExecutableCopyText([
      ['echo', 'exec'],
      ['echo', 'exit'],
    ]);
    expect(result).toEqual('echo exec, echo exit');
  });

  it('getProcessExecutableCopyText returns empty string with an  invalid array of tuples', () => {
    const result = getProcessExecutableCopyText([['echo', 'exec'], ['echo'], ['exit']]);
    expect(result).toEqual('');
  });
});
