export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("settingState");
    if (serializedState === null) {
      return undefined;
    } else {
      const state = JSON.parse(serializedState);
      return state;
    }
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("settingState", serializedState);
  } catch (err) {
    console.error("Error:", err);
  }
};
