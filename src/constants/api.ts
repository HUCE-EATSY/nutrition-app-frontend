
/**
 * Địa chỉ API Backend
 */
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback if .env is missing
  return "http://192.168.100.215:5184";
};

export const API_BASE = getBaseUrl();

export const API_URLS = {
  auth: {
    google: `${API_BASE}/api/Auth/google`,
    refresh: `${API_BASE}/api/Auth/refresh`,
    logout: `${API_BASE}/api/Auth/logout`,
  },
  /** Foods endpoints */
  foods: {
    search: `${API_BASE}/api/foods/search`,          // GET ?Q=&CategoryId=&Page=&PageSize=
    byId: (id: string) => `${API_BASE}/api/foods/${id}`,        // GET /:uuid
    components: (id: string) => `${API_BASE}/api/foods/${id}/components`, // GET /:uuid/components
    barcode: (code: string) => `${API_BASE}/api/foods/barcode/${code}`,   // GET /barcode/:barcode
    estimateNutrients: `${API_BASE}/api/foods/estimate-nutrients`, // POST { image_url }
    create: `${API_BASE}/api/foods`,                // POST multipart/form-data
    createRecipe: `${API_BASE}/api/foods/recipes`,  // POST multipart/form-data
  },
  /** Food + Weight logs */
  logs: {
    food: `${API_BASE}/api/logs/food`,              // GET ?date=  |  POST
    foodById: (id: number) => `${API_BASE}/api/logs/food/${id}`, // PUT | DELETE
    foodSummary: `${API_BASE}/api/logs/food/summary`, // GET ?date=
    weight: `${API_BASE}/api/logs/weight`,          // GET ?from=&to=  |  POST
    weightById: (id: number) => `${API_BASE}/api/logs/weight/${id}`, // PUT
    steps: `${API_BASE}/api/logs/steps`,            // POST | GET ?from=&to=
  },
  /** Meal types */
  mealTypes: `${API_BASE}/api/meal-types`,          // GET
  /** User */
  user: {
    onboarding: `${API_BASE}/api/User/onboarding`,
    profile: `${API_BASE}/api/User/profile`,
    goal: `${API_BASE}/api/User/goal`,
    info: `${API_BASE}/api/User/info`,
    avatar: `${API_BASE}/api/User/avatar`,
    account: `${API_BASE}/api/User/account`,
    calories: `${API_BASE}/api/User/calories`,
  },
  exercises: {
    categories: `${API_BASE}/api/exercises/categories`,
    detail: (id: string) => `${API_BASE}/api/exercises/${id}`,
    logs: `${API_BASE}/api/exercises/logs`,
    logDetail: (id: string) => `${API_BASE}/api/exercises/logs/${id}`,
    dailySummary: (date: string) => `${API_BASE}/api/exercises/logs/daily/${date}`,
  },
};
