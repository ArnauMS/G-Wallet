// React
import { useEffect, useState} from "react";
// State
import { useDispatch } from "react-redux";
import { getLatestExpenses } from "../../../../redux/slices/individualSlice";
// Hooks
import useAuth from "../../../../hooks/useAuth";
import useIndividual from '../../../../hooks/useIndividual';
import Loading from "../../../Loading/loading";
// Styles
import "./gastos.css";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const Gastos = () => {
  const { t } = useTranslation();
  const [clickvermas, setClickvermas] = useState(3);
  const { user } = useAuth();
  const { latestExpenses, isLoading, error } = useIndividual();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getLatestExpenses(user, clickvermas));
  }, [clickvermas]);

  
  const handleclick = () => {
    setClickvermas(clickvermas + 3);
  };

  if (isLoading) return <Loading />;

  return (
    <I18nextProvider i18n={i18n}>
      <div className="gastos">
        {latestExpenses.length > 0 && <h4 className="title"> {t('gastos.titulo')} </h4>}
        <div className="table-gastos">
          {latestExpenses.length > 0 &&
            latestExpenses.map((gasto) => {
              return (
                <div className="gasto" key={gasto.id}>
                  <img
                    src={`/assets/${gasto.categoria}.svg`}
                    alt={`Imagen de ${gasto.categoria} categoria`}
                  ></img>
                  <div className="information">
                    <h1> {gasto.nombre} </h1>
                    <h2> {gasto.fecha} </h2>
                    <h3> {gasto.cantidad} € </h3>
                  </div>
                </div>
              );
            })}
          {latestExpenses.length === 0 && (
            <p className="empty"> {t('gastos.vacio')} </p>
          )}
        </div>
        {latestExpenses.length > 0 && (
          <button className="more" type="button" onClick={handleclick}>
            <p> {t('gastos.verMas')} </p>
          </button>
        )}
      </div>
    </I18nextProvider>
  );
};

export default Gastos;