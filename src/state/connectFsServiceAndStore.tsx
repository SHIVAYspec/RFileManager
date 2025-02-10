import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useFsService } from "./fsService";
import { FsService } from "../model/filesystem/service/interface";
import { list } from "./slices/fileSystemNav";
import { Subscription } from "rxjs";

export function connect() {
    // FsService
    const fsService: FsService = useFsService();
    // const path: string = useSelector((state: RootState) => {
    //     return state.fileSystemNav.history.reduce((p, c, _i, _a) => `${p}-${c}`)
    // })
    const id: string = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex])
    const dispatch: AppDispatch = useDispatch()
    useEffect(() => {
        const subscription: Subscription = fsService.watchInode(id, () => {
            dispatch(list({ service: fsService, path: id }))
        })
        return () => {
            subscription.unsubscribe()
        }
    })
    useEffect(() => {
        dispatch(list({ service: fsService, path: id }))
    }, [id])
}