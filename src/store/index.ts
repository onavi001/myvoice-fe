import { configureStore } from "@reduxjs/toolkit";
import routineReducer from "./routineSlice";
import progressReducer from "./progressSlice";
import userReducer from "./userSlice";
import coachReducer from "./coachSlice";
import userManagementReducer from "./userManagementSlice";

export const store = configureStore({
  reducer: {
    routine: routineReducer,
    progress: progressReducer,
    user: userReducer,
    coach: coachReducer,
    userManagement: userManagementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;