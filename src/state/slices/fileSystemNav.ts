import { createAsyncThunk, createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { ID, Inode } from "../../model/filesystem/entity";
import { FsService } from "../../model/filesystem/service/interface";

export enum ClipboardMode {
    COPY,
    CUT
}

type T = {
    loading: boolean,
    history: Array<{
        id: ID,
        inode?: Inode
    }>
    cwdIndex: number,
    contents: Array<Inode>
    contentsError?: string
    clipboard: Array<ID>
    clipboardMode: ClipboardMode
}


const initialState: T = {
    loading: true,
    history: [{ id: "root" }],
    cwdIndex: 0,
    contents: [],
    contentsError: undefined,
    clipboard: [],
    clipboardMode: ClipboardMode.COPY,
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
            state.history.push({ id: action.payload })
        },
        updateClipboard: (state, action: PayloadAction<{ clipboard: Array<ID>, clipboardMode: ClipboardMode }>) => {
            state.clipboard = action.payload.clipboard
            state.clipboardMode = action.payload.clipboardMode
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
            .addCase(list.rejected, (state, action) => {
                state.contentsError = action.error.message
            })
        // 'fs/addinodeinhistory'
        builder
            .addCase(addinodeinhistory.fulfilled, (state, action: PayloadAction<Inode>) => {
                const historyIndex = state.history.findIndex((value) => value.id == action.payload.id)
                if (historyIndex != -1) {
                    state.history[historyIndex].inode = action.payload
                }
            })
    }
});

export const list = createAsyncThunk('fs/list', async (props: { service: FsService, path: ID }): Promise<Array<Inode>> => {
    return props.service.getDirectoryChildren(props.path)
})

export const addinodeinhistory = createAsyncThunk('fs/addinodeinhistory', async (props: { service: FsService, path: ID }): Promise<Inode> => {
    return props.service.getInode(props.path)
})


export const { navForward, navBackward, navAppend, updateClipboard } = fileSystemNavSlice.actions