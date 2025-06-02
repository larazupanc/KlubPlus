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
import KonstantePage from "layouts/konstante";
import Icon from "@mui/material/Icon";
import PodrobnostiPlacil from "layouts/podrobnostiplacil";
import UgodnostiPage from "layouts/ugodnosti/UgodnostiPage";
import RezervacijaProstora from "layouts/rezervacijaProstor/rezervacijaProstora";
import UgodnostiPodrobnostiPage from "layouts/ugodnosti/UgodnostiPodrobnostiPage";
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
    type: "route",
    name: "Podrobnosti",
    key: "podrobnosti",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/podrobnosti",
    component: <PodrobnostiPlacil />,
  },
  {
    type: "collapse",
    name: "Sestanki",
    key: "sestanki",
    icon: <Icon fontSize="small">work</Icon>,
    route: "/sestanki",
    component: <Sestanki />,
  },
  {
    type: "collapse",
    name: "Projekti",
    key: "projekti",
    icon: <Icon fontSize="small">task</Icon>,
    route: "/projekti",
    component: <Projekti />,
  },
  {
    type: "collapse",
    name: "Koledar",
    key: "koledar",
    icon: <Icon fontSize="small">calendar_month</Icon>,
    route: "/koledar",
    component: <Koledar />,
  },
  {
    type: "collapse",
    name: "Rezervacija Prostora",
    key: "Rezervacija Prostora",
    icon: <Icon fontSize="small">calendar_month</Icon>,
    route: "/rezervacijaProstora",
    component: <RezervacijaProstora />,
  },
  {
    type: "route",
    name: "Profil",
    key: "profile",
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Mesečna izplačila",
    key: "izplacila",
    icon: <Icon fontSize="small">account_balance_wallet </Icon>,
    route: "/izplacila",
    component: <Izplacila />,
  },
  {
    type: "collapse",
    name: "Ugodnosti",
    key: "ugodnosti",
    icon: <Icon fontSize="small">account_balance_wallet </Icon>,
    route: "/ugodnosti",
    component: <UgodnostiPage />,
  },
  {
    type: "collapse",
    name: "Vloge",
    key: "urediVloge",
    icon: <Icon fontSize="small">groups</Icon>,
    route: "/vloge",
    component: <UrediVloge />,
  },
  {
    type: "route",
    name: "Konstante",
    key: "konstante",
    route: "/konstante",
    component: <KonstantePage />,
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
  {
    type: "route",
    name: "UgodnostiPodrobnostiPage",
    key: "ugodnosti/podrobnosti",
    route: "/ugodnosti/podrobnosti",
    component: <UgodnostiPodrobnostiPage />,
  },
];

export default routes;
