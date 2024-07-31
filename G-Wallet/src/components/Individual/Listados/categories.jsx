// categories.jsx
import React from "react";
import { Link } from "react-router-dom";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const Categories = ({ categories }) => {
  const { t } = useTranslation();
  return (
    <I18nextProvider i18n={i18n}>
      <div className="categories">
        <h2>{t('categories.titulo')}</h2>
        {categories.slice(0, 5).map((category) => (
          <div className="category" key={category.id}>
            <h1 className="title">{category.nombre}</h1>
            <h2 className="limit">{t('categories.limite')} {category.limite} €</h2>
          </div>
        ))}
        <Link to="/categories">
          <button className="see-more">{t('categories.verMas')}</button>
        </Link>
      </div>
    </I18nextProvider>
  );
};

export default Categories;
