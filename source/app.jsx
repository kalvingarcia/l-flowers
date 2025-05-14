import React from 'react';
import {createRoot} from 'react-dom/client';
import {GlobalStyles} from 'tss-react';
import ThemeProvider from './components/common/theme';
import Layout from './components/layout';

function App() {
    return (
        <ThemeProvider>
            <GlobalStyles styles={``} />
            <Layout />
        </ThemeProvider>
    );
}

createRoot(document.getElementById("root")).render(<App />);