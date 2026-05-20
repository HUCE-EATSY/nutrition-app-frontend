// ─────────────────────────────────────────────────────────────
// Mock data khớp 1-1 với backend C# DTOs (nutrition-app-backend)
// Enum mapping: Gender { Male=1, Female=2 }, ActivityLevel { 1..5 }, GoalType { 1=Lose, 2=Gain, 3=Maintain }
// ─────────────────────────────────────────────────────────────

/** GET /api/User/info → ApiResponse<GetUserInfoResponse>
 *  GetUserInfoResponse { UserId, Profile, ActiveGoal, CreatedAt, UpdatedAt }
 */
export const mockGetUserInfoResponse = {
  userId: "mock-user-id-0001-0000-000000000000",

  // UserProfileResponse { UserId, DisplayName, AvatarUrl, Gender, DateOfBirth, HeightCm, WeightKg, UpdatedAt }
  profile: {
    userId: "mock-user-id-0001-0000-000000000000",
    displayName: "Mock User",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    gender: 1,                             // 1 = Male, 2 = Female
    dateOfBirth: "1990-01-01",             // DateOnly → "YYYY-MM-DD"
    heightCm: 175,
    weightKg: 75,
    updatedAt: "2024-06-01T00:00:00.000Z",
  },

  // UserGoalResponse { Id, UserId, WeightKg, ActivityLevel, GoalType, GoalWeightKg,
  //                    BmrKcal, TdeeKcal, TargetCalories, TargetProteinG, TargetCarbsG, TargetFatG, IsActive, CreatedAt }
  activeGoal: {
    id: "mock-goal-id-0001-0000-000000000000",
    userId: "mock-user-id-0001-0000-000000000000",
    weightKg: 75,
    activityLevel: 3,                      // 3 = Moderate
    goalType: 1,                           // 1 = Lose weight
    goalWeightKg: 70,
    bmrKcal: 1780,
    tdeeKcal: 2759,
    targetCalories: 1925,
    targetProteinG: 120,
    targetCarbsG: 200,
    targetFatG: 64,
    isActive: true,
    createdAt: "2024-06-01T00:00:00.000Z",
  },

  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

/** POST /api/User/onboarding → ApiResponse<UserGoalResponse> */
export const mockOnboardingResponse = mockGetUserInfoResponse.activeGoal;

/** PUT /api/User/profile → ApiResponse<UserProfileResponse> */
export const mockUpdateProfileResponse = mockGetUserInfoResponse.profile;

/** PUT /api/User/goal → ApiResponse<UserGoalUpdateResponse>
 *  UserGoalUpdateResponse = same fields as UserGoalResponse but without CreatedAt
 */
export const mockUpdateGoalResponse = {
  id: mockGetUserInfoResponse.activeGoal.id,
  userId: mockGetUserInfoResponse.activeGoal.userId,
  weightKg: 75,
  activityLevel: 3,
  goalType: 1,
  goalWeightKg: 70,
  bmrKcal: 1780,
  tdeeKcal: 2759,
  targetCalories: 1925,
  targetProteinG: 120,
  targetCarbsG: 200,
  targetFatG: 64,
  isActive: true,
};

