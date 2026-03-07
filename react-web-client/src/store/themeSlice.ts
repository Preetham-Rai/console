import { createSlice } from "@reduxjs/toolkit";

type Theme = 'light' | 'dark'

interface ThemeState {
    mode: Theme;
}

const initialState: ThemeState = {
    mode: (localStorage.getItem('theme') as Theme) || 'light'
}

const theme = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme(state) {
            state.mode = state.mode === 'light' ? 'dark' : 'light'

            localStorage.setItem('theme', state.mode)
        },
        setTheme(state, action) {
            state.mode = action.payload;
            localStorage.setItem('theme', state.mode)
        }
    }
})

export const { toggleTheme, setTheme } = theme.actions;
export default theme.reducer;