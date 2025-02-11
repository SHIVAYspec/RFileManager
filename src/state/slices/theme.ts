import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit"

interface T {
    theme: string
}

const initialState: T = {
    theme: "dark",
}

export const themeSlice: Slice<T> = createSlice({
    name: "themeSlice",
    initialState,
    reducers: {
        changeTheme: (state, action: PayloadAction<string>) => {
            state.theme = action.payload
        }
    }
})

export const { changeTheme } = themeSlice.actions