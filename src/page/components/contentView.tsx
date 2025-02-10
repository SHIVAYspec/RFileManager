import { FC, useState } from "react";
import { useSelector } from "react-redux";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ListItemIcon from "@mui/material/ListItemIcon";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import Divider from "@mui/material/Divider";
import { Directory, Inode } from "../../model/filesystem/entity";
import { RootState } from "../../state/store";
import { FsService } from "../../model/filesystem/service/interface";
import { useFsService } from "../../state/fsService";
import { InodeCard } from "./inodeCard";

export const ContenteView: FC<{}> = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const isOpen: boolean = Boolean(anchorEl)
    const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const contents: Array<Inode> = useSelector((state: RootState) => state.fileSystemNav.contents)
    if (contents.length == 0) {
        return <Stack
            onContextMenu={handleContextMenu}
            width="100%" height="100%"
            alignItems={"center"} justifyContent={"center"}>
            <ContentViewContextMenu
                isOpen={isOpen}
                anchorEl={anchorEl}
                handleClose={handleClose}
            />
            <Typography variant="h1">EMPTY</Typography>
        </Stack>
    } else {
        return <Stack
            onContextMenu={handleContextMenu}
            width="100%" height="100%"
        >
            <Stack
                padding={1}
                gap={1}
                direction={"row"}
                flexWrap={"wrap"}
                justifyContent={"flex-start"}
                alignItems={"start"}
            >
                {contents.map((e) => <InodeCard
                    key={e.id}
                    inode={e}
                />)}
            </Stack>
            <ContentViewContextMenu
                isOpen={isOpen}
                anchorEl={anchorEl}
                handleClose={handleClose}
            />
        </Stack>
    }
}

const ContentViewContextMenu: FC<{
    isOpen: boolean,
    anchorEl: HTMLElement | null
    handleClose: () => void
}> = ({ isOpen, anchorEl, handleClose }) => {
    const fsService: FsService = useFsService()
    const fm: string = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex])
    return <Menu
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
            horizontal: "left",
            vertical: "top"
        }}
    >
        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <ContentPasteIcon />
            </ListItemIcon>
            Paste
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
            handleClose();
            fsService.createInode(
                fm,
                Directory.newDefaultDirectory()
            )
        }}>
            <ListItemIcon>
                <CreateNewFolderIcon />
            </ListItemIcon>
            New Folder
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <NoteAddIcon />
            </ListItemIcon>
            New File
        </MenuItem>
    </Menu>
}