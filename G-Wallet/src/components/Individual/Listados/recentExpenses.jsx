// recentExpenses.jsx
import React from "react";
import { Link } from "react-router-dom";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const RecentExpenses = ({ expenses }) => {
  const { t } = useTranslation();
  return (
    <I18nextProvider i18n={i18n}>
      <div className="recent-expenses">
        <h2>{t('recentExpenses.titulo')}</h2>
        {expenses.slice(0, 5).map((expense) => (
          <div className="expense" key={expense.id}>
            <div className="left">
              <h1 className="title">
                {expense.nombre} <span className="category"> {expense.categoria} </span>
              </h1>
              <h2 className="date"> {expense.fecha} </h2>
            </div>
            <div className="right">
              <div className="image">
                <h1 className="amount"> {expense.cantidad} € </h1>
              </div>
            </div>
          </div>
        ))}
        <Link to="/expenses">
          <button className="see-more">{t('recentExpenses.verMas')}</button>
        </Link>
      </div>
    </I18nextProvider>
  );
};

export default RecentExpenses;
