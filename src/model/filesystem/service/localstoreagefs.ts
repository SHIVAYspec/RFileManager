import { Directory, ID, Inode } from "../entity";
import { FsService } from "./interface";
import { v4 as uuidv4 } from 'uuid';

enum FsActionType {
    MKNODE,
    MV,
    RENAME,
    DELETE,
}

abstract class FsAction {
    constructor(public type: FsActionType) { }

    static fromJsonStr(actionstr: string): FsAction {
        const action: FsAction = JSON.parse(actionstr) as FsAction
        switch (action.type) {
            case FsActionType.MKNODE: {
                const act = action as Mknode;
                return new Mknode(
                    act.dest,
                    Inode.fromJsonStr(JSON.stringify(act.inode))
                )
            }
            case FsActionType.MV: {
                const act = action as Mv;
                return new Mv(act.srcDir, act.srcInode, act.dest)
            }
            case FsActionType.RENAME: {
                const act = action as Rename;
                return new Rename(act.src, act.name)
            }
            case FsActionType.DELETE: {
                const act = action as Delete;
                return new Delete(act.srcDir, act.srcInode)
            }
            default:
                return action
        }
    }

    toJsonStr(): string {
        return JSON.stringify(this)
    }
}

class Mknode extends FsAction {
    constructor(
        public dest: ID,
        public inode: Inode
    ) {
        super(FsActionType.MKNODE)
    }
}

class Mv extends FsAction {
    constructor(
        public srcDir: ID,
        public srcInode: ID,
        public dest: ID
    ) {
        super(FsActionType.MV)
    }
}

class Rename extends FsAction {
    constructor(
        public src: ID,
        public name: string
    ) {
        super(FsActionType.RENAME)
    }
}

class Delete extends FsAction {
    constructor(
        public srcDir: ID,
        public srcInode: ID
    ) {
        super(FsActionType.DELETE)
    }
}

class LocalStoreFsServiceRepo {
    constructor() { }
    public getInode(id: ID): Inode | null {
        const inodeStr = localStorage.get(`inode/${id}`)
        if (inodeStr == null) {
            return null
        } else {
            return Inode.fromJsonStr(inodeStr)
        }
    }
    public saveInode(value: Inode) {
        localStorage.set(`inode/${value.id}`, value.toJsonStr())
    }
}

export class LocalStoreFsService implements FsService {
    private lock: boolean = false;
    private watchCB: (store: StorageEvent) => void;

    constructor() {
        {
            const rootStr = localStorage.getItem('inode/root')
            if (rootStr == undefined || !(Inode.fromJsonStr(rootStr) instanceof Directory)) {
                localStorage.setItem('inode/root', new Directory('root', "HOME", []).toJsonStr())
            }
        }
        this._applyExistingAction()
        // start watcher
        this.watchCB = (event: StorageEvent) => {
            if (event.key?.startsWith('inode/')) {
                const key = event.key?.slice('inode/'.length, event.key?.length - 1)
                this.notify(key)
            }
        }
        window.addEventListener('storage', this.watchCB)
    }

    private Lock() {
        // Acquire the lock
        if (this.lock) {
            throw new Error("already_locked")
        }
        this.lock = true;
    }
    private Unlock() {
        if (!this.lock) {
            throw new Error("already_unlocked")
        }
        this.lock = false;
    }

    private _apply(action: FsAction) {
        if (action instanceof Mknode) {
            this._applyMknode(action)
        } else if (action instanceof Mv) {
            this._applyMv(action)
        } else if (action instanceof Rename) {
            this._applyRename(action)
        } else if (action instanceof Delete) {
            this._applyDelete(action)
        } else {
            throw new Error("unown_action")
        }
    }

