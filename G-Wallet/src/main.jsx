// React
import React from "react";
import ReactDOM from "react-dom/client";
// React-Redux
import { Provider } from "react-redux"; // Proporciona la variable sotre a todos los hijos
import { PersistGate } from "redux-persist/integration/react"; // Genera el store persistente y puede ser accedido por todos sus hijos
import { persitedStorage, store } from "./redux/store/store";
// Router
import router from "./routes/router";
// React-Router
import { RouterProvider } from "react-router-dom";
// Styles
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persitedStorage}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
