import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {createTss, GlobalStyles} from 'tss-react';
import Color from 'color';
import 'material-symbols';

// The colors for the default palette.
const oxford = "#011638";
const charcoal = "#364156";
const honeydew = "#DFF8EB";
const melon = "#F0A49F";
const silver = "#CDCDCD";

const ThemeContext = createContext();
export function useTheme() {
    return useContext(ThemeContext);
}

const DarkModeContext = createContext();
export function useDarkMode() {
    return useContext(DarkModeContext);
}

export const tss = createTss({useContext: () => {
    return {theme: useContext(ThemeContext).theme};
}}).tss;

const lightness = {
    dark: {
        accent: 80,
        onAccent: 20,
        container: 30,
        onContainer: 90,
        background: 5,
        surfaceLowest: 10,
        surfaceLow: 12.5,
        surface: 15,
        surfaceHigh: 17.5,
        surfaceHighest: 20,
        onSurface: 90,
        rule: 60,
        shadow: 0
    },
    light: {
        accent: 40,
        onAccent: 90,
        container: 80,
        onContainer: 10,
        background: 95,
        surfaceLowest: 90,
        surfaceLow: 87.5,
        surface: 85,
        surfaceHigh: 82.5,
        surfaceHighest: 80,
        onSurface: 10,
        rule: 50,
        shadow: 0
    }
};

/**
 * The Themer is specifically made to cache styles using tss-react's NextAppDirEmotionCacheProvider. The component also has dark mode context
 * and theme context providers. These are specifically to allow the user to add and remove theme objects, change themes, and change scheme by
 * toggling dark mode. The themes are auto generated using color.js and a mapping object to map palette colors to the themes colors.
 * 
 * There are also global styles provided by the Themer which provides a reset to the HTML elements.
 * 
 * @param props The component only takes 1 prop. The `children` prop is specifically used to hold everything that will be themed.
 * @returns A React component.
 */
