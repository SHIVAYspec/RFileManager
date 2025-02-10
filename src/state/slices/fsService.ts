import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit"
import { FsService } from "../../model/filesystem/service/interface"

interface T {
    service: FsService | null
}

const initialState: T = {
    service: null
}

export const fsServiceSlice: Slice<T> = createSlice({
    name: "fsServiceSlice",
    initialState,
    reducers: {
        init: (state, action: PayloadAction<FsService | null>) => {
            state.service = action.payload
        }
    }
})

export const { init } = fsServiceSlice.actions