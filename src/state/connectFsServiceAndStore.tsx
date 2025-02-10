import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useFsService } from "./fsService";
import { FsService } from "../model/filesystem/service/interface";
import { list } from "./slices/fileSystemNav";

export function connect() {
    // FsService
    const fsService: FsService = useFsService();
    // const path: string = useSelector((state: RootState) => {
    //     return state.fileSystemNav.history.reduce((p, c, _i, _a) => `${p}-${c}`)
    // })
    const id: string = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex])
    const [refreshFlag, setRefreshFlag] = useState<number>(0)
    useEffect(() => {
        const docID = id;
        const watchID = fsService.watchInode(docID, () => {
            setRefreshFlag((state) => state + 1)
        })
        return () => {
            fsService.unWatchInode(docID, watchID)
        }
    })
    const dispatch: AppDispatch = useDispatch()
    useEffect(() => {
        dispatch(list({ service: fsService, path: id }))
    }, [id, refreshFlag])
}