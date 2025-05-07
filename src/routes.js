import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Sestanki from "layouts/sestanki";
import Projekti from "layouts/projekti";
import Ure from "layouts/ure";

import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Domov",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Uradne ure",
    key: "tables",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/ure",
    component: <Ure />,
  },
  {
    type: "collapse",
    name: "Sestanki",
    key: "sestanki",
    icon: <Icon fontSize="small">event_note</Icon>,
    route: "/sestanki",
    component: <Sestanki />,
  },
  {
    type: "collapse",
    name: "Projekti",
    key: "projekti",
    icon: <Icon fontSize="small">event_note</Icon>,
    route: "/projekti",
    component: <Projekti />,
  },
  {
    type: "collapse",
    name: "Profil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Clani",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