    private _applyMknode(action: Mknode) {
        // Update the directory children
        const directoryStr = localStorage.getItem(`inode/${action.dest}`)
        if (directoryStr == undefined) {
            throw new Error('destination_not_found')
        } else {
            const directory: Inode = Inode.fromJsonStr(directoryStr)
            if (directory instanceof Directory) {
                if (!directory.children.includes(action.inode.id)) {
                    directory.children.push(action.inode.id);
                    localStorage.setItem(
                        `inode/${action.dest}`,
                        directory.toJsonStr()
                    );
                }
            } else {
                throw new Error("invalid_inode_type")
            }
        }
        // Create the Inode
        localStorage.setItem(
            `inode/${action.inode.id}`,
            action.inode.toJsonStr()
        )
    }

    private _applyMv(action: Mv) {
        // Verify srcDir, srcInode, dest
        const validFlag = (() => {
            // check if the request has been validated
            const flag = localStorage.getItem("fs/mv/valid")
            return flag != undefined
        })()
        if (
            validFlag
            ||
            (
                (() => {
                    // check if action.srcDir is a directory which contains srcInode as one of it's children
                    const srcDirStr = localStorage.getItem(`inode/${action.srcDir}`)
                    if (srcDirStr != undefined) {
                        const srcDir: Inode = Inode.fromJsonStr(srcDirStr);
                        return (srcDir instanceof Directory && srcDir.children.includes(action.srcInode))
                    } else {
                        return false
                    }
                })()
                &&
                (() => {
                    // check if action.dest is a directory
                    const destStr = localStorage.getItem(`inode/${action.srcDir}`)
                    if (destStr != undefined) {
                        const dest: Inode = Inode.fromJsonStr(destStr)
                        return (dest instanceof Directory)
                    } else {
                        return false
                    }
                })()
            )
        ) {
            if (!validFlag) {
                localStorage.setItem("fs/mv/valid", "t")
            }
            // Remove action.srcInode from action.srcDir
            const srcDirStr = localStorage.getItem(`inode/${action.srcDir}`)
            if (srcDirStr != undefined) {
                const srcDir: Inode = Inode.fromJsonStr(srcDirStr)
                if (srcDir instanceof Directory && srcDir.children.includes(action.srcInode)) {
                    srcDir.children = srcDir.children.filter((v) => v != action.srcInode)
                    localStorage.setItem(`inode/${action.srcDir}`, srcDir.toJsonStr())
                }
            }
            // Add action.srcInode to action.dest
            const destStr = localStorage.getItem(`inode/${action.dest}`)
            if (destStr != undefined) {
                const dest: Inode = Inode.fromJsonStr(destStr)
                if (dest instanceof Directory && !dest.children.includes(action.srcInode)) {
                    dest.children.push(action.srcInode)
                    localStorage.setItem(`inode/${action.dest}`, dest.toJsonStr())
                }
            }
            localStorage.removeItem("fs/mv/valid")
        }
    }

    private _applyRename(action: Rename) {
        const inodeStr = localStorage.getItem(`inode/${action.src}`)
        if (inodeStr == undefined) {
            throw new Error("src_does_not_exist")
        } else {
            const inode: Inode = Inode.fromJsonStr(inodeStr)
            inode.name = action.name
            localStorage.setItem(`inode/${action.src}`, inode.toJsonStr())
        }
    }

    private _applyDelete(action: Delete) {
        function removeDir(elementID: ID) {
            const elementStr = localStorage.getItem(`inode/${elementID}`)
            if (elementStr != undefined) {
                const inode: Inode = Inode.fromJsonStr(elementStr)
                if (inode instanceof Directory) {
                    inode.children.forEach((v) => removeDir(v))
                }
                localStorage.removeItem(`inode/${elementID}`)
            }
        }
        // Remove it from the parent directory children
        const srcDirStr = localStorage.getItem(`inode/${action.srcDir}`)
        if (srcDirStr == undefined) {
            throw new Error("src_dir_not_found")
        } else {
            const srcDir: Inode = Inode.fromJsonStr(srcDirStr)
            if (srcDir instanceof Directory) {
                if (srcDir.children.includes(action.srcInode)) {
                    // Delete Inodes recursively
                    removeDir(action.srcInode)
                }
            } else {
                throw new Error("src_dir_is_not_a_directory")
            }
        }
    }

