import { FC, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import ListItemIcon from "@mui/material/ListItemIcon";
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import SortIcon from '@mui/icons-material/Sort';
import { Directory, File, Inode } from "../../model/filesystem/entity";
import { AppDispatch, RootState } from "../../state/store";
import { FsService } from "../../model/filesystem/service/interface";
import { useFsService } from "../../state/fsService";
import { InodeCard } from "./inodeCard";
import { setSortingOrder, SortingOrder, SortingType } from "../../state/slices/theme";

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
    const searchFilter: string = useSelector((state: RootState) => state.theme.searchFilter)
    const sortingType: SortingType = useSelector((state: RootState) => state.theme.sortingType)
    const sortingOrder: SortingOrder = useSelector((state: RootState) => state.theme.sortingOrder)
    const filteredContents: Array<Inode> = useMemo(() => {
        const c = contents
            .filter((e) => e.name.toLowerCase().includes(searchFilter.toLowerCase()))
            .sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        switch (sortingOrder) {
            case SortingOrder.ASCENDING:
                return c;
            case SortingOrder.DESCENDING:
                return c.reverse();
        }
    }, [contents, searchFilter, sortingType, sortingOrder])

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
            sx={{
                overflow: "auto"
            }}
        >
            <Stack
                padding={1}
                gap={1}
                direction={"row"}
                flexWrap={"wrap"}
                justifyContent={"flex-start"}
                alignItems={"start"}
            >
                {filteredContents
                    .map((e) => <InodeCard
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
    const dispatch = useDispatch<AppDispatch>();
    const sortingOrder: SortingOrder = useSelector((state: RootState) => state.theme.sortingOrder)
    const fsService: FsService = useFsService()
    const cwdID: string = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex].id)
    const clipboard: Array<string> = useSelector((state: RootState) => state.fileSystemNav.clipboard)
    return <Menu
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
            horizontal: "left",
            vertical: "top"
        }}
    >
        <MenuItem disabled={clipboard.length == 0} onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <ContentPasteIcon />
            </ListItemIcon>
            Paste
        </MenuItem>
        <MenuItem disabled={clipboard.length == 0} onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <ShortcutIcon />
            </ListItemIcon>
            Paste Shortcut
        </MenuItem>

        <Divider />

        <MenuItem disabled={true}>
            New
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose();
            fsService.createInode(
                cwdID,
                Directory.newDefaultDirectory()
            )
        }}>
            <ListItemIcon>
                <CreateNewFolderIcon />
            </ListItemIcon>
            Folder
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose();
            fsService.createInode(
                cwdID,
                File.newDefaultFile()
            )
        }}>
            <ListItemIcon>
                <NoteAddIcon />
            </ListItemIcon>
            File
        </MenuItem>

        <Divider />

        <MenuItem disabled={true}>
            Sort Type
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <SortByAlphaIcon />
            </ListItemIcon>
            Name
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <AccessTimeIcon />
            </ListItemIcon>
            Create Time
        </MenuItem>
        <MenuItem onClick={() => {
            handleClose();
        }}>
            <ListItemIcon>
                <MoreTimeIcon />
            </ListItemIcon>
            Last Modified Time
        </MenuItem>

        <Divider />

        <MenuItem disabled={true}>
            Sort Order
        </MenuItem>
        <MenuItem
            disabled={sortingOrder == SortingOrder.ASCENDING}
            onClick={() => {
                handleClose();
                dispatch(setSortingOrder(SortingOrder.ASCENDING));
            }}>
            <ListItemIcon>
                <MoreTimeIcon />
            </ListItemIcon>
            Ascending
        </MenuItem>
        <MenuItem
            disabled={sortingOrder == SortingOrder.DESCENDING}
            onClick={() => {
                handleClose();
                dispatch(setSortingOrder(SortingOrder.DESCENDING));
            }}>
            <ListItemIcon>
                <SortIcon />
            </ListItemIcon>
            Descending
        </MenuItem>
    </Menu>
}