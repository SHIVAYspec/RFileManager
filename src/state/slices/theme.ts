import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit"

export enum ContentViewType {
    BigGrid,
    SmallGrid,
    Detailed,
}

export enum SortingType {
    NAME,
    CTIME,
    MTIME,
}

export enum SortingOrder {
    ASCENDING,
    DESCENDING,
}

interface T {
    theme: string
    contentViewType: ContentViewType
    searchFilter: string
    sortingType: SortingType
    sortingOrder: SortingOrder
}

const initialState: T = {
    theme: "dark",
    contentViewType: ContentViewType.BigGrid,
    searchFilter: "",
    sortingType: SortingType.NAME,
    sortingOrder: SortingOrder.ASCENDING,
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
        },
        setSortingType: (state, action: PayloadAction<SortingType>) => {
            state.sortingType = action.payload
        },
        setSortingOrder: (state, action: PayloadAction<SortingOrder>) => {
            state.sortingOrder = action.payload
        }
    }
})

export const { changeTheme, setContentViewType, setSearchFilter, setSortingType, setSortingOrder } = themeSlice.actions