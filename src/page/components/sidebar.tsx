import { QuestionMark } from "@mui/icons-material"
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { FC } from "react"
import { AppDispatch, RootState } from "../../state/store"
import { useDispatch, useSelector } from "react-redux"
import { InodeCardIcon } from "./inodeCard"
import { setCwdIndex } from "../../state/slices/fileSystemNav"

export const Sidebar: FC<{}> = () => {
    return <Stack padding={1}>
        <History />
        <Divider />
    </Stack>
}

const History: FC<{}> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const history = useSelector((state: RootState) => state.fileSystemNav.history)
    const currentIndex = useSelector((state: RootState) => state.fileSystemNav.cwdIndex)
    return <>
        <Typography
            variant={"h6"}
            fontWeight={"bold"}
            color={"textDisabled"}>
            History
        </Typography>
        <List>
            {history.map((e, i) =>
                e.inode ?
                    <ListItem key={i} onClick={() => {
                        dispatch(setCwdIndex(i))
                    }}>
                        <ListItemIcon>
                            <InodeCardIcon inodeType={e.inode.type} />
                        </ListItemIcon >
                        <ListItemText>
                            <Typography
                                fontWeight={"bold"}
                                color={currentIndex == i ? "info" : "textPrimary"}
                            >
                                {e.inode.name}
                            </Typography>
                        </ListItemText>
                    </ListItem>
                    :
                    <ListItem key={i}>
                        <ListItemIcon>
                            <QuestionMark color="error" />
                        </ListItemIcon>
                        <Typography
                            fontWeight={"bold"}
                            color="error"
                        >
                            ...
                        </Typography>
                    </ListItem>
            )}
        </List>
    </>
}