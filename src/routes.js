import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Sestanki from "layouts/sestanki";
import Projekti from "layouts/projekti";
import Ure from "layouts/ure";
import Koledar from "layouts/koledar";
import Izplacila from "layouts/izplacila";
import UrediVloge from "layouts/vloge";

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
    name: "Koledar",
    key: "koledar",
    icon: <Icon fontSize="small">event_note</Icon>,
    route: "/koledar",
    component: <Koledar />,
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
    name: "Izplacila",
    key: "izplacila",
    icon: <Icon fontSize="small">payments</Icon>,
    route: "/izplacila",
    component: <Izplacila />,
  },
  {
    type: "collapse",
    name: "UrediVloge",
    key: "urediVloge",
    icon: <Icon fontSize="small">payments</Icon>,
    route: "/vloge",
    component: <UrediVloge />,
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
