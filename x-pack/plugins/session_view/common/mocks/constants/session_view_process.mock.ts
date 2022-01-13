/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  Process,
  ProcessEvent,
  ProcessEventsPage,
  ProcessFields,
  EventAction,
  EventKind,
  ProcessMap,
  User,
} from '../../types/process_tree';
import { PROCESS_NODE_BASE_HEIGHT } from '../../constants';

const mockEvents = [
  {
    '@timestamp': new Date('2021-11-23T15:25:04.210Z'),
    process: {
      pid: 3535,
      pgid: 2442,
      user: {
        name: '',
        id: '-1',
      },
      executable: '/usr/bin/bash',
      interactive: false,
      entity_id: '8e4daeb2-4a4e-56c4-980e-f0dcfdbc3726',
      parent: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:04.210Z')
      },
      session: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:04.210Z')
      },
      entry: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:04.210Z')
      },
      name: '',
      args_count: 0,
      args: [],
      working_directory: '/home/vagrant',
      start: new Date('2021-11-23T15:25:04.210Z')
    },
    event: {
      action: EventAction.fork,
      category: 'process',
      kind: EventKind.event,
    },
  },
  {
    '@timestamp': new Date('2021-11-23T15:25:04.218Z'),
    process: {
      pid: 3535,
      pgid: 3535,
      user: {
        name: 'vagrant',
        id: '1000',
      },
      executable: '/usr/bin/vi',
      interactive: true,
      entity_id: '8e4daeb2-4a4e-56c4-980e-f0dcfdbc3727',
      parent: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:04.218Z'),
      },
      session: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:04.218Z'),
      },
      entry: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:04.218Z'),
      },
      name: '',
      args_count: 2,
      args: ['vi', 'cmd/config.ini'],
      working_directory: '/home/vagrant',
      start: new Date('2021-11-23T15:25:04.218Z'),
    },
    event: {
      action: EventAction.exec,
      category: 'process',
      kind: EventKind.event,
    },
  },
  {
    '@timestamp': new Date('2021-11-23T15:25:05.202Z'),
    process: {
      pid: 3535,
      pgid: 3535,
      user: {
        name: 'vagrant',
        id: '1000',
      },
      executable: '/usr/bin/vi',
      interactive: true,
      entity_id: '8e4daeb2-4a4e-56c4-980e-f0dcfdbc3728',
      parent: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:05.202Z')
      },
      session: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:05.202Z')
      },
      entry: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:25:05.202Z')
      },
      start: new Date('2021-11-23T15:25:05.202Z'),
      name: '',
      args_count: 2,
      args: ['vi', 'cmd/config.ini'],
      working_directory: '/home/vagrant',
    },
    event: {
      action: EventAction.exit,
      category: 'process',
      kind: EventKind.event,
    },
  },
] as ProcessEvent[];

