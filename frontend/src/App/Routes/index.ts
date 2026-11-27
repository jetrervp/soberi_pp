import type React from "react";
import Home from "../../Pages/Home";
import Regist from "../../Pages/Regist";
import Login from "../../Pages/Login";
import withAuth from "../../shared/hoc/withAuth";
import Dashboard from "../../Pages/Dashboard";
import TrackOrder from "../../Pages/TrackOrder";
import Orders from "../../Pages/Orders";
import MyShop from "../../Pages/MyShop";
import CreateShop, { ManageShop, Storefront } from "../../Pages/CreateShop";
import PublicStore from "../../Pages/PublicStore";
import Statistics from "../../Pages/Statistics";


export enum RoutesNames {
    Home = '/',
    Regist = '/Regist',
    Login = '/login',
    Dashboard = '/Dashboard',
    Orders = '/Dashboard/orders',
    MyShops = '/Dashboard/myshops',
    CreateShop = '/createShop',
    Stat = '/Dashboard/statistics',
}


export interface IRoute {
    path: string,
    element: React.ElementType
}


export const routes: IRoute[] = [
    { path: '/store/:id', element: PublicStore },
    { path: '/store/:id/cart', element: PublicStore },
    { path: '/store/:id/checkout', element: PublicStore },
    { path: '/track/:token', element: TrackOrder },
    { path: '/store/:id/products/:productKey', element: PublicStore },
    { path: '/storefront', element: withAuth(Storefront) },
    {
        path: RoutesNames.CreateShop,
        element: withAuth(CreateShop)
    },
    {
        path: RoutesNames.Login,
        element: withAuth(Login, "guest")
    },
    {
        path: RoutesNames.Home,
        element: Home
    },
    {
        path: RoutesNames.Regist,
        element: withAuth(Regist, "guest")
    },
]

export const dashboardRoutes: IRoute[] = [
    { path: "/Dashboard/myshops/:id", element: ManageShop },
    { path: "/Dashboard/orders/:orderId", element: Orders },
    {
        path: RoutesNames.Dashboard,
        element: Dashboard
    },
    {
        path: RoutesNames.Orders,
        element: Orders
    },
    {
        path: RoutesNames.MyShops,
        element: MyShop
    },
    {
        path: RoutesNames.Stat,
        element: Statistics
    },
]

