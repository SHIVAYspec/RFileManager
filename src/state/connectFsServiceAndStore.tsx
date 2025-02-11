import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useFsService } from "./fsService";
import { FsService } from "../model/filesystem/service/interface";
import { addinodeinhistory, list } from "./slices/fileSystemNav";
import { Subscription } from "rxjs";
import { ID } from "../model/filesystem/entity";

export function connect() {
    // Dispatcher
    const dispatch: AppDispatch = useDispatch()
    // FsService
    const fsService: FsService = useFsService();
    // Get Current Working Directory ID
    const cwdID: ID = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex].id)
    // Update Content State as per updates from service
    useEffect(() => {
        const subscription: Subscription = fsService.watchInode(cwdID, () => {
            dispatch(list({ service: fsService, path: cwdID }))
        })
        return () => {
            subscription.unsubscribe()
        }
    })
    // Update Content State as per current working directory in state
    useEffect(() => {
        dispatch(list({ service: fsService, path: cwdID }))
    }, [cwdID])
    // Get Current History
    const history = useSelector((state: RootState) => state.fileSystemNav.history)
    const historyStr = history.map((e => e.id)).reduce((a, b) => `${a}/${b}`)
    // Update history inode metadata as per updates from servicefrom service
    useEffect(() => {
        const subscription: Subscription = fsService.watchInodes(
            history.map((e) => e.id),
            (id) => {
                dispatch(addinodeinhistory({
                    service: fsService,
                    path: id,
                }))
            }
        )
        return () => {
            return subscription.unsubscribe()
        }
    }, [historyStr])
    // Update history inode metadata as per current history
    useEffect(() => {
        history
            .filter((e) => e.inode == undefined)
            .forEach((v) => {
                dispatch(addinodeinhistory({
                    service: fsService,
                    path: v.id,
                }))
            })
    })
}