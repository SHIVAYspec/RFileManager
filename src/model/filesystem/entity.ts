import { v4 as uuidv4 } from 'uuid';

export enum InodeType {
    Directory,
    File,
    SymbolicLink
}

export type ID = string;

export abstract class Inode {
    constructor(
        public type: InodeType,
        public id: ID,
        public name: string,
        public ctime: number,
        public mtime: number,
    ) { }

    static fromJsonStr(inodeStr: string): Inode {
        const inode: Inode = JSON.parse(inodeStr) as Inode
        switch (inode.type) {
            case InodeType.Directory: {
                const i: Directory = inode as Directory;
                return new Directory(i.id, i.name, i.ctime, i.mtime, i.children)
            }
            case InodeType.File: {
                const i: File = inode as File;
                return new File(i.id, i.name, i.ctime, i.mtime)
            }
            case InodeType.SymbolicLink: {
                const i: SymbolicLink = inode as SymbolicLink;
                return new SymbolicLink(i.id, i.name, i.ctime, i.mtime, i.destinationID)
            }
            default:
                throw new Error('invalid_type')
        }
    }

    toJsonStr(): string {
        return JSON.stringify(this)
    }
}

export class Directory extends Inode {
    constructor(
        id: string,
        name: string,
        ctime: number,
        mtime: number,
        public children: Array<ID>
    ) {
        super(InodeType.Directory, id, name, ctime, mtime)
    }

    static newDefaultDirectory(): Directory {
        const time = new Date().getTime()
        return new Directory(uuidv4(), "New Folder", time, time, [])
    }
}

export class File extends Inode {
    constructor(
        id: string,
        name: string,
        ctime: number,
        mtime: number,
    ) {
        super(InodeType.File, id, name, ctime, mtime)
    }

    static newDefaultFile(): File {
        const time = new Date().getTime()
        return new File(uuidv4(), "New File", time, time)
    }
}

export class SymbolicLink extends Inode {
    constructor(
        id: string,
        name: string,
        ctime: number,
        mtime: number,
        public destinationID: ID,
    ) {
        super(InodeType.SymbolicLink, id, name, ctime, mtime)
    }

    static newDefaultSymbodicLink(destID: ID): SymbolicLink {
        const time = new Date().getTime()
        return new SymbolicLink(uuidv4(), "Link", time, time, destID)
    }
}