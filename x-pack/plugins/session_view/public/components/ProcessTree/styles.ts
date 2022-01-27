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
    const defaultSelectionColor = euiTheme.colors.accent;

    const scroller: CSSObject = {
      position: 'relative',
      fontFamily: euiTheme.font.familyCode,
      overflow: 'auto',
      height: '100%',
      backgroundColor: euiTheme.colors.lightestShade,
      display: 'flex',
      flexDirection: 'column',
    };

    const processTree: CSSObject = {
      '&>div[role="rowgroup"]': {
        '&:before': {
          borderLeft: `2px dotted ${euiTheme.colors.lightShade}`,
          position: 'absolute',
          height: '100%',
          content: `''`,
          left: '10px',
        },
        '&:after': {
          content: `''`,
          left: '7px',
          bottom: 0,
          backgroundColor: euiTheme.colors.lightShade,
          width: '7px',
          height: '2px',
          borderRadius: '2px',
          position: 'absolute',
        },
      },
    };

    const selectionArea: CSSObject = {
      position: 'absolute',
      display: 'none',
      marginLeft: '-50%',
      width: '150%',
      height: '100%',
      backgroundColor: defaultSelectionColor,
      pointerEvents: 'none',
      opacity: 0.1,
    };

    return {
      scroller,
      processTree,
      selectionArea,
    };
  }, [euiTheme]);

  return cached;
};
