import { API_URLS } from "@/constants/api";
import { useAuthStore } from "./store/authStore";
import { OnboardingDraft } from "@/constants/types/contracts";

export const useUser = () => {
  const { accessToken } = useAuthStore();

  const onboardUser = async (draft: OnboardingDraft) => {
    if (!accessToken) throw new Error("Not authenticated");

    const activityLevelMap: Record<string, number> = {
      sedentary: 1,
      light: 2,
      moderate: 3,
      active: 4,
      very_active: 5,
    };

    const body = {
      gender: draft.gender === "male" ? 1 : 2,
      dateOfBirth: draft.birthDateISO?.split("T")[0],
      heightCm: draft.heightCm,
      weightKg: draft.currentWeightKg,
      goalWeightKg: draft.targetWeightKg,
      activityLevel: activityLevelMap[draft.activityLevel || "sedentary"],
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(API_URLS.user.onboarding, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();

        // ASP.NET Core ProblemDetails thường để mã lỗi trong error.code hoặc error.extensions.code
        // và thông báo trong error.detail thay vì error.message
        const errorCode = error.code || error.extensions?.code;
        const errorDetail = error.detail || error.message || "";

        if (errorCode === "USER_ALREADY_ONBOARDED" || errorDetail.includes("already onboarded")) {
          console.log("User already onboarded, fetching existing info...");
          const infoRes = await fetch(API_URLS.user.info, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (infoRes.ok) {
            const infoJson = await infoRes.json();
            // Đảm bảo trả về đúng format UserGoalResponse
            return infoJson.data.activeGoal;
          }
        }

        throw new Error(errorDetail || "Failed to onboard user");
      }

      const json = await response.json();
      return json.data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error("Kết nối quá hạn. Vui lòng kiểm tra internet hoặc server.");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return { onboardUser };
};
