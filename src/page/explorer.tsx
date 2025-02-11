import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { FC } from "react"
import { ViewPortBox } from "./components/ViewPortBox"
import { ContenteView } from "./components/contentView"
import { MenuBar } from "./components/menubar"
// import { useSelector } from "react-redux"
// import { RootState } from "../state/store"

export const Explorer: FC<{}> = () => {
    return <ViewPortBox>
        <Stack height="100%" width="100%" direction={"row"}>
            <Box
                height="100%"
                width="20%"
                minWidth="256px"
                bgcolor={"primary.dark"}
            >
            </Box>
            <Box
                height="100%"
                width="80%"
                bgcolor={"primary.light"}
            >
                <Stack width={"100%"} height={"100%"}>
                    <MenuBar />
                    <ContenteView />
                </Stack>
            </Box>
        </Stack>
    </ViewPortBox>
}