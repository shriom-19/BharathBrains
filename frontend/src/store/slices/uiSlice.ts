import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  voiceEnabled: boolean
  isListening: boolean
  showAdvancedFilters: boolean
  activeTab: string
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: number
  }>
}

const initialState: UiState = {
  voiceEnabled: false,
  isListening: false,
  showAdvancedFilters: false,
  activeTab: 'all',
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setVoiceEnabled: (state, action: PayloadAction<boolean>) => {
      state.voiceEnabled = action.payload
    },
    setIsListening: (state, action: PayloadAction<boolean>) => {
      state.isListening = action.payload
    },
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },
    addNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning'
        message: string
      }>
    ) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  setVoiceEnabled,
  setIsListening,
  toggleAdvancedFilters,
  setActiveTab,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer