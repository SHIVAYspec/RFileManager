import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import { FC, useEffect, useMemo, useState } from "react"
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
import { ContentViewType, setContentViewType, setSearchFilter } from "../../state/slices/theme";
import Tooltip from "@mui/material/Tooltip";
import { BehaviorSubject, debounceTime, map, Subscription } from "rxjs";

export const MenuBar: FC<{}> = () => {
    return <Stack
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
    >
        <Nav />
        <ViewMenuAndSearch />
    </Stack>
}

const Nav: FC<{}> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentDir: string | undefined = useSelector((state: RootState) => state.fileSystemNav.history[state.fileSystemNav.cwdIndex].inode?.name)
    const navBackwardEnabled: boolean = useSelector((state: RootState) => state.fileSystemNav.cwdIndex > 0)
    const navForwardEnabled: boolean = useSelector((state: RootState) => state.fileSystemNav.cwdIndex < state.fileSystemNav.history.length - 1)
    return < Stack
        padding={1}
        gap={1}
        flexDirection={"row"}
        alignItems={"center"}
    >
        <Tooltip title={"Go to Previous Directory"}>
            <IconButton
                disabled={!navBackwardEnabled}
                onClick={() => dispatch(navBackward(null))}
            >
                <ArrowBackIosIcon />
            </IconButton>
        </Tooltip>
        <Tooltip title={"Go to Next Directory"}>
            <IconButton
                disabled={!navForwardEnabled}
                onClick={() => dispatch(navForward(null))}
            >
                <ArrowForwardIosIcon />
            </IconButton>
        </Tooltip>
        <Typography variant="h5" fontWeight={"bold"}>
            {currentDir ?? ""}
        </Typography>
    </Stack >
}

const ViewMenuAndSearch: FC<{}> = () => {
    const dispatch = useDispatch<AppDispatch>()
    const contentViewType: ContentViewType = useSelector((state: RootState) => state.theme.contentViewType)
    return <Stack
        padding={1}
        gap={1}
        flexDirection={"row"}
        alignItems={"center"}
    >
        <Tooltip title={"Large Grid View"}>
            <IconButton
                disabled={contentViewType == ContentViewType.BigGrid}
                onClick={() => {
                    dispatch(setContentViewType(ContentViewType.BigGrid))
                }}
            >
                <AppsIcon />
            </IconButton>
        </Tooltip>
        <Divider orientation="vertical" />
        <Tooltip title={"Small Grid View"}>
            <IconButton
                disabled={contentViewType == ContentViewType.SmallGrid}
                onClick={() => {
                    dispatch(setContentViewType(ContentViewType.SmallGrid))
                }}
            >
                <ViewCompactIcon />
            </IconButton>
        </Tooltip>
        <Divider orientation="vertical" />
        <Tooltip title={"Detailed View"}>
            <IconButton
                disabled={contentViewType == ContentViewType.Detailed}
                onClick={() => {
                    dispatch(setContentViewType(ContentViewType.Detailed))
                }}
            >
                <TableRowsIcon />
            </IconButton>
        </Tooltip>
        <Search />
    </Stack>
}

const Search: FC<{}> = () => {
    const dispatch = useDispatch<AppDispatch>()
    const initialSearchTerm: string = useSelector((state: RootState) => state.theme.searchFilter)

    const [text, setTextValue] = useState<string>("");
    const inputStream: BehaviorSubject<string> = useMemo(() => {
        return new BehaviorSubject(initialSearchTerm)
    }, [])
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTextValue(event.target.value);
        inputStream.next(event.target.value);
    };

    useEffect(() => {
        const sub: Subscription = inputStream.pipe(
            debounceTime(250),
            map((e) => {
                dispatch(setSearchFilter(e))
            })
        ).subscribe()
        return () => {
            sub.unsubscribe()
        }
    }, [text])
    return <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={text}
        onChange={handleChange}
    />
}