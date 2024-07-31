import { useSelector } from "react-redux";

const useExpensesAndCategories = () => {
  const { expenses, isLoading: isLoadingExpenses, error: errorExpenses } = useSelector((state) => state.expenses);
  const { categories, isLoading: isLoadingCategories, error: errorCategories } = useSelector((state) => state.categories);

  return {
    expenses,
    categories,
    isLoading: isLoadingExpenses || isLoadingCategories,
    error: errorExpenses || errorCategories,
  };
};

export default useExpensesAndCategories;
