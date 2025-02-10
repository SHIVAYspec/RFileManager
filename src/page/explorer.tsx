import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { FC } from "react"
import { ViewPortBox } from "./components/ViewPortBox"
import { ContenteView } from "./components/contentView"
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
                <ContenteView />
            </Box>
        </Stack>
    </ViewPortBox>
}

// const Debug: FC<{}> = () => {
//     const fsSysNav = useSelector((state: RootState) => state.fileSystemNav)
//     return <>
//         <h1>Loading</h1>
//         {fsSysNav.loading ? "True" : "False"}

//         <h1>CWDIndex</h1>
//         {fsSysNav.cwdIndex}

//         <h1>History</h1>
//         <ul>
//             {fsSysNav.history.map((i) =>
//                 <li key={i}>{i}</li>
//             )}
//         </ul>

//         <h1>Contents</h1>
//         <ul>
//             {fsSysNav.contents.map((i) =>
//                 <li key={i.id}>
//                     {i.type} - {i.id} - {i.name}
//                 </li>
//             )}
//         </ul>
//     </>
// }