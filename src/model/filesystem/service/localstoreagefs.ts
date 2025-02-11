import { BehaviorSubject, filter, map, Subscription } from "rxjs";
import { Directory, ID, Inode } from "../entity";
import { FsService } from "./interface";
import { Mutex } from "async-mutex";

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
    private updates: BehaviorSubject<ID> = new BehaviorSubject<ID>("root")

    constructor() { }

    public getInode(id: ID): Inode | null {
        const inodeStr = localStorage.getItem(`inode/${id}`)
        if (inodeStr == null) {
            return null
        } else {
            return Inode.fromJsonStr(inodeStr)
        }
    }
    public saveInode(value: Inode) {
        value.mtime = new Date().getTime()
        localStorage.setItem(`inode/${value.id}`, value.toJsonStr())
        this.updates.next(value.id)
    }
    public deleteInode(id: ID) {
        localStorage.removeItem(`inode/${id}`)
    }
    public watchInode(value: ID, callback: () => void): Subscription {
        return this.updates.pipe(
            filter((x) => x == value),
            map((_) => callback())
        ).subscribe()
    }
    public watchInodes(ids: Array<ID>, callback: (id: ID) => void): Subscription {
        return this.updates.pipe(
            filter((id) => ids.includes(id)),
            map((id) => callback(id))
        ).subscribe()
    }

    public getKey(key: string): string | null {
        return localStorage.getItem(key);
    }
    public saveKey(key: string, value: string) {
        localStorage.setItem(key, value)
    }
    public deleteKey(key: string) {
        localStorage.removeItem(key)
    }
}

export class LocalStoreFsService implements FsService {
    private mutex = new Mutex();
    private repo: LocalStoreFsServiceRepo;

    constructor() {
        this.repo = new LocalStoreFsServiceRepo()
        // Create root if it does not exists
        const rootInode = this.repo.getInode('root')
        if (rootInode == null || !(rootInode instanceof Directory)) {
            const time: number = new Date().getTime()
            this.repo.saveInode(new Directory('root', 'HOME', time, time, []))
        }
        this._applyExistingAction()
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
        const directoryInode = this.repo.getInode(action.dest);
        if (directoryInode == null) {
            throw new Error('destination_not_found')
        } else {
            if (directoryInode instanceof Directory) {
                if (!directoryInode.children.includes(action.inode.id)) {
                    directoryInode.children.push(action.inode.id)
                    this.repo.saveInode(directoryInode)
                }
            } else {
                throw new Error("invalid_inode_type")
            }
        }

        // Create the Inode
        this.repo.saveInode(action.inode)
    }

    private _applyMv(action: Mv) {
        if (action.srcDir == action.dest) {
            return
        }
        // Verify srcDir, srcInode, dest
        const validFlag = (() => {
            // check if the request has been validated
            const flag = this.repo.getKey("fs/mv/valid")
            return flag != null
        })()
        if (
            validFlag
            ||
            (
                (() => {
                    // check if action.srcDir is a directory which contains srcInode as one of it's children
                    const srcDirInode = this.repo.getInode(action.srcDir);
                    return srcDirInode != null
                        && srcDirInode instanceof Directory
                        && srcDirInode.children.includes(action.srcInode)
                })()
                &&
                (() => {
                    // check if action.dest is a directory
                    const destInode = this.repo.getInode(action.dest)
                    return destInode != null
                        && destInode instanceof Directory
                })()
            )
        ) {
            if (!validFlag) {
                this.repo.saveKey("fs/mv/valid", "t")
            }
            // Remove action.srcInode from action.srcDir
            const srcDirInode = this.repo.getInode(action.srcDir);
            if (srcDirInode instanceof Directory && srcDirInode.children.includes(action.srcInode)) {
                srcDirInode.children = srcDirInode.children.filter((v) => v != action.srcInode)
                this.repo.saveInode(srcDirInode)
            }
            // Add action.srcInode to action.dest
            const destInode = this.repo.getInode(action.dest)
            if (destInode instanceof Directory && !destInode.children.includes(action.srcInode)) {
                destInode.children.push(action.srcInode)
                this.repo.saveInode(destInode)
            }
            this.repo.deleteKey("fs/mv/valid")
        }
    }

