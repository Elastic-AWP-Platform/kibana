/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useMemo } from 'react';
import { useEuiTheme } from '@elastic/eui';
import { CSSObject } from '@emotion/react';

export const useStyles = () => {
  const { euiTheme } = useEuiTheme();

  const cached = useMemo(() => {
    const description: CSSObject = {
      width: 'calc(100% - 28px)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };

    const descriptionSemibold: CSSObject = {
      ...description,
      fontWeight: euiTheme.font.weight.medium,
    };

    const executableAction: CSSObject = {
      fontWeight: euiTheme.font.weight.semiBold,
      paddingLeft: euiTheme.size.xs,
    };

    return {
      descriptionSemibold,
      executableAction,
    };
  }, [euiTheme]);

  return cached;
};
