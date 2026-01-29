import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slices/searchSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch