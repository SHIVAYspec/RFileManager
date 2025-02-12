import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useFsService } from "./fsService";
import { FsService } from "../model/filesystem/service/interface";
import { addinodeinhistory, list, updateInodeInContents } from "./slices/fileSystemNav";
import { Subscription } from "rxjs";

export function connect() {
    // Dispatcher
    const dispatch: AppDispatch = useDispatch()
    // FsService
    const fsService: FsService = useFsService();

    // Get Current Working Directory ID
    const cwdMeta = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex])
    // Update Content State
    useEffect(() => {
        if (cwdMeta.inode != undefined || cwdMeta.inode != undefined) {
            const updateContents = () => {
                if (cwdMeta.inode != undefined) {
                    dispatch(list({ service: fsService, pathInode: cwdMeta.inode }))
                }
            }
            // Update Content State as per current working directory in state
            updateContents()
            // Update Content State as per updates from service
            const subscription: Subscription = fsService.watchInode(cwdMeta.id, () => {
                updateContents()
            })
            return () => {
                subscription.unsubscribe()
            }
        }
    }, [cwdMeta])

    // Get Current Content
    const contents = useSelector((state: RootState) => state.fileSystemNav.contents).map((e) => e.id)
    useEffect(() => {
        const subscription: Subscription = fsService.watchInodes(
            contents,
            (id) => {
                dispatch(updateInodeInContents({
                    service: fsService,
                    id: id,
                }))
            }
        )
        return () => {
            return subscription.unsubscribe()
        }
    }, [contents.length == 0 ? "" : contents.reduce((a, b) => `${a}/${b}`)])

    // Get Current History
    const history = useSelector((state: RootState) => state.fileSystemNav.history)
    // Update history inode metadata as per current history
    useEffect(() => {
        history
            .filter((e) => e.inode == undefined && e.error == undefined)
            .forEach((e) => {
                dispatch(addinodeinhistory({
                    service: fsService,
                    path: e.id,
                }))
            })
    }, [history.map<boolean>((e) => e.inode == undefined && e.error == undefined).map<string>((e: boolean) => e ? 't' : 'f').reduce((a, b) => `${a}-${b}`)])
    // Update history inode metadata as per updates from service
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
    }, [history.map<string>((e) => e.id).reduce((a, b) => `${a}-${b}`)])
}