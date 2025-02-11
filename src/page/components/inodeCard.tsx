import { FC, useState } from "react";
import { Inode, InodeType, SymbolicLink } from "../../model/filesystem/entity";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state/store";
import { navAppend } from "../../state/slices/fileSystemNav";
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ListItemIcon from "@mui/material/ListItemIcon";
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { Divider } from "@mui/material";

const iconDim = 100;

export const InodeCard: FC<{ inode: Inode }> = ({ inode }) => {
    const dispatch = useDispatch<AppDispatch>()

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const isOpen: boolean = Boolean(anchorEl)
    const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    return <Card
        variant="outlined"
        sx={{
            width: iconDim,
            background: (theme) => theme.palette.primary.light,
            "&:hover": {
                background: (theme) => theme.palette.primary.dark,
            }
        }}
        onContextMenu={handleContextMenu}
        onClick={() => {
            switch (inode.type) {
                case InodeType.Directory:
                    dispatch(navAppend(inode.id))
                    return
                case InodeType.SymbolicLink:
                    if (inode instanceof SymbolicLink) {
                        dispatch(navAppend(inode.destinationID))
                    }
            }
        }}
    >
        <CardMedia>
            <InodeCardIcon inodeType={inode.type} />
        </CardMedia>
        <Typography align="center"> {inode.name} </Typography>
        <InodeCardContextMenu
            inode={inode}
            isOpen={isOpen}
            anchorEl={anchorEl}
            handleClose={handleClose}
        />
    </Card>
}

const InodeCardContextMenu: FC<{
    inode: Inode,
    isOpen: boolean,
    anchorEl: HTMLElement | null
    handleClose: () => void
}> = ({ inode, isOpen, anchorEl, handleClose }) => {
    return <Menu
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
            horizontal: "left",
            vertical: "top"
        }}
    >
        <MenuItem disabled={true}>
            {inode.name}
        </MenuItem>
        <Divider />

        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <DriveFileRenameOutlineIcon />
            </ListItemIcon>
            Rename
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <ContentCutIcon />
            </ListItemIcon>
            Cut
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <ContentCopyIcon />
            </ListItemIcon>
            Copy
        </MenuItem>
    </Menu>
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