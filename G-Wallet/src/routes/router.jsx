import { createBrowserRouter } from "react-router-dom";
//Pages
import HomePage from "../pages/homePage";
import LoginPage from "../pages/loginPage";
import GroupPage from "../pages/groupPage";
import SignupPage from "../pages/signupPage";
import GroupsPage from "../pages/groupsPage";
import ExpensePage from "../pages/expensePage";
import DashboardPage from "../pages/dashboardPage";
import IndividualPage from "../pages/individualPage";
import InvitationPage from "../pages/invitationPage";
// Routes
import PrivateRoute from "./privateRoute";
// Components
import Group from "../components/Grupos/Grupo/[group]";
import Groups from "../components/Grupos/groups";
import Dashboard from "../components/Home/Dashboard/dashboard";
import AddExpense from "../components/Grupos/AñadirGasto/AddExpense";
import Individual from "../components/Individual/individual";
import CreateGroup from "../components/Grupos/CreateGroup/createGroup";
import EliminarGroup from "../components/Grupos/EliminarGroup/eliminarGroup";
import ModificarGroup from "../components/Grupos/ModificarGrupo/ModificarGrupo";
import GroupChat from "../components/Grupos/Chat/groupChat";
import EliminarGastoGrupal from "../components/Grupos/EliminarGastoGrupal/eliminarGastoGrupal";
import CrearGastoIndividual from "../components/Individual/CrearGastoIndividual/crearGastoIndividual";
import EliminarGastoIndividual from "../components/Individual/EliminarGastoIndividual/eliminargastoindividual";
import ModificarGastoIndividual from "../components/Individual/ModificarGastoIndividual/modificargastoindividual";
import Gasto from "../components/Grupos/Gasto/[gasto]";
import InvitationLanding from "../components/Home/invitationLanding";
import Profile from "../components/Profile/profile";
import VerGastosIndividuales from "../components/Individual/verGastosIndividuales/verGastosIndividuales";
import ModificarLimiteCategoria from "../components/Individual/ModificarLimiteCategoria/ModificarLimiteCategoria";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/sign-up",
    element: <SignupPage />,
  },
  {
    path: "/invite",
    element: <PrivateRoute />,
    children: [
      {
        element: <InvitationPage />,
        children: [
          {
            index: true,
            element: <InvitationLanding />
          }
        ]
      }
    ]
  },
  {
    path: "/dashboard/*",
    element: <PrivateRoute />,
    children: [
      {
        element: <DashboardPage />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "addExpense",
            element: <CrearGastoIndividual />,
          },
          {
            path: "personal",
            element: <IndividualPage />,
            children: [
              {
                index: true,
                element: <Individual />,
              },
              {
                path: "addIndividualExpense",
                element: <CrearGastoIndividual />,
              },
              {
                path: "removeIndividualExpense",
                element: <EliminarGastoIndividual />,
              },
              {
                path: "modificar",
                element: <ModificarGastoIndividual />,
              },
                  /* {
                    path: "history",
                    element: <ExpenseHistory />,
                  }, */
              {
                path: "create",
                element: <CrearGastoIndividual />,
              },
              {
                path: "modifyCategoryLimit",
                element: <ModificarLimiteCategoria />,
              }
            ],
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "groups",
            element: <GroupsPage />,
            children: [
              {
                element: <GroupPage />,
                children: [
                  {
                    index: true,
                    element: <Groups />,
                  },
                  {
                    path: ":groupID",
                    element: <GroupPage />,
                    children: [
                      {
                        index: true,
                        element: <Group />,
                      },
                      {
                        path: "modifyGroup",
                        element: <ModificarGroup />,
                      },
                      {
                        path: "addGroupalExpense",
                        element: <AddExpense />,
                      },
                      {
                        path: "removeGroup",
                        element: <EliminarGroup />,
                      },
                      {
                        path: "groupChat",
                        element: <GroupChat />,
                      },
                      {
                        path: ":expenseID",
                        element: <ExpensePage />,
                        children: [
                          {
                            index: true,  
                            element: <Gasto />,
                          },
                          {
                            path: "removeGroupExpense",
                            element: <EliminarGastoGrupal />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "createGroup",
                    element: <CreateGroup />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
