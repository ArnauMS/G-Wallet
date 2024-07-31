import { useState } from "react";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

function ModificarGastoIndividual(props) {
  const { t } = useTranslation();
  const { gasto } = props;

  const [inputValues, setInputValues] = useState({
    nombre: gasto.nombre,
    cantidad: gasto.cantidad,
    categoria: gasto.categoria,
    fecha: gasto.fecha,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí puedes enviar los nuevos valores al servidor
    // utilizando la función props.onSubmit
    props.onSubmit(inputValues);
  };

  const handleChange = (event) => {
    setInputValues({
      ...inputValues,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            className="inputNombre"
            placeholder={t('modificarGastoIndividual.placeholderNombre')}
            type="text"
            name="nombre"
            onChange={handleChange}
            value={inputValues.nombre}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={inputValues.cantidad}
            name="cantidad"
            placeholder={t('modificarGastoIndividual.placeholderCan')}
            onChange={handleChange}
            className="inputCantidad"
            required
          />
          <select
            className="inputCategoria"
            name="categoria"
            onChange={handleChange}
            defaultValue={inputValues.categoria}
            required
          >
            <option value="" disabled hidden>
            {t('modificarGastoIndividual.buscarCategoria')}
            </option>
            {props.categoriasData.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="inputFecha"
            name="fecha"
            onChange={handleChange}
            value={inputValues.fecha}
            required
          />
          <button type="submit">{t('modificarGastoIndividual.modificar')}</button>
        </form>
      </div>
    </I18nextProvider>
  );
}

export default ModificarGastoIndividual;
