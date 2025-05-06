import { Folder } from "@/generated/prisma";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFolders = () => {
  const {
    data: folders = [],
    isLoading,
    error,
    refetch: fetchFolders,
  } = useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      return axios.get(`/api/folders?isTrash=false`).then((res) => res.data);
    },
    staleTime: 60 * 1000, // 60s
    retry: 3,
  });

  return {
    folders,
    isLoading: isLoading,
    error,
    fetchFolders,
  };
};
