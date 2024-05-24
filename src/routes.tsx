import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./Pages/Home/index";
import CreatePoint from "./Pages/CreatePoint";

const Routess = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route element={<Home />} path="/" />
                </Routes>
                <Routes>
                    <Route element={<CreatePoint />} path="/create-point" />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default Routess;
