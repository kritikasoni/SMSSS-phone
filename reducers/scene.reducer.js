import Storage from './../util/Storage';

// ------------------------------------
// Constants
// ------------------------------------

export const CHANGE_ROUTE = 'CHANGE_ROUTE';
export const POP_ROUTE = 'POP_ROUTE';
export const CLEAR_ROUTE = 'CLEAR_ROUTE';

// ------------------------------------
// Actions
// ------------------------------------
//
export function changeRoute(path, title ,changeSceneType) {
  return (dispatch) => {
      if(!path){
          return;
      }
      
    dispatch({
      type: CHANGE_ROUTE,
      payload: {path, title, changeSceneType: changeSceneType ? changeSceneType : ''}
    });
  }
}

export function pop() {
    return (dispatch) => {
        dispatch({
            type: POP_ROUTE
        });
    }
}

export function clearHistory() {
    return (dispatch) => {
        dispatch({
            type: CLEAR_ROUTE
        })
    }
}
// ------------------------------------
// ------------------------------------
// Action Handlers
// ------------------------------------

const SCENE_ACTION_HANDLERS = {
    [CHANGE_ROUTE]: (state, action) => {
        return ({
            ...state,
            history: [...state.history, state.current],
            current: action.payload.path,
            changeSceneType: action.payload.changeSceneType,
            title: action.payload.title
        })
    },
    [POP_ROUTE]: (state) => {
        let current = state.history.pop();
        return ({ ...state, current,history: [...state.history]})
    },
    [CLEAR_ROUTE]: (state) => {
        return ({history: [], current: 'login'})
    }
};

// ------------------------------------
// Reducers
// ------------------------------------
const initialState = {
    history: [],
    current: 'login',
    title: 'No title',
    changeSceneType: ''
};
export default function sceneReducer (state = initialState, action) {
    const handler = SCENE_ACTION_HANDLERS[action.type];

    return handler ? handler(state, action) : state
}
