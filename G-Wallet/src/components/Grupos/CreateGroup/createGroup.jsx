// React
import { useState } from "react";
// Router
import { Navigate } from "react-router-dom";
// Dispatch
import { useDispatch } from "react-redux";
import { createGroup } from "../../../redux/slices/groupsSlice";
// Hooks
import useAuth from "../../../hooks/useAuth";
import useGroups from "../../../hooks/useGroups";
// Styles
import "./createGroup.css";
// Images
import Plus from "../../../assets/plus.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const CreateGroup = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { error, created } = useGroups();
  const dispatch = useDispatch();
  const [alerta, setAlerta] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (values.email.length != 0) {
      setAlerta({ ...alerta, [alerta]: false });
      dispatch(createGroup(user, values.name, values.email));
    } else {
      setAlerta({ ...alerta, [alerta]: true });
    }
  };

  const handleChange = (e) => {
    const name = e.target.name;
    if (name == "add") {
      e = document.getElementById("email");
      const value = e.value;
      if (value) {
        if (!values.email.includes(value)) {
          setValues({ ...values, email: [...values.email, value] });
        }
        e.value = null;
      }
    } else {
      const value = e.target.value;
      setValues({ ...values, [name]: value });
    }
  };

  if (created) {
    return <Navigate to={"/dashboard/groups/"} />
  }

  return (
    <I18nextProvider i18n={i18n}>
      <div className="groupPage">
        <div className="content">
          <p className="texto"> {t('createGroup.titulo')} </p>
          <form onSubmit={handleSubmit}>
            <div className="input">
              <input
                required
                type="text"
                placeholder={t('createGroup.placeholderNombre')}
                name="name"
                value={values.name}
                onChange={handleChange}
              />
            </div>
            <div className="input">
              <input
                type="email"
                placeholder={t('createGroup.placeholderEmail')}
                name="email"
                id="email"
              />
              <img
                src={Plus}
                alt="Add email button"
                width="25"
                height="25"
                name="add"
                onClick={handleChange}
              />
            </div>
            {error && <p className="error"> Upss...{error} </p>}
            <div id="mailList">
              {values.email &&
                values.email.map((email) => {
                  return <ul key={email}>{email}</ul>;
                })}
            </div>
            <div className="input">
              <input type="submit" value={t('createGroup.boton')} />
            </div>
            {alerta &&
              <p className="texto"> {t('createGroup.error')}</p>
            }
          </form>
        </div>
      </div>
    </I18nextProvider>
  );
};

export default CreateGroup;
