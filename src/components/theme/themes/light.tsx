import { createTheme } from "@mui/material"

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#E6E6E6",
        },
        primary: {
            main: "#FFFFFF",
        },
        secondary: {
            main: "#E6E6E6",
        },
        text: {
            primary: "#000000",
            secondary: "#0099CC",
        },
    },
})