export const mockAlerts: ProcessEvent[] = [
  {
    kibana: {
      alert: {
        rule: {
          category: 'Custom Query Rule',
          consumer: 'siem',
          name: 'cmd test alert',
          uuid: '709d3890-4c71-11ec-8c67-01ccde9db9bf',
          enabled: true,
          description: 'cmd test alert',
          risk_score: 21,
          severity: 'low',
          query: "process.executable: '/usr/bin/vi'",
        },
        status: 'active',
        workflow_status: 'open',
        reason: 'process event created low alert cmd test alert.',
        original_time: new Date('2021-11-23T15:25:04.218Z'),
        original_event: {
          action: 'exec',
        },
        uuid: '6bb22512e0e588d1a2449b61f164b216e366fba2de39e65d002ae734d71a6c38',
      },
    },
    '@timestamp': new Date('2021-11-23T15:26:34.859Z'),
    process: {
      pid: 3535,
      pgid: 3535,
      user: {
        name: 'vagrant',
        id: '1000',
      },
      executable: '/usr/bin/vi',
      interactive: true,
      entity_id: '8e4daeb2-4a4e-56c4-980e-f0dcfdbc3726',
      parent: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:26:34.859Z'),
      },
      session: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:26:34.859Z'),
      },
      entry: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args: [],
        args_count: 0,
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:26:34.859Z'),
      },
      name: '',
      args_count: 2,
      args: ['vi', 'cmd/config.ini'],
      working_directory: '/home/vagrant',
      start: new Date('2021-11-23T15:26:34.859Z'),
    },
    event: {
      action: EventAction.exec,
      category: 'process',
      kind: EventKind.signal,
    },
  },
  {
    kibana: {
      alert: {
        rule: {
          category: 'Custom Query Rule',
          consumer: 'siem',
          name: 'cmd test alert',
          uuid: '709d3890-4c71-11ec-8c67-01ccde9db9bf',
          enabled: true,
          description: 'cmd test alert',
          risk_score: 21,
          severity: 'low',
          query: "process.executable: '/usr/bin/vi'",
        },
        status: 'active',
        workflow_status: 'open',
        reason: 'process event created low alert cmd test alert.',
        original_time: new Date('2021-11-23T15:25:05.202Z'),
        original_event: {
          action: 'exit',
        },
        uuid: '2873463965b70d37ab9b2b3a90ac5a03b88e76e94ad33568285cadcefc38ed75',
      },
    },
    '@timestamp': new Date('2021-11-23T15:26:34.860Z'),
    process: {
      pid: 3535,
      pgid: 3535,
      user: {
        name: 'vagrant',
        id: '1000',
      },
      executable: '/usr/bin/vi',
      interactive: true,
      entity_id: '8e4daeb2-4a4e-56c4-980e-f0dcfdbc3726',
      parent: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args_count: 2,
        args: ['vi', 'cmd/config.ini'],
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:26:34.860Z'),
      },
      session: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args_count: 2,
        args: ['vi', 'cmd/config.ini'],
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:26:34.860Z'),
      },
      entry: {
        pid: 2442,
        pgid: 2442,
        user: {
          name: '',
          id: '1000',
        },
        executable: '/usr/bin/bash',
        interactive: true,
        entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
        name: '',
        args_count: 2,
        args: ['vi', 'cmd/config.ini'],
        working_directory: '/home/vagrant',
        start: new Date('2021-11-23T15:26:34.860Z'),
      },
      name: '',
      args_count: 2,
      args: ['vi', 'cmd/config.ini'],
      working_directory: '/home/vagrant',
      start: new Date('2021-11-23T15:26:34.860Z'),
    },
    event: {
      action: EventAction.exit,
      category: 'process',
      kind: EventKind.signal,
    },
  },
];

export const mockData: ProcessEventsPage[] = [
  {
    events: mockEvents,
    cursor: '2021-11-23T15:25:04.210Z'
  }
]

export const processMock: Process = {
  id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
  events: [],
  children: [],
  autoExpand: false,
  expanded: false,
  alertsExpanded: false,
  searchMatched: null,
  parent: undefined,
  hasOutput: () => false,
  hasAlerts: () => false,
  getAlerts: () => [],
  hasExec: () => false,
  getOutput: () => '',
  getDetails: () =>
  ({
    '@timestamp': new Date('2021-11-23T15:25:04.210Z'),
    event: {
      kind: EventKind.event,
      category: 'process',
      action: EventAction.exec,
    },
    process: {
      args: [],
      args_count: 0,
      entity_id: '3d0192c6-7c54-5ee6-a110-3539a7cf42bc',
      executable: '',
      interactive: false,
      name: '',
      working_directory: '/home/vagrant',
      start: new Date('2021-11-23T15:25:04.210Z'),
      pid: 1,
      pgid: 1,
      user: {} as User,
      parent: {} as ProcessFields,
      session: {} as ProcessFields,
      entry: {} as ProcessFields,
    },
  } as ProcessEvent),
  isUserEntered: () => false,
  getMaxAlertLevel: () => null,
  getHeight: () => PROCESS_NODE_BASE_HEIGHT,
};

export const sessionViewBasicProcessMock: Process = {
  ...processMock,
  events: mockEvents,
  hasExec: () => true,
  isUserEntered: () => true,
};

export const sessionViewAlertProcessMock: Process = {
  ...processMock,
  events: [...mockEvents, ...mockAlerts],
  hasAlerts: () => true,
  getAlerts: () => mockEvents,
  hasExec: () => true,
  isUserEntered: () => true,
};

export const mockProcessMap = mockEvents.reduce(
  (processMap, event) => {
    processMap[event.process.entity_id] = {
      id: event.process.entity_id,
      events: [event],
      children: [],
      parent: undefined,
      autoExpand: false,
      expanded: false,
      alertsExpanded: false,
      searchMatched: null,
      hasOutput: () => false,
      hasAlerts: () => false,
      getAlerts: () => [],
      hasExec: () => false,
      getOutput: () => '',
      getDetails: () => event,
      isUserEntered: () => false,
      getMaxAlertLevel: () => null,
      getHeight: () => PROCESS_NODE_BASE_HEIGHT,
    };
    return processMap;
  },
  {
    [sessionViewBasicProcessMock.id]: sessionViewBasicProcessMock,
  } as ProcessMap
);
