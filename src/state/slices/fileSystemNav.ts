import { createAsyncThunk, createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { ID, Inode, InodeType, SymbolicLink } from "../../model/filesystem/entity";
import { FsService } from "../../model/filesystem/service/interface";

export enum ClipboardMode {
    COPY,
    CUT
}

export interface Clipboard {
    mode: ClipboardMode,
    parentDir: ID,
    src: ID,
}

interface T {
    loading: boolean,
    history: Array<{
        id: ID,
        inode?: Inode,
        error?: string,
    }>
    cwdIndex: number,
    contents: Array<Inode>
    contentsError?: string
    clipboard?: Clipboard
}


const initialState: T = {
    loading: true,
    history: [{ id: "root" }],
    cwdIndex: 0,
    contents: [],
    contentsError: undefined,
    clipboard: undefined,
}

export const fileSystemNavSlice: Slice<T> = createSlice({
    name: 'fileSystemNavSlice',
    initialState,
    reducers: {
        navForward: (state) => {
            state.contents = [];
            state.contentsError = undefined
            if (state.cwdIndex != state.history.length - 1) {
                state.cwdIndex++
            }
        },
        navBackward: (state) => {
            state.contents = [];
            state.contentsError = undefined
            if (state.cwdIndex != 0) {
                state.cwdIndex--
            }
        },
        navAppend: (state, action: PayloadAction<ID>) => {
            state.contents = [];
            state.contentsError = undefined
            // slice the array if cwdIndex is not the last index of history array
            if (state.cwdIndex != state.history.length - 1) {
                state.history = state.history.slice(0, state.cwdIndex + 1)
                state.cwdIndex = ++state.cwdIndex
            } else {
                state.cwdIndex = ++state.cwdIndex
            }
            state.history.push({ id: action.payload })
        },
        setCwdIndex: (state, action: PayloadAction<number>) => {
            state.contents = [];
            state.contentsError = undefined
            if (action.payload < state.history.length) {
                state.cwdIndex = action.payload
            }
        },
        updateClipboard: (state, action: PayloadAction<Clipboard | undefined>) => {
            state.clipboard = action.payload
        },
    },
    extraReducers: (builder) => {
        // 'fs/list'
        builder
            .addCase(list.pending, (state) => {
                state.loading = true
                state.contentsError = undefined
                state.contents = []
            })
            .addCase(list.fulfilled, (state, action) => {
                state.contents = action.payload
                state.loading = false
            })
            .addCase(list.rejected, (state, action) => {
                state.contentsError = action.error.message
                state.loading = false
            })
        // 'fs/addinodeinhistory'
        builder
            .addCase(addinodeinhistory.fulfilled, (state, action: PayloadAction<Inode | ID>) => {
                if (action.payload instanceof Inode) {
                    const inode: Inode = action.payload
                    const historyIndex = state.history.findIndex((value) => value.id == inode.id)
                    if (historyIndex != -1) {
                        state.history[historyIndex].inode = inode
                    }
                } else if (typeof action.payload == "string") {
                    const id: ID = action.payload
                    const historyIndex = state.history.findIndex((value) => value.id == id)
                    if (historyIndex != -1) {
                        state.history[historyIndex].inode = undefined
                    }
                }
            })
        // 'fs/updateInodeInContents'
        builder
            .addCase(updateInodeInContents.fulfilled, (state, action: PayloadAction<Inode>) => {
                const contentIndex = state.contents.findIndex((value) => value.id == action.payload.id)
                if (contentIndex != -1) {
                    state.contents[contentIndex] = action.payload
                }
            })
    }
});

export const list = createAsyncThunk('fs/list', async ({ service, pathInode }: { service: FsService, pathInode: Inode }): Promise<Array<Inode>> => {
    if (pathInode.type == InodeType.Directory) {
        return service.getDirectoryChildren(pathInode.id)
    } else if (pathInode.type == InodeType.SymbolicLink && pathInode instanceof SymbolicLink) {
        return service.getDirectoryChildren(pathInode.destinationID)
    } else {
        throw 'invalid_inode_type'
    }
})

export const addinodeinhistory = createAsyncThunk('fs/addinodeinhistory', async (props: { service: FsService, path: ID }): Promise<Inode | ID> => {
    try {
        return await props.service.getInode(props.path)
    } catch (error) {
        return props.path
    }
})

export const updateInodeInContents = createAsyncThunk('fs/updateInodeInContents', async (props: { service: FsService, id: ID }): Promise<Inode> => {
    return props.service.getInode(props.id)
})


export const { navForward, navBackward, navAppend, updateClipboard, setCwdIndex } = fileSystemNavSlice.actions