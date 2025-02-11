import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit"

export enum ContentViewType {
    BigGrid,
    SmallGrid,
    Detailed,
}

interface T {
    theme: string
    contentViewType: ContentViewType
    searchFilter: string,
}

const initialState: T = {
    theme: "dark",
    contentViewType: ContentViewType.BigGrid,
    searchFilter: "",
}

export const themeSlice: Slice<T> = createSlice({
    name: "themeSlice",
    initialState,
    reducers: {
        changeTheme: (state, action: PayloadAction<string>) => {
            state.theme = action.payload
        },
        setContentViewType: (state, action: PayloadAction<ContentViewType>) => {
            state.contentViewType = action.payload
        },
        setSearchFilter: (state, action: PayloadAction<string>) => {
            state.searchFilter = action.payload
        }
    }
})

export const { changeTheme, setContentViewType, setSearchFilter } = themeSlice.actions