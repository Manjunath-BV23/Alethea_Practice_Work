import {Routes, Route} from "react-router-dom"
import { Home } from "./Home"
import { Todos } from "./Todos"
import { Counter } from "./Counter"



export const Routers = () => {

    return(
        <>
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/counter" element={<Counter/>}></Route>
                <Route path="/todos" element={<Todos/>}></Route>
            </Routes>
        </>
    )
}