    private _applyRename(action: Rename) {
        const inode = this.repo.getInode(action.src)
        if (inode == null) {
            throw new Error("src_does_not_exist")
        } else {
            inode.name = action.name
            this.repo.saveInode(inode)
        }
    }

    private _applyDelete(action: Delete) {
        const repo = this.repo;
        function deleteInodeRec(elementID: ID) {
            const elementInode = repo.getInode(elementID)
            if (elementInode != null) {
                if (elementInode instanceof Directory) {
                    elementInode.children.forEach((v) => deleteInodeRec(v))
                }
                repo.deleteInode(elementID)
            }
        }
        // Remove it from the parent directory children
        const srcDirInode = this.repo.getInode(action.srcDir)
        if (srcDirInode == null) {
            throw new Error("src_dir_not_found")
        } else if (srcDirInode instanceof Directory) {
            if (srcDirInode.children.includes(action.srcInode)) {
                deleteInodeRec(action.srcInode)
                srcDirInode.children = srcDirInode.children.filter((e) => e != action.srcInode)
                this.repo.saveInode(srcDirInode)
            }
        } else {
            throw new Error("src_dir_is_not_a_directory")
        }
    }

    private applyNewAction(action: FsAction): Promise<void> {
        return this.mutex.runExclusive(() => {
            // Start the transaction (by saving the action)
            localStorage.setItem('currentAction', action.toJsonStr())
            // Perform The action
            this._apply(action)
            // End the transaction (by deleting the action)
            localStorage.removeItem('currentAction')
        });
    }

    private _applyExistingAction() {
        this.mutex.runExclusive(() => {
            // Load the action
            const actionStr = localStorage.getItem('currentAction')
            if (actionStr != undefined) {
                const action: FsAction = FsAction.fromJsonStr(actionStr)
                this._apply(action)
                localStorage.removeItem('currentAction')
            }
        })
    }

    getInode(id: ID): Promise<Inode> {
        return this.mutex.runExclusive<Inode>(() => {
            const inode = this.repo.getInode(id)
            return inode == null ? Promise.reject('not_found') : Promise.resolve(inode)
        })
    }
    getDirectoryChildren(id: ID): Promise<Array<Inode>> {
        return this.mutex.runExclusive<Array<Inode>>(() => {
            const inode = this.repo.getInode(id)
            if (inode == null) {
                return Promise.reject('not_found')
            } else if (inode instanceof Directory) {
                try {
                    return Promise.resolve<Array<Inode>>(
                        inode.children.map((v: ID) => {
                            const inodeLocal = this.repo.getInode(v)
                            if (inodeLocal == undefined) {
                                throw new Error('one_or_more_inode_not_found')
                            } else {
                                return inodeLocal
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
        })
    }
    watchInode(id: ID, cb: () => void): Subscription {
        return this.repo.watchInode(id, cb)
    }
    watchInodes(ids: Array<ID>, cb: (id: ID) => void): Subscription {
        return this.repo.watchInodes(ids, cb)
    }
    createInode(dest: ID, value: Inode): Promise<void> {
        return this.applyNewAction(new Mknode(dest, value))
    }
    moveInode(srcDir: ID, srcInode: ID, dest: ID): Promise<void> {
        return this.applyNewAction(new Mv(srcDir, srcInode, dest))
    }
    copyInode(srcDir: ID, srcInode: ID, dest: ID): Promise<void> {
        throw new Error("Method not implemented.");
    }
    renameInode(src: ID, name: string): Promise<void> {
        return this.applyNewAction(new Rename(src, name))
    }
    removeInodeByID(srcDir: ID, srcInode: ID): Promise<void> {
        return this.applyNewAction(new Delete(srcDir, srcInode))
    }
}