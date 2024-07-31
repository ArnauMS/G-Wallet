import { useSelector } from "react-redux";

const useIndividual = () => {
  const { expenses, latestExpenses, isLoading, error } = useSelector((state) => state.individual);

  return {
    expenses,
    latestExpenses,
    isLoading,
    error,
  };
};

export default useIndividual;