export default function ThemeProvider({darkModeDefault = false, themeDefault = "default", palettePresets, children}) {
    const [darkMode, setDarkMode] = useState(darkModeDefault);
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    }

    const paletteDictionary = useRef({
        default: {primary: oxford, secondary: charcoal, tertiary: honeydew, error: melon, neutral: silver},
        ...palettePresets
    });

    const addPalette = (themeName, paletteObject) => {
        if(!themeName || !paletteObject)
            return console.error("The function `addPalette` requires 2 arguments: themeName and paletteObject.");
        paletteDictionary.current[themeName] = paletteObject;
    };
    const removePalette = themeName => {
        if(!themeName)
            return console.error("The function `removePalette` requires 1 argument: themeName.");
        delete paletteDictionary.current[themeName];
    };

    const createTheme = (themeName, paletteObject, darkMode) => {
        if(!paletteObject)
            paletteObject = paletteDictionary.current.default;
        try {
            const primary = Color(paletteObject.primary);
            const secondary = Color(paletteObject.secondary);
            const tertiary = Color(paletteObject.tertiary);
            const error = Color(paletteObject.error);
            const neutral = Color(paletteObject.neutral);

            // The object is populated with color objects, this gives the user finetuning abilities.
            // The theme name is also housed in the object so the user can display it, but its mostly
            // so that toggling darkMode works.
            return {
                name: themeName,
                primary: {
                    accent: primary.lightness(lightness[darkMode? 'dark' : 'light'].accent),
                    onAccent: primary.lightness(lightness[darkMode? 'dark' : 'light'].onAccent),
                    container: primary.lightness(lightness[darkMode? 'dark' : 'light'].container),
                    onContainer: primary.lightness(lightness[darkMode? 'dark' : 'light'].onContainer),
                },
                secondary: {
                    accent: secondary.lightness(lightness[darkMode? 'dark' : 'light'].accent),
                    onAccent: secondary.lightness(lightness[darkMode? 'dark' : 'light'].onAccent),
                    container: secondary.lightness(lightness[darkMode? 'dark' : 'light'].container),
                    onContainer: secondary.lightness(lightness[darkMode? 'dark' : 'light'].onContainer),
                },
                tertiary: {
                    accent: tertiary.lightness(lightness[darkMode? 'dark' : 'light'].accent),
                    onAccent: tertiary.lightness(lightness[darkMode? 'dark' : 'light'].onAccent),
                    container: tertiary.lightness(lightness[darkMode? 'dark' : 'light'].container),
                    onContainer: tertiary.lightness(lightness[darkMode? 'dark' : 'light'].onContainer),
                },
                error: {
                    accent: error.lightness(lightness[darkMode? 'dark' : 'light'].accent),
                    onAccent: error.lightness(lightness[darkMode? 'dark' : 'light'].onAccent),
                    container: error.lightness(lightness[darkMode? 'dark' : 'light'].container),
                    onContainer: error.lightness(lightness[darkMode? 'dark' : 'light'].onContainer),
                },
                neutral: {
                    background: neutral.lightness(lightness[darkMode? 'dark' : 'light'].background),
                    containerLowest: neutral.lightness(lightness[darkMode? 'dark' : 'light'].surfaceLowest),
                    containerLow: neutral.lightness(lightness[darkMode? 'dark' : 'light'].surfaceLow),
                    container: neutral.lightness(lightness[darkMode? 'dark' : 'light'].surface),
                    containerHigh: neutral.lightness(lightness[darkMode? 'dark' : 'light'].surfaceHigh),
                    containerHighest: neutral.lightness(lightness[darkMode? 'dark' : 'light'].surfaceHighest),
                    onContainer: neutral.lightness(lightness[darkMode? 'dark' : 'light'].onSurface),
                    rule: neutral.lightness(lightness[darkMode? 'dark' : 'light'].rule),
                    shadow: neutral.lightness(lightness[darkMode? 'dark' : 'light'].shadow)
                }
            };
        } catch(error) {
            // If the palette objects the user provided didn't name the properties necessary,
            // then an error is displayed.
            console.error("While creating a theme an error occured: " + error.message);
            return undefined;
        }
    };

    const [theme, setTheme] = useState(createTheme(themeDefault, paletteDictionary.current[themeDefault], darkMode));
    const changeTheme = (themeName) => {
        try {
            // The new theme is created.
            const newTheme = createTheme(themeName, paletteDictionary.current[themeName], darkMode);
            if(!newTheme) // If the theme isn't defined, then that means the palette object was structured incorrectly.
                return console.warn("Theme was not created sucessfully. Please ensure your palette object has primary, secondary, tertiary, error, and neutral as properties.");
            setTheme(newTheme);
        } catch(error) { // If an invalid themeName is given, then the function displays an error.
            console.error("While setting a theme an error occured: " + error.message); 
        }
    };
    useEffect(() => {
        changeTheme(theme.name);
    }, [darkMode]);

    const defaults = {
        "*": {
            scrollbarGutter: "stable",
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.primary.accent.hex()} ${theme.primary.container.alpha(0.5).hexa()}`,
            transition: "scrollbar 300ms ease"
        },
        "body *": {
            boxSizing: "border-box",
            "&::before, &::after": {
                boxSizing: "border-box",
                transition: "opacity 300ms ease"
            }
        },
        html: {
            MozTextSizeAdjust: "none",
            WebkitTextSizeAdjust: "none",
            textSizeAdjust: "none",
        },
        body: {
            backgroundColor: theme.neutral.background.hex(),
            color: theme.neutral.onContainer.hex()
        },
        "body, h1, h2, h3, h4, p, figure, blockquote, dl, dd": {
            margin: 0
        },
        'ul[role="list"], ol[role="list"]': {
            listStyle: "none"
        },
        html: {
            overflow: "hidden"
        },
        "html, body, #root": {
            position: "relative",
            width: "100%",
            minWidth: "100%",
            maxWidth: "100%",
            height: "100%",
            overflowX: "hidden",
            lineHeight: 1,
            overscrollBehavior: "none", // This part was specifically to avoid MacOS overscroll, which was bugging me.
            fontWeight: "400",
            fontStyle: "normal"
        },
        "h1, h2, h3, h4, button, input, label": {
            lineHeight: 1
        },
        "h1, h2, h3, h4": {
            textWrap: "balance"
        },
        "a": {
            "&:not([class])": {
                textDecorationSkipInk: "auto",
                color: "currentcolor"
            }
        },
        "img, picture": {
            maxWidth: "100%",
            display: "block"
        },
        "input, button, textarea, select": {
            font: "inherit"
        },
        "textarea": {
            "&:not([rows])": {
                minHeight: "10em"
            }
        },
        ":target": {
            scrollMarginBlock: "5ex"
        }
    };

    return (
        <ThemeContext.Provider value={{theme, palettes: paletteDictionary.current, changeTheme, addPalette, removePalette}}>
            <DarkModeContext.Provider value={{darkMode, toggleDarkMode}}>
                <GlobalStyles styles={defaults} />
                {children}
            </DarkModeContext.Provider>
        </ThemeContext.Provider>
    );
}