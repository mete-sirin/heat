import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, signout } from "../services/authService";
import { AuthContext } from "./contexts";

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 2 * 60 * 1000,
  });

  const user = response?.data || null;
  const isAuthenticated = Boolean(user && !isError);

  const logoutMutation = useMutation({
    mutationFn: signout,
    onSettled: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.removeQueries({ queryKey: ["summary"] });
      queryClient.removeQueries({ queryKey: ["spendings"] });
      queryClient.removeQueries({ queryKey: ["subscriptions"] });
      queryClient.removeQueries({ queryKey: ["breakdown"] });
    },
  });

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return (
    <AuthContext
      value={{
        user,
        isAuthenticated,
        isLoading,
        isLoggingOut: logoutMutation.isPending,
        refetchUser: refetch,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}
