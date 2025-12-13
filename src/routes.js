import Dashboard from "layouts/dashboard";
import Profil from "layouts/profil";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Sestanki from "layouts/sestanki";
import Projekti from "layouts/projekti";
import Pomocnik from "layouts/pomocnik";
import Ure from "layouts/ure";
import Koledar from "layouts/koledar";
import Izplacila from "layouts/izplacila";
import UrediVloge from "layouts/vloge";
import KonstantePage from "layouts/konstante";
import Icon from "@mui/material/Icon";
import PodrobnostiPlacil from "layouts/podrobnostiplacil";
import Ugodnosti from "layouts/ugodnosti/index.js";
import VodjaStran from "layouts/vodje";
import ZgodovinaUradnihUr from "layouts/ure/ZgodovinaUradnihUr";
import PinProtectedRoute from "PinProtectedRoute";
import RezervacijaProstora from "layouts/rezervacijaProstor/rezervacijaProstora";
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
    name: "Zgodovinauradnihur",
    key: "zgodovinauradnih",
    icon: <Icon fontSize="small">redeem </Icon>,
    route: "/zgodovinaUradnihUr",
    component: <ZgodovinaUradnihUr />,
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
    type: "route",
    name: "Uporabniki",
    key: "uporabniki",
    icon: <Icon fontSize="small">task</Icon>,
    route: "/uporabniki",
    component: (
      <PinProtectedRoute>
        <Profil />
      </PinProtectedRoute>
    ),
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
    name: "Rezervacija prostora",
    key: "Rezervacija prostora",
    icon: <Icon fontSize="small">meeting_room</Icon>,
    route: "/rezervacija",
    component: <RezervacijaProstora />,
  },
  {
    type: "route",
    name: "Profil",
    key: "profil",
    route: "/profil",
    component: <profil />,
  },
  {
    type: "route",
    name: "vodjaStran",
    key: "vodjaStran",
    route: "/vodjaStran",
    component: <VodjaStran />,
  },
  {
    type: "route",
    name: "Mesečna izplačila",
    key: "izplacila",
    icon: <Icon fontSize="small">account_balance_wallet </Icon>,
    route: "/izplacila",
    component: (
      <PinProtectedRoute>
        <Izplacila />
      </PinProtectedRoute>
    ),
  },
  {
    type: "collapse",
    name: "Ugodnosti",
    key: "ugodnosti",
    icon: <Icon fontSize="small">redeem </Icon>,
    route: "/ugodnosti",
    component: <Ugodnosti />,
  },

  {
    type: "route",
    name: "Vloge",
    key: "urediVloge",
    route: "/vloge",
    component: (
      <PinProtectedRoute>
        <UrediVloge />
      </PinProtectedRoute>
    ),
  },
  {
    type: "route",
    name: "Konstante",
    key: "konstante",
    route: "/konstante",
    component: (
      <PinProtectedRoute>
        <KonstantePage />
      </PinProtectedRoute>
    ),
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
