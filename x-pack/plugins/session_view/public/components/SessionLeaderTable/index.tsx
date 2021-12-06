/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { 
  useCallback,
  useState,
} from 'react';
import { 
  EuiCheckbox,
  EuiButtonIcon,
  EuiToolTip,
} from '@elastic/eui';
import { useStyles } from './styles';
import { SessionViewServices } from '../../types';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import { 
  ColumnHeaderOptions, 
  ActionProps,
  CellValueElementProps,
  RowRenderer,
} from '../../../../timelines/common';
import { TGridState } from '../../../../timelines/public';

export interface SessionLeaderTableProps {
  start?: string;
  end?: string;
  indexNames?: string[];
  defaultColumns?: ColumnHeaderOptions[];
  onStateChange?: (state: TGridState) => void;
  setRefetch?: (ref: () => void) => void;
  itemsPerPage?: number[];
  onExpand?: (props: ActionProps) => {};
  onInspect?: (props: ActionProps) => {};
  onOpenSessionViewer?: (props: ActionProps) => {};
};

// Not sure why the timelines plugins doesn't have a type for the
// leading control columns props. So this is a hack to get that working for now
type RenderLeadingControllColumnProps = {
  isSelectAllChecked: boolean,
  onSelectAll: (props: { isSelected: boolean }) => void,
};

const STANDALONE_ID = 'standalone-t-grid';

const DEFAULT_COLUMNS: ColumnHeaderOptions[] = [
  {
    columnHeaderType: "not-filtered",
    id: "@timestamp",
    initialWidth: 180,
    isSortable: true,
  },
  {
    columnHeaderType: "not-filtered",
    id: "process.user.name",
    initialWidth: 180,
    isSortable: true,
  },
  {
    columnHeaderType: "not-filtered",
    id: "event.kind",
    initialWidth: 180,
    isSortable: true,
  },
  {
    columnHeaderType: "not-filtered",
    id: "process.session.pid",
    initialWidth: 180,
    isSortable: true,
  },
  {
    columnHeaderType: "not-filtered",
    id: "process.args",
    initialWidth: 180,
    isSortable: true,
  },
];

// Start date is 7 days ago
let startDate = new Date()
startDate.setDate(new Date().getDate() - 7);
const DEFAULT_END_DATE = new Date().toISOString();
const DEFAULT_START_DATE = startDate.toISOString();

const DEFAULT_INDEX_NAMES = ['cmd_entry_leader*'];

const DEFAULT_ITEMS_PER_PAGE = [10, 25, 50];

const NO_ROW_RENDERERS: RowRenderer[] = [];

export const SessionLeaderTable = (props: SessionLeaderTableProps) => {
  const {
    start = DEFAULT_START_DATE,
    end = DEFAULT_END_DATE,
    indexNames = DEFAULT_INDEX_NAMES,
    defaultColumns = DEFAULT_COLUMNS,
    onStateChange = () => {},
    setRefetch = () => {},
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    onExpand = () => {},
    onInspect = () => {},
    onOpenSessionViewer = () => {},
  } = props;

  const { timelines } = useKibana<SessionViewServices>().services;
  const [columns, setColumns] = useState<ColumnHeaderOptions[]>(defaultColumns);
  const { 
    rowButtonContainer,
    rowCheckbox,
  } = useStyles();

  const handleStateChange = useCallback((state: TGridState) => {
    onStateChange(state);
    const { timelineById } = state;
    const { [STANDALONE_ID]: standAloneTGrid } = timelineById;
    const { columns: newColumns } = standAloneTGrid;
    setColumns(newColumns);
  }, [setColumns]);

  const handleSetRefetch = (ref: () => void) => {
    setRefetch(ref);
  };

  // Must cast to any since the timelines plugin expects 
  // a React component. 
  const renderLeadingControlColumn = (props: any) => {
    const { 
      isSelectAllChecked, 
      onSelectAll,
    } = (props as RenderLeadingControllColumnProps);

    return (
      <EuiCheckbox
        id="leading-control-checkbox"
        checked={isSelectAllChecked}
        onChange={() => onSelectAll({ isSelected: !isSelectAllChecked })}
      />
    );
  };

  const renderRowCheckbox = (props: ActionProps) => {
    const { 
      ariaRowindex,
      eventId,
      checked,
      onRowSelected,
    } = props;

    const checkboxId = `row-${ariaRowindex}-checkbox`;

    return (
      <div css={rowCheckbox}>
        <EuiCheckbox
          id={checkboxId}
          checked={checked}
          onChange={() => onRowSelected({
            eventIds: [eventId],
            isSelected: !checked,
          })}
        />
      </div>
    );
  };

  const renderExpandButton = (props: ActionProps) => {
    return (
      <EuiToolTip
        position="top"
        content="Expand"
      >
        <EuiButtonIcon
          aria-label="row expand icon button"
          color="primary"
          iconType="expand"
          onClick={() => onExpand(props)}
        />
      </EuiToolTip>
    );
  };

  const renderInspectButton = (props: ActionProps) => {
    return (
      <EuiToolTip
        position="top"
        content="Inspect"
      >
        <EuiButtonIcon
          aria-label="row inspect icon button"
          color="primary"
          iconType="inspect"
          onClick={() => onInspect(props)}
        />
      </EuiToolTip>
    );
  };

  const renderOpenSessionViewerButton = (props: ActionProps) => {
    return (
      <EuiToolTip
        position="top"
        content="Open in session viewer"
      >
        <EuiButtonIcon
          aria-label="row open in session viewer icon button"
          color="primary"
          iconType="boxesHorizontal"
          onClick={() => onOpenSessionViewer(props)}
        />
      </EuiToolTip>
    );
  };

  const renderLeadingControlCell = (props: ActionProps) => {
    return (
      <div css={rowButtonContainer}>
        {renderRowCheckbox(props)}
        {renderExpandButton(props)}
        {renderInspectButton(props)}
        {renderOpenSessionViewerButton(props)}
      </div>
    );
  };

  const renderCellValue = ({ columnId, data }: CellValueElementProps) => {
    const value = data.find((o) => o.field === columnId)?.value?.[0];
    return value || <>&#8212;</>;
  }

  const renderUnit = () => {
    return 'events';
  }

  const renderTimelinesTable = () => {
    return (timelines.getTGrid<'standalone'>({
      appId: 'session_view',
      casesOwner: 'session_view_cases_owner',
      casePermissions: null,
      type: 'standalone',
      columns,
      deletedEventIds: [],
      disabledCellActions: [],
      start,
      end,
      filters: [],
      entityType: 'events',
      indexNames,
      hasAlertsCrudPermissions: () => true,
      itemsPerPageOptions: itemsPerPage,
      loadingText: 'Loading text',
      footerText: 'Session Entry Leaders',
      onStateChange: handleStateChange,
      query: {query: "", language: "kuery"},
      renderCellValue,
      rowRenderers: NO_ROW_RENDERERS,
      runtimeMappings: {},
      setRefetch: handleSetRefetch,
      sort: [],
      filterStatus: 'open',
      leadingControlColumns: [{
        id: 'session-leader-table-leading-columns',
        headerCellRender: renderLeadingControlColumn,
        rowCellRender: renderLeadingControlCell,
        width: 160,
      }],
      trailingControlColumns: [],
      unit: renderUnit,
    }));
  }

  return (
    <div>
      {renderTimelinesTable()}
    </div>
  );
};
