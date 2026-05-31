import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getProfile,
  updateProfile,
} from "../services/profile";

export function useProfileSettings() {

  const queryClient =
    useQueryClient();

  const profileQuery =
    useQuery({
      queryKey: [
        "profile",
      ],
      queryFn:
        getProfile,
    });

  const updateMutation =
    useMutation({
      mutationFn:
        updateProfile,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "profile",
          ],
        });
      },
    });

  return {
    profileQuery,
    updateMutation,
  };
}