import { createAsyncThunk, createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { ID, Inode } from "../../model/filesystem/entity";
import { FsService } from "../../model/filesystem/service/interface";

type T = {
    loading: boolean,
    history: Array<ID>
    cwdIndex: number,
    contents: Array<Inode>
}


const initialState: T = {
    loading: true,
    history: ["root"],
    cwdIndex: 0,
    contents: [],
}

export const fileSystemNavSlice: Slice<T> = createSlice({
    name: 'fileSystemNavSlice',
    initialState,
    reducers: {
        navForward: (state) => {
            if (state.cwdIndex != state.history.length - 1) {
                state.cwdIndex++
            }
        },
        navBackward: (state) => {
            if (state.cwdIndex != 0) {
                state.cwdIndex--
            }
        },
        navAppend: (state, action: PayloadAction<ID>) => {
            // slice the array if cwdIndex is not the last index of history array
            if (state.cwdIndex != state.history.length - 1) {
                state.history = state.history.slice(0, state.cwdIndex + 1)
                state.cwdIndex = ++state.cwdIndex
            } else {
                state.cwdIndex = ++state.cwdIndex
            }
            state.history.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        // 'fs/list'
        builder
            .addCase(list.pending, (state) => {
                state.loading = true
            })
            .addCase(list.fulfilled, (state, action) => {
                state.contents = action.payload
                state.loading = false
            })
    }
});

export const list = createAsyncThunk('fs/list', async (props: { service: FsService, path: ID }): Promise<Array<Inode>> => {
    return props.service.getDirectoryChildren(props.path)
})


export const { navForward, navBackward, navAppend } = fileSystemNavSlice.actions