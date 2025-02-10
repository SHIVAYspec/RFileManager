import { FC, useState } from "react";
import { Directory, Inode, InodeType } from "../../model/filesystem/entity";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ListItemIcon from "@mui/material/ListItemIcon";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import Divider from "@mui/material/Divider";
import { FsService } from "../../model/filesystem/service/interface";
import { useFsService } from "../../state/fsService";

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
            <ContextMenu
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
                {contents.map((e) => <InodeCard key={e.id} inode={e} />)}
            </Stack>
            <ContextMenu
                isOpen={isOpen}
                anchorEl={anchorEl}
                handleClose={handleClose}
            />
        </Stack>
    }
}

const ContextMenu: FC<{
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

const iconDim = 100;

const InodeCard: FC<{ inode: Inode }> = ({ inode }) => {
    return <Card
        variant="outlined"
        sx={{
            width: iconDim,
            background: (theme) => theme.palette.primary.dark
        }}
    >
        <CardMedia>
            <InodeCardIcon inodeType={inode.type} />
        </CardMedia>
        <Typography align="center"> {inode.name} </Typography>
    </Card>
}

const iconSx = {
    height: iconDim,
    width: "100%",
}

const InodeCardIcon: FC<{ inodeType: InodeType }> = ({ inodeType }) => {
    switch (inodeType) {
        case InodeType.Directory:
            return <FolderIcon sx={iconSx} />
        case InodeType.File:
            return <InsertDriveFileIcon sx={iconSx} />
        case InodeType.SymbolicLink:
            return <ShortcutIcon sx={iconSx} />
        default:
            return <QuestionMarkIcon sx={iconSx} />
    }
}