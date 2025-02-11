import { configureStore } from "@reduxjs/toolkit";
import { fileSystemNavSlice } from "./slices/fileSystemNav";
import { themeSlice } from "./slices/theme";
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
                    'fs/addinodeinhistory/fulfilled'
                ]
            }
        })
    }
})

export default store;

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch