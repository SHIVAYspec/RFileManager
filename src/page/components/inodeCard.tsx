import { FC, useState } from "react";
import { ID, Inode, InodeType, SymbolicLink } from "../../model/filesystem/entity";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state/store";
import { ClipboardMode, navAppend, updateClipboard } from "../../state/slices/fileSystemNav";
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFsService } from "../../state/fsService";
import { FsService } from "../../model/filesystem/service/interface";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

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
        onDoubleClick={() => {
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
    const dispatch = useDispatch<AppDispatch>();
    const fsService: FsService = useFsService()
    const cwdID: ID = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex].id)

    const [open, setOpen] = useState<boolean>(false);
    const [text, setText] = useState<string>(inode.name);

    return <>
        <Dialog open={open} onClose={() => { setOpen(false) }}>
            <DialogTitle>Rename</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="New Name"
                    fullWidth
                    variant="outlined"
                    value={text}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setText(event.target.value)
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setOpen(false)
                    setText(inode.name)
                }} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => {
                    setOpen(false)
                    fsService.renameInode(inode.id, text);
                }} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
        <Menu
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
                setOpen(true);
            }}>
                <ListItemIcon>
                    <DriveFileRenameOutlineIcon />
                </ListItemIcon>
                Rename
            </MenuItem>
            <MenuItem onClick={() => {
                fsService.removeInodeByID(cwdID, inode.id).then(() => {
                    handleClose();
                })
            }}>
                <ListItemIcon>
                    <DeleteIcon />
                </ListItemIcon>
                Delete
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => {
                dispatch(updateClipboard({
                    mode: ClipboardMode.CUT,
                    parentDir: cwdID,
                    src: inode.id
                }))
                handleClose();
            }}>
                <ListItemIcon>
                    <ContentCutIcon />
                </ListItemIcon>
                Cut
            </MenuItem>
            <MenuItem onClick={() => {
                dispatch(updateClipboard({
                    mode: ClipboardMode.COPY,
                    parentDir: cwdID,
                    src: inode.id,
                }))
                handleClose();
            }}>
                <ListItemIcon>
                    <ContentCopyIcon />
                </ListItemIcon>
                Copy
            </MenuItem>
        </Menu>
    </>
}

const iconSx = {
    height: iconDim,
    width: "100%",
}

const InodeCardIcon: FC<{ inodeType: InodeType }> = ({ inodeType }) => {
    switch (inodeType) {
        case InodeType.Directory:
            return <FolderIcon color={"info"} sx={iconSx} />
        case InodeType.File:
            return <InsertDriveFileIcon sx={iconSx} />
        case InodeType.SymbolicLink:
            return <ShortcutIcon sx={iconSx} />
        default:
            return <QuestionMarkIcon sx={iconSx} />
    }
}