/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { createContext, ReactNode, useContext, useReducer, Dispatch } from 'react';

type Actions = { type: 'increment' } | { type: 'decrement' };
interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

const WindowingStateContext = createContext<State>(initialState);
const WindowingDispatchContext = createContext<Dispatch<Actions>>(() => {});

const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case 'increment': {
      return { ...state, count: state.count + 1 };
    }
    case 'decrement': {
      return { ...state, count: state.count - 1 };
    }
    default: {
      return state;
    }
  }
};

export const WindowingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <WindowingStateContext.Provider value={state}>
      <WindowingDispatchContext.Provider value={dispatch}>
        {children}
      </WindowingDispatchContext.Provider>
    </WindowingStateContext.Provider>
  );
};

export const useWindowingState = () => {
  const context = useContext(WindowingStateContext);
  if (!context) {
    return false;
  }
  return context;
};

export const useWindowingDispatch = () => {
  const context = useContext(WindowingDispatchContext);
  if (!context) {
    return false;
  }
  return context;
};
