/**
 * foodService.ts
 * Tất cả API calls liên quan đến Foods theo swagger:
 *   GET  /api/foods/search?Q=&CategoryId=&Page=&PageSize=
 *   GET  /api/foods/:uuid
 *   GET  /api/foods/:uuid/components
 *   GET  /api/foods/barcode/:int64
 *   POST /api/foods  (multipart/form-data)
 */

import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

// ── Response shape trả về từ backend ──────────────────────────────────────────
export interface FoodItemDto {
  /** UUID string */
  id: string;
  nameVi: string;
  nameEn?: string | null;
  category: string;
  categoryId: number;
  servingSizeG: number;
  servingUnitVi?: string | null;
  imageUrl?: string | null;
  barcode?: string | null;
  source?: number;
  /** Nutrition per serving */
  caloriesKcal: number;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  fiberG?: number | null;
  sugarG?: number | null;
  sodiumMg?: number | null;
}

export interface FoodSearchResult {
  items: FoodItemDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MealTypeDto {
  id: number;
  nameVi: string;
  nameEn?: string;
}

// ── EstimatedFoodResponse từ backend (POST /api/foods/estimate-nutrients) ──────
export interface EstimatedFoodNutrition {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
}

export interface EstimatedFoodResponse {
  name_en: string;
  image_url: string;
  serving_size_g: number;
  nutrition: EstimatedFoodNutrition;
}

// ── Request cho tạo food mới ───────────────────────────────────────────────────
export interface CreateFoodRequest {
  nameVi: string;
  nameEn?: string;
  categoryId: number;
  servingSizeG: number;
  servingUnitVi?: string;
  image?: File | Blob;
  imageUrl?: string; // URL Cloudinary đã upload sẵn (flow nhận diện AI)
  barcode?: string;
  nutrition: {
    caloriesKcal: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    fiberG?: number;
    sugarG?: number;
    sodiumMg?: number;
  };
}

export interface CreateRecipeRequest {
  nameVi: string;
  nameEn?: string;
  categoryId: number;
  servingUnitVi?: string;
  image?: any;
  components: {
    child_food_id: string;
    quantity_g: number;
  }[];
}

// ── Helper mapping functions ──────────────────────────────────────────────────
function mapSearchToDto(raw: any): FoodItemDto {
  if (!raw) return {} as FoodItemDto;
  return {
    id: raw.id,
    nameVi: raw.name_vi || raw.nameVi || "Món ăn chưa rõ tên",
    nameEn: raw.name_en || raw.nameEn,
    category: "Chưa phân loại",
    categoryId: raw.category_id || raw.categoryId || 0,
    servingSizeG: raw.serving_size_g || raw.servingSizeG || 100,
    servingUnitVi: raw.serving_unit_vi || raw.servingUnitVi || "g",
    imageUrl: raw.image_url || raw.imageUrl || null,
    barcode: null,
    source: raw.source,
    caloriesKcal: raw.calories_kcal ?? raw.caloriesKcal ?? 0,
    proteinG: raw.protein_g ?? raw.proteinG ?? 0,
    carbsG: raw.carbs_g ?? raw.carbsG ?? 0,
    fatG: raw.fat_g ?? raw.fatG ?? 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
  };
}

function mapDetailToDto(raw: any): FoodItemDto {
  if (!raw) return {} as FoodItemDto;
  return {
    id: raw.id,
    nameVi: raw.name_vi || raw.nameVi || "Món ăn chưa rõ tên",
    nameEn: raw.name_en || raw.nameEn,
    category: raw.category?.name_vi || raw.category?.nameVi || raw.category?.name_en || raw.category?.nameEn || "Khác",
    categoryId: raw.category?.id || 0,
    servingSizeG: raw.serving_size_g || raw.servingSizeG || 100,
    servingUnitVi: raw.serving_unit_vi || raw.servingUnitVi || "g",
    imageUrl: raw.image_url || raw.imageUrl || null,
    barcode: raw.barcode,
    source: raw.source,
    caloriesKcal: raw.nutrition?.calories_kcal ?? raw.nutrition?.caloriesKcal ?? raw.caloriesKcal ?? 0,
    proteinG: raw.nutrition?.protein_g ?? raw.nutrition?.proteinG ?? raw.proteinG ?? 0,
    carbsG: raw.nutrition?.carbs_g ?? raw.nutrition?.carbsG ?? raw.carbsG ?? 0,
    fatG: raw.nutrition?.fat_g ?? raw.nutrition?.fatG ?? raw.fatG ?? 0,
    fiberG: raw.nutrition?.fiber_g ?? raw.nutrition?.fiberG ?? raw.fiberG ?? 0,
    sugarG: raw.nutrition?.sugar_g ?? raw.nutrition?.sugarG ?? raw.sugarG ?? 0,
    sodiumMg: raw.nutrition?.sodium_mg ?? raw.nutrition?.sodiumMg ?? raw.sodiumMg ?? 0,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const mockFoods: FoodItemDto[] = [
  { id: "mock-food-1", nameVi: "Bún chả Hà Nội", category: "Bún/Phở/Mỳ", categoryId: 1, servingSizeG: 350, servingUnitVi: "bát", caloriesKcal: 450, proteinG: 18, carbsG: 62, fatG: 12 },
  { id: "mock-food-2", nameVi: "Cơm tấm sườn bì chả", category: "Cơm", categoryId: 2, servingSizeG: 400, servingUnitVi: "dĩa", caloriesKcal: 657, proteinG: 32, carbsG: 85, fatG: 21 },
  { id: "mock-food-3", nameVi: "Phở bò chín", category: "Bún/Phở/Mỳ", categoryId: 1, servingSizeG: 450, servingUnitVi: "tô", caloriesKcal: 560, proteinG: 24, carbsG: 70, fatG: 15 },
  { id: "mock-food-4", nameVi: "Bánh mì kẹp thịt", category: "Bánh mì", categoryId: 3, servingSizeG: 150, servingUnitVi: "ổ", caloriesKcal: 420, proteinG: 15, carbsG: 48, fatG: 16 },
  { id: "mock-food-5", nameVi: "Ức gà áp chảo", category: "Thịt/Cá", categoryId: 4, servingSizeG: 150, servingUnitVi: "phần", caloriesKcal: 250, proteinG: 38, carbsG: 0, fatG: 5 },
  { id: "mock-food-6", nameVi: "Trứng gà luộc", category: "Trứng", categoryId: 5, servingSizeG: 50, servingUnitVi: "quả", caloriesKcal: 78, proteinG: 6.5, carbsG: 0.6, fatG: 5.3 },
  { id: "mock-food-7", nameVi: "Sữa tươi không đường", category: "Đồ uống", categoryId: 6, servingSizeG: 200, servingUnitVi: "ml", caloriesKcal: 120, proteinG: 6, carbsG: 9, fatG: 7 },
  { id: "mock-food-8", nameVi: "Chuối chín", category: "Hoa quả", categoryId: 7, servingSizeG: 100, servingUnitVi: "quả", caloriesKcal: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3 }
];

export const foodService = {
  /**
   * Tìm kiếm món ăn
   * GET /api/foods/search?Q=&CategoryId=&Page=&PageSize=
   */
  searchFoods: async (params: {
    q: string;
    categoryId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<FoodSearchResult> => {
    if (USE_MOCK) {
      const qNormalized = params.q.toLowerCase().trim();
      const filtered = mockFoods.filter(item =>
        item.nameVi.toLowerCase().includes(qNormalized) &&
        (params.categoryId === undefined || item.categoryId === params.categoryId)
      );
      return {
        items: filtered,
        total: filtered.length,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      };
    }

    const response = await apiClient.get(API_URLS.foods.search, {
      params: {
        Q: params.q,
        CategoryId: params.categoryId,
        Page: params.page ?? 1,
        PageSize: params.pageSize ?? 20,
      },
    });
    const resData = response.data.data ?? response.data;

    const items = Array.isArray(resData?.items) ? resData.items : [];
    return {
      items: items.map(mapSearchToDto),
      total: resData?.total_count ?? items.length,
      page: resData?.page ?? 1,
      pageSize: resData?.page_size ?? 20,
    };
  },

  /**
   * Lấy danh sách món ăn mặc định
   * GET /api/foods
   */
  getAllFoods: async (page = 1, pageSize = 50, categoryId?: number): Promise<FoodItemDto[]> => {
    if (USE_MOCK) {
      return mockFoods.filter(item => categoryId === undefined || item.categoryId === categoryId);
    }
    try {
      const res = await apiClient.get("/api/foods", {
        params: { CategoryId: categoryId, Page: page, PageSize: pageSize },
      });
      const resData = res.data.data ?? res.data;
      const items = Array.isArray(resData?.items) ? resData.items : (Array.isArray(resData) ? resData : []);
      // DEBUG: xem raw response để kiểm tra field names
      if (items.length > 0) {
        console.log("[DEBUG] Raw food item từ API:", JSON.stringify(items[0], null, 2));
      }
      return items.map(mapSearchToDto);
    } catch {
      return [];
    }
  },

  /**
   * Lấy chi tiết món ăn theo UUID
   * GET /api/foods/:id
   */
  getFoodById: async (id: string): Promise<FoodItemDto | null> => {
    if (USE_MOCK) {
      return mockFoods.find(item => item.id === id) || null;
    }
    const response = await apiClient.get(API_URLS.foods.byId(id));
    const raw = response.data.data ?? response.data ?? null;
    return raw ? mapDetailToDto(raw) : null;
  },

  /**
   * Lấy thành phần dinh dưỡng chi tiết theo UUID
   * GET /api/foods/:id/components
   */
  getFoodComponents: async (id: string) => {
    if (USE_MOCK) {
      return [];
    }
    const response = await apiClient.get(API_URLS.foods.components(id));
    return response.data.data ?? response.data;
  },

  /**
   * Tìm theo barcode
   * GET /api/foods/barcode/:barcode
   */
  getFoodByBarcode: async (barcode: string): Promise<FoodItemDto | null> => {
    if (USE_MOCK) {
      return mockFoods[0] || null;
    }
    try {
      const response = await apiClient.get(API_URLS.foods.barcode(barcode));
      const raw = response.data.data ?? response.data ?? null;
      return raw ? mapDetailToDto(raw) : null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Không tìm thấy
      }
      throw error;
    }
  },

  /**
   * Tìm theo barcode và map sẵn sang định dạng FoodItem dùng cho UI
   */
  getFoodForUIByBarcode: async (barcode: string): Promise<any | null> => {
    const dto = await foodService.getFoodByBarcode(barcode);
    if (!dto) return null;
    return {
      id: dto.id,
      name: dto.nameVi || dto.nameEn || "Không xác định",
      category: dto.category || "Khác",
      calories: dto.caloriesKcal || 0,
      protein: dto.proteinG || 0,
      carbs: dto.carbsG || 0,
      fat: dto.fatG || 0,
      servingSize: dto.servingSizeG || 100,
      imageUrl: dto.imageUrl || null,
    };
  },

  /**
   * Tạo món ăn mới (community food)
   * POST /api/foods  multipart/form-data
   */
  createFood: async (req: CreateFoodRequest): Promise<FoodItemDto> => {
    if (USE_MOCK) {
      const newMock: FoodItemDto = {
        id: `mock-food-${Date.now()}`,
        nameVi: req.nameVi,
        category: "Món ăn tự tạo",
        categoryId: req.categoryId,
        servingSizeG: req.servingSizeG,
        servingUnitVi: req.servingUnitVi || "g",
        caloriesKcal: req.nutrition.caloriesKcal,
        proteinG: req.nutrition.proteinG || 0,
        carbsG: req.nutrition.carbsG || 0,
        fatG: req.nutrition.fatG || 0,
      };
      mockFoods.unshift(newMock);
      return newMock;
    }
    const form = new FormData();
    form.append("NameVi", req.nameVi);
    if (req.nameEn) form.append("NameEn", req.nameEn);
    form.append("CategoryId", String(req.categoryId));
    form.append("ServingSizeG", String(req.servingSizeG));
    if (req.servingUnitVi) form.append("ServingUnitVi", req.servingUnitVi);
    if (req.image) form.append("Image", req.image as any);
    if (req.imageUrl && !req.image) form.append("ImageUrl", req.imageUrl);
    if (req.barcode != null) form.append("Barcode", req.barcode);

    form.append("Nutrition.CaloriesKcal", String(req.nutrition.caloriesKcal));
    if (req.nutrition.proteinG != null) form.append("Nutrition.ProteinG", String(req.nutrition.proteinG));
    if (req.nutrition.carbsG != null) form.append("Nutrition.CarbsG", String(req.nutrition.carbsG));
    if (req.nutrition.fatG != null) form.append("Nutrition.FatG", String(req.nutrition.fatG));
    if (req.nutrition.fiberG != null) form.append("Nutrition.FiberG", String(req.nutrition.fiberG));
    if (req.nutrition.sugarG != null) form.append("Nutrition.SugarG", String(req.nutrition.sugarG));
    if (req.nutrition.sodiumMg != null) form.append("Nutrition.SodiumMg", String(req.nutrition.sodiumMg));

    const response = await apiClient.post(API_URLS.foods.create, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const raw = response.data.data ?? response.data;
    return mapDetailToDto(raw);
  },


  /**
   * Nhận diện dinh dưỡng từ URL ảnh Cloudinary
   * POST /api/foods/estimate-nutrients
   */
  estimateNutrients: async (image: any): Promise<EstimatedFoodResponse | null> => {
    try {
      const form = new FormData();
      form.append("Image", image as any);

      const response = await apiClient.post(API_URLS.foods.estimateNutrients, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // Spoonacular cần 15-30s để phân tích ảnh
      });

      const resData = response.data;
      return resData.data ?? resData ?? null;
    } catch (error: any) {
      console.error("estimateNutrients error:", error);
      if (error.response?.status === 404) return null;
      throw error;
    }
  },


  /**
   * Map EstimatedFoodResponse → FoodItem shape dùng cho FoodDetailModal.
   * Đặt id = "" vì food chưa tồn tại trong DB.
   */
  mapEstimatedToFoodItem: (estimated: EstimatedFoodResponse): any => ({
    id: "",           // Chưa có ID thật — sẽ tạo sau khi user xác nhận
    name: estimated.name_en || "Món ăn được nhận diện",
    category: "Nhận diện AI",
    calories: estimated.nutrition.calories_kcal,
    protein: estimated.nutrition.protein_g,
    carbs: estimated.nutrition.carbs_g,
    fat: estimated.nutrition.fat_g,
    servingSize: estimated.serving_size_g,
    imageUrl: estimated.image_url,
    // Giữ lại raw data để dùng khi gọi POST /api/foods
    _raw: estimated,
  }),

  /**
   * Tạo công thức mới (từ các nguyên liệu có sẵn)
   * POST /api/foods/recipes  multipart/form-data
   */
  createRecipe: async (req: CreateRecipeRequest): Promise<FoodItemDto> => {
    if (USE_MOCK) {
      const newMock: FoodItemDto = {
        id: `mock-recipe-${Date.now()}`,
        nameVi: req.nameVi,
        category: "Công thức tự tạo",
        categoryId: req.categoryId,
        servingSizeG: 100,
        servingUnitVi: req.servingUnitVi || "g",
        caloriesKcal: 150,
        proteinG: 10,
        carbsG: 15,
        fatG: 5,
      };
      mockFoods.unshift(newMock);
      return newMock;
    }
    const form = new FormData();
    form.append("NameVi", req.nameVi);
    if (req.nameEn) form.append("NameEn", req.nameEn);
    form.append("CategoryId", String(req.categoryId));
    if (req.servingUnitVi) form.append("ServingUnitVi", req.servingUnitVi);
    if (req.image) form.append("Image", req.image as any);

    req.components.forEach((comp, index) => {
      form.append(`Components[${index}].ChildFoodId`, comp.child_food_id);
      form.append(`Components[${index}].QuantityG`, String(comp.quantity_g));
    });


    const response = await apiClient.post(API_URLS.foods.createRecipe, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const resData = response.data;
    const raw = resData.data ?? resData;
    return mapDetailToDto(raw);
  },

};

// ── Meal Types ─────────────────────────────────────────────────────────────────
export const mealTypeService = {
  /**
   * Lấy danh sách loại bữa ăn
   * GET /api/meal-types
   */
  getMealTypes: async (): Promise<MealTypeDto[]> => {
    if (USE_MOCK) {
      return [
        { id: 1, nameVi: "Bữa sáng" },
        { id: 2, nameVi: "Bữa trưa" },
        { id: 3, nameVi: "Bữa tối" },
        { id: 4, nameVi: "Bữa phụ" },
      ];
    }
    const response = await apiClient.get(API_URLS.mealTypes);
    const data = response.data.data ?? response.data;
    const array = Array.isArray(data) ? data : [];
    return array.map((raw: any) => ({
      id: raw.id,
      nameVi: raw.name_vi || "Bữa ăn",
    }));
  },
};

