import { useOnboardUser } from "./queries/useUserQueries";
import { OnboardingDraft } from "@/constants/types/contracts";

export const useUser = () => {
  const { mutateAsync: onboardUserMutation } = useOnboardUser();

  const onboardUser = async (draft: OnboardingDraft) => {
    // Call the React Query mutation, which uses userService + axios under the hood
    return await onboardUserMutation(draft);
  };

  return { onboardUser };
};
