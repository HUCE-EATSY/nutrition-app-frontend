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
  barcode?: number | null;
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

// ── Request cho tạo food mới ───────────────────────────────────────────────────
export interface CreateFoodRequest {
  nameVi: string;
  nameEn?: string;
  categoryId: number;
  servingSizeG: number;
  servingUnitVi?: string;
  image?: File | Blob;
  barcode?: number;
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
    nameVi: raw.name_vi || "Món ăn chưa rõ tên",
    nameEn: raw.name_en,
    category: "Chưa phân loại",
    categoryId: raw.category_id || 0,
    servingSizeG: raw.serving_size_g || 100,
    servingUnitVi: raw.serving_unit_vi || "g",
    imageUrl: raw.image_url,
    barcode: null,
    source: raw.source,
    caloriesKcal: raw.calories_kcal ?? 0,
    proteinG: raw.protein_g ?? 0,
    carbsG: raw.carbs_g ?? 0,
    fatG: raw.fat_g ?? 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
  };
}

function mapDetailToDto(raw: any): FoodItemDto {
  if (!raw) return {} as FoodItemDto;
  return {
    id: raw.id,
    nameVi: raw.name_vi || "Món ăn chưa rõ tên",
    nameEn: raw.name_en,
    category: raw.category?.name_vi || raw.category?.name_en || "Khác",
    categoryId: raw.category?.id || 0,
    servingSizeG: raw.serving_size_g || 100,
    servingUnitVi: raw.serving_unit_vi || "g",
    imageUrl: raw.image_url,
    barcode: raw.barcode,
    source: raw.source,
    caloriesKcal: raw.nutrition?.calories_kcal ?? 0,
    proteinG: raw.nutrition?.protein_g ?? 0,
    carbsG: raw.nutrition?.carbs_g ?? 0,
    fatG: raw.nutrition?.fat_g ?? 0,
    fiberG: raw.nutrition?.fiber_g ?? 0,
    sugarG: raw.nutrition?.sugar_g ?? 0,
    sodiumMg: raw.nutrition?.sodium_mg ?? 0,
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
      // NOTE: Giả định API_URLS.foods.base = '/api/foods' (nếu chưa có trong API_URLS thì tạm gọi trực tiếp)
      const res = await apiClient.get("/api/foods", {
        params: { CategoryId: categoryId, Page: page, PageSize: pageSize },
      });
      const resData = res.data.data ?? res.data;
      const items = Array.isArray(resData?.items) ? resData.items : (Array.isArray(resData) ? resData : []);
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
  getFoodByBarcode: async (barcode: number): Promise<FoodItemDto | null> => {
    if (USE_MOCK) {
      return mockFoods[0] || null;
    }
    const response = await apiClient.get(API_URLS.foods.barcode(barcode));
    const raw = response.data.data ?? response.data ?? null;
    return raw ? mapDetailToDto(raw) : null;
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
    if (req.barcode != null) form.append("Barcode", String(req.barcode));

    // Nutrition keys
    form.append("Nutrition.CaloriesKcal", String(req.nutrition.caloriesKcal));
    if (req.nutrition.proteinG != null) form.append("Nutrition.ProteinG", String(req.nutrition.proteinG));
    if (req.nutrition.carbsG != null) form.append("Nutrition.CarbsG", String(req.nutrition.carbsG));
    if (req.nutrition.fatG != null) form.append("Nutrition.FatG", String(req.nutrition.fatG));
    if (req.nutrition.fiberG != null) form.append("Nutrition.FiberG", String(req.nutrition.fiberG));
    if (req.nutrition.sugarG != null) form.append("Nutrition.SugarG", String(req.nutrition.sugarG));
    if (req.nutrition.sodiumMg != null) form.append("Nutrition.SodiumMg", String(req.nutrition.sodiumMg));

    const response = await apiClient.post(API_URLS.foods.create, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = response.data.data ?? response.data;
    return mapDetailToDto(raw);
  },

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

    // NOTE: Cần thêm API_URLS.foods.createRecipe vào api.ts nếu chưa có. Ở đây tạm dùng "/api/foods/recipes"
    const url = API_URLS.foods.createRecipe || "/api/foods/recipes";
    const response = await apiClient.post(url, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = response.data.data ?? response.data;
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

