import { configureStore, createSelector } from "@reduxjs/toolkit";
import { fileSystemNavSlice } from "./slices/fileSystemNav";
import { themeSlice } from "./slices/theme";
import { InodeType, SymbolicLink } from "../model/filesystem/entity";
// import { fsServiceSlice } from "./slices/fsService";

const store = configureStore({
    reducer: {
        theme: themeSlice.reducer,
        // fsService: fsServiceSlice.reducer,
        fileSystemNav: fileSystemNavSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoredPaths: ['fileSystemNav'],
                ignoredActions: [
                    'fs/list/fulfilled',
                    'fs/addinodeinhistory/fulfilled',
                    'fs/updateInodeInContents/fulfilled'
                ]
            }
        })
    }
})

export default store;

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export const useCwdDirID = createSelector(
    [(state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex]],
    (cwdMeta) => {
        if (cwdMeta.inode == undefined) {
            return undefined
        } else {
            switch (cwdMeta.inode.type) {
                case InodeType.Directory:
                    return cwdMeta.inode.id;
                case InodeType.SymbolicLink:
                    if (cwdMeta.inode instanceof SymbolicLink) {
                        return cwdMeta.inode.destinationID
                    }
            }
        }
    }
)