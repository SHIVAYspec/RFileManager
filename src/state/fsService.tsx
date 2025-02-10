import { Context, createContext, ReactNode, useContext } from "react";
import { FsService } from "../model/filesystem/service/interface";
import { LocalStoreFsService } from "../model/filesystem/service/localstoreagefs";

const FsServiceCtx: Context<FsService | null> = createContext<FsService | null>(null);

export const ProvideLocalStoreFsService: React.FC<{ children: ReactNode }> = ({ children }) => {
    const fsService = new LocalStoreFsService()
    return (
        <FsServiceCtx.Provider value={fsService} >
            {children}
        </FsServiceCtx.Provider>
    )
}

export function useFsService(): FsService {
    const fsService = useContext(FsServiceCtx)
    if (fsService == null) {
        throw new Error("FsService provider not used")
    } else {
        return fsService
    }
}