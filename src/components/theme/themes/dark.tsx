import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#000000",
        },
        primary: {
            main: "#040E16",
        },
        secondary: {
            main: "#000000",
        },
        text: {
            primary: "#FFFFFF",
            secondary: "#0099CC",
        },
    },
})