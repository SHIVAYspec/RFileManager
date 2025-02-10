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
        public name: string
    ) { }

    static fromJsonStr(inodeStr: string): Inode {
        const inode: Inode = JSON.parse(inodeStr) as Inode
        switch (inode.type) {
            case InodeType.Directory: {
                const i: Directory = inode as Directory;
                return new Directory(i.id, i.name, i.children)
            }
            case InodeType.File: {
                const i: File = inode as File;
                return new File(i.id, i.name)
            }
            case InodeType.SymbolicLink: {
                const i: SymbolicLink = inode as SymbolicLink;
                return new SymbolicLink(i.id, i.name, i.destinationID)
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
        public children: Array<ID>
    ) {
        super(InodeType.Directory, id, name)
    }

    static newDefaultDirectory(): Directory {
        return new Directory(uuidv4(), "New Folder", [])
    }
}

export class File extends Inode {
    constructor(
        id: string = uuidv4(),
        name: string
    ) {
        super(InodeType.File, id, name)
    }

    static newDefaultFile(): File {
        return new File(uuidv4(), "New File")
    }
}

export class SymbolicLink extends Inode {
    constructor(
        id: string = uuidv4(),
        name: string,
        public destinationID: ID
    ) {
        super(InodeType.SymbolicLink, id, name)
    }
}