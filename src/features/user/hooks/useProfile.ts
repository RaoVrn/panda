/**
 * React Query hooks for the user system.
 *
 * Every hook is disabled until Supabase is configured and a user is signed in,
 * so the app works fine in anonymous mode.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  fetchProfile,
  updateProfile,
} from "@/features/user/services/profileService";
import type { LearningProfileRow } from "@/features/user/types";

const keys = {
  profile: (userId: string) => ["profile", userId] as const,
  learning: (userId: string) => ["learning-profile", userId] as const,
};

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: keys.profile(userId ?? ""),
    queryFn: () => fetchProfile(userId!),
    enabled: isSupabaseConfigured() && Boolean(userId),
  });
}

export function useUpdateProfile(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { name?: string; username?: string; avatarUrl?: string }) =>
      updateProfile(userId!, patch),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: keys.profile(userId) });
      }
    },
  });
}

export type { LearningProfileRow };
