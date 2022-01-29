/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { ReactNode } from 'react';
import { EuiDescriptionList } from '@elastic/eui';
import { useStyles } from './styles';

interface DetailPanelDescriptionListDeps {
  listItems: Array<{
    title: NonNullable<ReactNode>;
    description: NonNullable<ReactNode>;
  }>;
}

const TAB_LIST_TITLE_STYLE = {
  style: { width: '40%', display: 'flex', alignItems: 'center' },
};
const TAB_LIST_DESCRIPTION_STYLE = {
  style: { width: '60%', display: 'flex', alignItems: 'center' },
};

/**
 * Description list in session view detail panel.
 */
export const DetailPanelDescriptionList = ({ listItems }: DetailPanelDescriptionListDeps) => {
  const styles = useStyles();
  return (
    <EuiDescriptionList
      type="column"
      listItems={listItems}
      css={styles.descriptionList}
      titleProps={TAB_LIST_TITLE_STYLE}
      descriptionProps={TAB_LIST_DESCRIPTION_STYLE}
    />
  );
};
