import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { Theme } from "@mui/system";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

export const ThemeLoader: FC<{ children: ReactNode }> = ({ children }) => {
    const deviceThemeSetting: boolean = useMediaQuery("(prefers-color-scheme:light)");
    const themeSetting: string = useSelector((state: RootState) => state.theme.theme)
    const theme: () => Theme = () => {
        switch (themeSetting) {
            case 'light':
                return lightTheme
            case 'dark':
                return darkTheme
            case 'system':
            default:
                return deviceThemeSetting ? lightTheme : darkTheme
        }
    }

    return <ThemeProvider theme={theme()}>
        <CssBaseline />
        {children}
    </ThemeProvider>
    return children
}