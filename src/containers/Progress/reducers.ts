const SET_PROGRESS = 'set_progress';

export const setProgressAction = (percent: number) => ({
  type: SET_PROGRESS,
  percent
});

const initState = {
  percent: 0
};

export default (state = initState, action: {type: typeof SET_PROGRESS; percent: number}) => {
  if (action.type === SET_PROGRESS) {
    return { percent: action.percent };
  }
  return state;
};
