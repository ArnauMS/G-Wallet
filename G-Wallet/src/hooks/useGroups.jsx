import { useSelector } from "react-redux";

const useGroups = () => {
  const { groups, isLoading, error, lastModified, modified, created } = useSelector(
    (state) => state.groups
  );

  return {
    groups,
    isLoading,
    error,
    lastModified,
    modified,
    created
  };
};

export default useGroups;
