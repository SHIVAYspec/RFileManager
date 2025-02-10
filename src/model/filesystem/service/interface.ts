import { ID, Inode } from "../entity";

export interface FsService {
    // Read
    getInode(id: ID): Promise<Inode>,
    getDirectoryChildren(id: ID): Promise<Array<Inode>>,
    // Watch
    watchInode(id: ID, cb: () => void): string,
    unWatchInode(id: ID, watchID: string): void,
    // Create
    createInode(dest: ID, value: Inode): Promise<void>
    // Update
    moveInode(srcDir: ID, srcInode: ID, dest: ID): Promise<void>,
    renameInode(src: ID, name: string): Promise<void>
    // Delete
    removeInodeByID(srcDir: ID, srcInode: ID): Promise<void>,
}