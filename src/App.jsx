import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Faturas from "./pages/Faturas";
import DetalheFatura from "./pages/DetalheFatura";
import PlanejamentoFuturo from "./pages/PlanejamentoFuturo";

const theme = createTheme({
    palette: {
        primary: {
            main: "#820AD1"
        },
        background: {
            default: "#F5F5F5"
        }
    },
    shape: {
        borderRadius: 14
    }
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Faturas />} />
                    <Route path="/fatura/:id" element={<DetalheFatura />} />
                    <Route path="/planejamento" element={<PlanejamentoFuturo />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
