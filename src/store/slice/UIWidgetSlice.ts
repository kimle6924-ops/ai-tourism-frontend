import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type WidgetType = 'chatbot' | 'community' | null;

interface UIWidgetState {
    activeWidget: WidgetType;
}

const initialState: UIWidgetState = {
    activeWidget: null,
};

const uiWidgetSlice = createSlice({
    name: 'uiWidget',
    initialState,
    reducers: {
        setActiveWidget(state, action: PayloadAction<WidgetType>) {
            state.activeWidget = action.payload;
        },
    },
});

export const { setActiveWidget } = uiWidgetSlice.actions;
export default uiWidgetSlice.reducer;
