import type React from "react";
import Home from "../../Pages/Home";
import Regist from "../../Pages/Regist";
import Login from "../../Pages/Login";


enum RoutesNames {
    Home = '/',
    Regist = '/Regist',
    Login = '/login'
}


export interface IRoute {
    path: string,
    element: React.ElementType
}


export const routes: IRoute[] = [
    {
        path: RoutesNames.Login,
        element: Login
    },
    {
        path: RoutesNames.Home,
        element: Home
    },
    {
        path: RoutesNames.Regist,
        element: Regist
    }
]