    private applyNewAction(action: FsAction) {
        // Get the lock (for mutation)
        this.Lock()
        // Start the transaction (by saving the action)
        localStorage.setItem(
            'currentAction',
            action.toJsonStr()
        )
        // Perform The action
        this._apply(action)
        // End the transaction (by deleting the action)
        localStorage.removeItem('currentAction')
        // Unlock
        this.Unlock()
    }

    private _applyExistingAction() {
        this.Lock()
        // Load the action
        const actionStr = localStorage.getItem('currentAction')
        if (actionStr != undefined) {
            const action: FsAction = FsAction.fromJsonStr(actionStr)
            this._apply(action)
            localStorage.removeItem('currentAction')
        }
        this.Unlock()
        return
    }

    getInode(id: ID): Promise<Inode> {
        const inodeStr = localStorage.getItem(`inode/${id}`)
        if (inodeStr != undefined) {
            const inode: Inode = Inode.fromJsonStr(inodeStr)
            return Promise.resolve(inode)
        } else {
            return Promise.reject('not_found')
        }
    }
    getDirectoryChildren(id: ID): Promise<Array<Inode>> {
        const inodeStr = localStorage.getItem(`inode/${id}`)
        if (inodeStr != undefined) {
            const inode: Inode = Inode.fromJsonStr(inodeStr)
            if (inode instanceof Directory) {
                try {
                    return Promise.resolve<Array<Inode>>(
                        inode.children.map((v: ID) => {
                            const inodeStrLocal = localStorage.getItem(`inode/${v}`)
                            if (inodeStrLocal == undefined) {
                                throw new Error('one_or_more_inode_not_found')
                            } else {
                                return Inode.fromJsonStr(inodeStrLocal)
                            }
                        })
                    )
                } catch (err) {
                    if (err instanceof Error) {
                        return Promise.reject(err.message)
                    } else {
                        return Promise.reject("unknown_error")
                    }
                }
            } else {
                return Promise.reject('invalid_inode_type')
            }
        } else {
            return Promise.reject('not_found')
        }
    }
    private underWatch = new Map<string, Map<string, () => void>>()
    notify(id: ID): void {
        console.log(`update : ${id}`)
        const cbs = this.underWatch.get(id)
        if (cbs != null) {
            cbs.forEach((v, _k, _m) => v())
        }
    }
    watchInode(id: ID, cb: () => void): string {
        const watchID = uuidv4()
        console.log(`Watch Start : ${id} - ${watchID}`) // debug
        const cbs = this.underWatch.get(id)
        if (cbs == null) {
            const t: Map<string, () => void> = new Map();
            t.set(watchID, cb)
            this.underWatch.set(id, t)
        } else {
            cbs.set(watchID, cb)
        }
        return watchID
    }
    unWatchInode(id: ID, watchID: string): void {
        console.log(`Watch End : ${id} - ${watchID}`) // debug
        const cbs = this.underWatch.get(id)
        if (cbs != null) {
            cbs.delete(watchID)
        }
    }
    createInode(dest: ID, value: Inode): Promise<void> {
        this.applyNewAction(new Mknode(dest, value))
        return Promise.resolve()
    }
    moveInode(srcDir: ID, srcInode: ID, dest: ID): Promise<void> {
        this.applyNewAction(new Mv(srcDir, srcInode, dest))
        return Promise.resolve()
    }
    renameInode(src: ID, name: string): Promise<void> {
        this.applyNewAction(new Rename(src, name))
        return Promise.resolve()
    }
    removeInodeByID(srcDir: ID, srcInode: ID): Promise<void> {
        this.applyNewAction(new Delete(srcDir, srcInode))
        return Promise.resolve()
    }
}