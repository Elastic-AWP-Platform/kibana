/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useMemo } from 'react';
import { useEuiTheme, transparentize } from '@elastic/eui';
import { CSSObject } from '@emotion/react';

interface StylesDeps {
  isInvestigated: boolean;
}

export const useStyles = ({ isInvestigated }: StylesDeps) => {
  const { euiTheme } = useEuiTheme();

  const cached = useMemo(() => {
    const { colors } = euiTheme;

    const dangerBorder = transparentize(colors.danger, 0.2);
    const borderColor = isInvestigated ? dangerBorder : colors.lightShade;

    const alertItem: CSSObject = {
      border: `1px solid ${borderColor}`,
    };

    const processArgs: CSSObject = {
      border: `1px solid ${colors.lightShade}`,
    };

    const investigatedLabel: CSSObject = {
      color: colors.dangerText,
      border: `1px solid ${colors.danger}`,
      backgroundColor: dangerBorder,
    };

    return {
      alertItem,
      processArgs,
      investigatedLabel,
    };
  }, [euiTheme, isInvestigated]);

  return cached;
};
