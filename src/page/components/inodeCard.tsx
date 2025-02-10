import { FC, useState } from "react";
import { Inode, InodeType } from "../../model/filesystem/entity";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import Typography from "@mui/material/Typography";

const iconDim = 100;

export const InodeCard: FC<{ inode: Inode }> = ({ inode }) => {
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
            "&:hover": {
                background: (theme) => theme.palette.primary.dark,
            }
        }}
        onContextMenu={handleContextMenu}
    >
        <CardMedia>
            <InodeCardIcon inodeType={inode.type} />
        </CardMedia>
        <Typography align="center"> {inode.name} </Typography>
        <InodeCardContextMenu
            isOpen={isOpen}
            anchorEl={anchorEl}
            handleClose={handleClose}
        />
    </Card>
}

const InodeCardContextMenu: FC<{
    isOpen: boolean,
    anchorEl: HTMLElement | null
    handleClose: () => void
}> = ({ isOpen, anchorEl, handleClose }) => {
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