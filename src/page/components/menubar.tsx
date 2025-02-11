import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import { FC } from "react"
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import AppsIcon from '@mui/icons-material/Apps';
import TableRowsIcon from '@mui/icons-material/TableRows';
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state/store";
import IconButton from "@mui/material/IconButton";
import { navBackward, navForward } from "../../state/slices/fileSystemNav";

export const MenuBar: FC<{}> = () => {
    const dispatch = useDispatch<AppDispatch>()
    const currentDir: string | undefined = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex].inode?.name)
    const navBackwardEnabled: boolean = useSelector((state: RootState) => state.fileSystemNav.cwdIndex > 0)
    const navForwardEnabled: boolean = useSelector((state: RootState) => state.fileSystemNav.cwdIndex < state.fileSystemNav.history.length - 1)
    return <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
    >
        <Stack
            padding={1}
            gap={1}
            flexDirection={"row"}
            alignItems={"center"}
        >
            <IconButton
                disabled={!navBackwardEnabled}
                onClick={() => dispatch(navBackward(null))}
            >
                <ArrowBackIosIcon />
            </IconButton>
            <IconButton
                disabled={!navForwardEnabled}
                onClick={() => dispatch(navForward(null))}
            >
                <ArrowForwardIosIcon />
            </IconButton>
            <Typography variant="h5" fontWeight={"bold"}>
                {currentDir ?? ""}
            </Typography>
        </Stack>
        <Stack
            padding={1}
            gap={1}
            flexDirection={"row"}
            alignItems={"center"}
        >

            <IconButton>
                <AppsIcon />
            </IconButton>
            <Divider orientation="vertical" />
            <IconButton>
                <ViewCompactIcon />
            </IconButton>
            <Divider orientation="vertical" />
            <IconButton>
                <TableRowsIcon />
            </IconButton>
            <TextField label="Search" variant="outlined" size="small" />
        </Stack>
    </Stack>
}