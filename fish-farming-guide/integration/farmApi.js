// API base URL - uses Next.js rewrites to proxy to the backend
// In next.config.mjs, /api/* is rewritten to http://localhost:5000/api/*
const BASE_URL = "/api";

const getAuthToken = () => {
    return localStorage.getItem("token") || "";
};

const fetchWithAuth = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            console.warn("Session expired or invalid token. Redirecting to login...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
            return new Promise(() => { });
        }

        const text = await response.text();
        try {
            let errorData = JSON.parse(text);
            if (typeof errorData === 'string') {
                try {
                    errorData = JSON.parse(errorData);
                } catch (e) { }
            }
            throw new Error(errorData.message || errorData.error || errorData || `API Error: ${response.status}`);
        } catch (e) {
            if (e.message && !e.message.startsWith("Unexpected token")) throw e;
            console.error("Non-JSON Response:", text);
            throw new Error(`API Request Failed (${response.status}): ${text.substring(0, 100)}...`);
        }
    }

    return response.json();
};

export const farmApi = {
    // Auth Operations
    login: (email, password) => fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }),
    signup: (data) => fetchWithAuth("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Marketplace
    getMarketplaceListings: (lat, lng, regionId) => {
        const params = [];
        if (lat && lng) { params.push(`lat=${lat}`, `lng=${lng}`); }
        if (regionId) { params.push(`regionId=${regionId}`); }
        const query = params.length > 0 ? `?${params.join('&')}` : "";
        return fetchWithAuth(`/marketplace${query}`);
    },
    getMarketplaceRegions: () => fetchWithAuth("/marketplace/regions"),
    getFarmRatings: (farmId) => fetchWithAuth(`/marketplace/farm/${farmId}/ratings`),
    rateFarm: (farmId, rating, comment) => fetchWithAuth(`/marketplace/farm/${farmId}/rate`, {
        method: "POST",
        body: JSON.stringify({ rating, comment })
    }),
    getFavorites: () => fetchWithAuth("/marketplace/favorites"),
    getFavoriteAlerts: () => fetchWithAuth("/marketplace/favorites/alerts"),
    toggleFavorite: (farmId) => fetchWithAuth("/marketplace/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ farmId })
    }),
    createMarketplaceListing: (data) => fetchWithAuth("/marketplace", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateListingStatus: (id, status) => fetchWithAuth(`/marketplace/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
    }),
    getRegions: () => fetchWithAuth("/regions"),
    getPondTypes: () => fetchWithAuth("/ponds/types"),
    setupFarm: async (farmData) => {
        return fetchWithAuth("/farm/setup", {
            method: "POST",
            body: JSON.stringify(farmData),
        });
    },
    provisionPond: async (pondData) => {
        return fetchWithAuth("/farm/provision-pond", {
            method: "POST",
            body: JSON.stringify(pondData),
        });
    },
    calculatePondSpecs: async (speciesList, totalFarmArea, stage = 'Nursery', cultivationType = 'Extensive', pondStructure = 'Earthen Pond', pondShape = 'Rectangle', pondSize = null) => {
        return fetchWithAuth("/farm/calculate-pond-specs", {
            method: "POST",
            body: JSON.stringify({ speciesList, totalFarmArea, stage, cultivationType, pondStructure, pondShape, pondSize }),
        });
    },
    getFarmDetails: () => fetchWithAuth("/farm/my-farm"),
    resetFarm: () => fetchWithAuth("/farm/reset-farm", { method: "DELETE" }),
    getFarmPreview: (totalArea) => fetchWithAuth("/farm/preview", {
        method: "POST",
        body: JSON.stringify({ totalArea }),
    }),
    getPonds: () => fetchWithAuth("/ponds"),
    addPond: (data) => fetchWithAuth("/ponds", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updatePond: (id, data) => fetchWithAuth(`/ponds/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    getPondOptions: () => fetchWithAuth("/ponds/options"),
    getPondRecommendations: (acres, type) => fetchWithAuth(`/ponds/recommend?acres=${acres}&type=${type}`),
    markPondMaintained: (id) => fetchWithAuth(`/ponds/${id}/maintain`, {
        method: "PUT"
    }),
    deletePond: (id) => fetchWithAuth(`/ponds/${id}`, {
        method: "DELETE"
    }),
    // Stocking Operations
    getApprovedSpecies: () => fetchWithAuth("/species"),
    getPendingSpecies: () => fetchWithAuth("/species/admin/pending"),
    addCustomSpecies: (data) => fetchWithAuth("/species/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    approveSpecies: (id, data) => fetchWithAuth(`/species/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify(data || {})
    }),
    rejectSpecies: (id) => fetchWithAuth(`/species/${id}`, {
        method: "DELETE"
    }),
    deleteSpecies: (id) => fetchWithAuth(`/species/${id}`, {
        method: "DELETE"
    }),
    getRegionalSpecies: (province) => fetchWithAuth(`/species/regional?province=${encodeURIComponent(province)}`),
    getSpeciesCompatibility: (speciesId) => fetchWithAuth(`/species/${speciesId}/compatibility`),
    getPolycultureMixes: () => fetchWithAuth("/species/polyculture/mixes"),
    getStockingPreview: (pondId, speciesId, quantity) =>
        fetchWithAuth(`/stocking/preview/${pondId}/${speciesId}?quantity=${quantity}`),
    stockFish: (data) => fetchWithAuth("/stocking/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updateStocking: (id, data) => fetchWithAuth(`/stocking/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    deleteStocking: (id) => fetchWithAuth(`/stocking/${id}`, {
        method: "DELETE"
    }),
    transferStocking: (stockId, toPondId, quantity) => fetchWithAuth("/stocking/transfer", {
        method: "PUT",
        body: JSON.stringify({ stockId, toPondId, quantity })
    }),
    transferWholePond: (fromPondId, toPondId) => fetchWithAuth("/stocking/transfer-whole-pond", {
        method: "PUT",
        body: JSON.stringify({ fromPondId, toPondId })
    }),
    toggleForSale: (stockId, isForSale, quantityForSale, salePricePerUnit) => fetchWithAuth(`/stocking/sale/${stockId}`, {
        method: "PUT",
        body: JSON.stringify({ isForSale, quantityForSale, salePricePerUnit })
    }),
    recordHarvest: (data) => fetchWithAuth("/harvest/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updateFarmArea: (totalArea, latitude, longitude) => fetchWithAuth("/farm/update", {
        method: "PUT",
        body: JSON.stringify({ totalArea, latitude, longitude })
    }),
    getUpdatePreview: (newTotalArea) => fetchWithAuth("/farm/update-preview", {
        method: "POST",
        body: JSON.stringify({ newTotalArea })
    }),
    getAreaUsage: () => fetchWithAuth("/farm/area-usage"),
    // Water Quality
    recordWaterQuality: (data) => fetchWithAuth("/water-quality/logs", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getWaterAlerts: () => fetchWithAuth("/water-quality/alerts/critical"),
    getWaterSummary: () => fetchWithAuth("/water-quality/latest-summary"),
    // Expenses
    addExpense: (data) => fetchWithAuth("/expenses/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),

    // Tasks (Smart To-Do List)
    getTasks: () => fetchWithAuth("/tasks"),
    addTask: (description) => fetchWithAuth("/tasks/add", {
        method: "POST",
        body: JSON.stringify({ description })
    }),
    completeTask: (taskId) => fetchWithAuth(`/tasks/complete/${taskId}`, {
        method: "PUT"
    }),
    deleteTask: (taskId) => fetchWithAuth(`/tasks/${taskId}`, {
        method: "DELETE"
    }),

    deleteExpense: (id) => fetchWithAuth(`/expenses/${id}`, { method: "DELETE" }),
    getExpenseSummary: () => fetchWithAuth("/expenses/summary/all"),
    getBudgetDashboard: () => fetchWithAuth("/expenses/dashboard"),
    getPondExpenses: (pondId) => fetchWithAuth(`/expenses/${pondId}`),
    // Feed Management
    getFeedRulesAll: () => fetchWithAuth("/feed/rules/all"),
    getFeedDashboard: () => fetchWithAuth("/feed/dashboard"),
    getFeedTypes: () => fetchWithAuth("/feed/types"),
    getFeedRecommendation: (pondId) => fetchWithAuth(`/feed/recommendation/${pondId}`),
    getGenericFeedingGuidelines: () => fetchWithAuth("/feed/guidelines/generic"),
    getFeedSchedule: () => fetchWithAuth("/feed/schedule"),
    logFeed: (data) => fetchWithAuth("/feed/log", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    // Fertilizers
    getFertilizerOptions: () => fetchWithAuth("/fertilizers/options"),
    getFertilizerCalculation: (size, type, intensity) => fetchWithAuth(`/fertilizers/calculate?size=${size}&type=${type}&intensity=${intensity}`),
    getFertilizerDashboard: () => fetchWithAuth("/fertilizers/dashboard"),
    getRecentFertilizations: () => fetchWithAuth("/fertilizers/history/all"),
    getFertilizerRecommendation: (pondId, intensity) => fetchWithAuth(`/fertilizers/recommendation/${pondId}/${intensity}`),
    logFertilizer: (data) => fetchWithAuth("/fertilizers/apply", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getFertilizerHistory: (pondId) => fetchWithAuth(`/fertilizers/history/${pondId}`),
    getFertilizerSchedule: () => fetchWithAuth("/fertilizers/schedule"),
    // Activity Feed
    getActivityFeed: () => fetchWithAuth("/activity/feed"),
    getFarmReports: (timeframe, startDate, endDate) => fetchWithAuth(`/reports?timeframe=${timeframe}${startDate ? '&startDate=' + startDate : ''}${endDate ? '&endDate=' + endDate : ''}`),
    getROIReport: (timeframe, startDate, endDate) => fetchWithAuth(`/reports/roi?timeframe=${timeframe}${startDate ? '&startDate=' + startDate : ''}${endDate ? '&endDate=' + endDate : ''}`),
    getKnowledgeGuides: () => fetchWithAuth("/info/guides"),
    addKnowledgeGuide: (data) => fetchWithAuth("/info/guides", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    deleteKnowledgeGuide: (id) => fetchWithAuth(`/info/guides/${id}`, {
        method: "DELETE"
    }),
    addKnowledgeSection: (data) => fetchWithAuth("/info/sections", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    deleteKnowledgeSection: (id) => fetchWithAuth(`/info/sections/${id}`, {
        method: "DELETE"
    }),
    // Mortality
    addMortality: (data) => fetchWithAuth("/mortality/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    // Inventory Management
    getInventorySummary: () => fetchWithAuth("/inventory/dashboard-summary"),
    getInventory: () => fetchWithAuth("/inventory"),
    addInventory: (data) => fetchWithAuth("/inventory/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updateInventory: (id, data) => fetchWithAuth(`/inventory/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    deleteInventory: (id) => fetchWithAuth(`/inventory/${id}`, {
        method: "DELETE"
    }),
    transferInventoryWhole: (data) => fetchWithAuth("/inventory/transfer-whole-pond", {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    // Feed Stock Management
    getFeedStock: () => fetchWithAuth("/inventory/feed/all"),
    addFeedStock: (data) => fetchWithAuth("/inventory/feed/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updateFeedStock: (id, data) => fetchWithAuth(`/inventory/feed/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    deleteFeedStock: (id) => fetchWithAuth(`/inventory/feed/${id}`, {
        method: "DELETE"
    }),
    getFeedTypes: () => fetchWithAuth("/inventory/feed/types"),
    // Fertilizer Stock Management
    getFertilizerStock: () => fetchWithAuth("/inventory/fertilizer/all"),
    addFertilizerStock: (data) => fetchWithAuth("/inventory/fertilizer/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updateFertilizerStock: (id, data) => fetchWithAuth(`/inventory/fertilizer/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    deleteFertilizerStock: (id) => fetchWithAuth(`/inventory/fertilizer/${id}`, {
        method: "DELETE"
    }),
    getFertilizerProducts: () => fetchWithAuth("/inventory/fertilizer/products"),

    // Treatment Stock Management
    getTreatmentStock: () => fetchWithAuth("/inventory/treatment/all"),
    addTreatmentStock: (data) => fetchWithAuth("/inventory/treatment/add", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updateTreatmentStock: (id, data) => fetchWithAuth(`/inventory/treatment/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    deleteTreatmentStock: (id) => fetchWithAuth(`/inventory/treatment/${id}`, {
        method: "DELETE"
    }),
    getTreatmentTypes: () => fetchWithAuth("/inventory/treatment/types"),

    // ==================================
    // NATIVE FARM PROFIT & LOSS API
    // ==================================
    getPnLSummary: () => fetchWithAuth("/farm/pnl"),
    updateBudget: (initialBudget) => fetchWithAuth("/farm/update-budget", {
        method: "POST",
        body: JSON.stringify({ initialBudget })
    }),

    // ==================================
    // DISEASE MANAGEMENT API
    // ==================================
    getDiseaseCatalog: () => fetchWithAuth("/diseases/catalog"),
    getOutbreaks: () => fetchWithAuth("/diseases/outbreaks"),
    logOutbreak: (data) => fetchWithAuth("/diseases/outbreaks", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    updateOutbreak: (id, data) => fetchWithAuth(`/diseases/outbreaks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    deleteOutbreak: (id) => fetchWithAuth(`/diseases/outbreaks/${id}`, {
        method: "DELETE"
    }),
    logTreatment: (data) => fetchWithAuth("/diseases/treatments", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getOutbreakTreatments: (outbreakId) => fetchWithAuth(`/diseases/outbreaks/${outbreakId}/treatments`),
    getDiseaseDashboard: () => fetchWithAuth("/diseases/dashboard"),

    // ==================================
    // GROWTH HISTORY API
    // ==================================
    getGrowthHistory: (stockId) => fetchWithAuth(`/stocking/${stockId}/growth-history`),
    getPondFCR: (pondId) => fetchWithAuth(`/ponds/${pondId}/fcr`),
    getPondFinancials: (pondId) => fetchWithAuth(`/ponds/${pondId}/financials`),

    // ==================================
    // PURCHASE REQUESTS API
    // ==================================
    createPurchaseRequest: (data) => fetchWithAuth("/marketplace/purchase-request", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    getConsumerRequests: () => fetchWithAuth("/marketplace/purchase-requests/consumer"),
    getFarmerRequests: () => fetchWithAuth("/marketplace/purchase-requests/farmer"),
    replyToPurchaseRequest: (requestId, payload) => fetchWithAuth(`/marketplace/purchase-requests/${requestId}/reply`, {
        method: "PUT",
        body: JSON.stringify(payload)
    }),
    denyPurchaseRequest: (requestId) => fetchWithAuth(`/marketplace/purchase-requests/${requestId}/deny`, {
        method: "PUT"
    }),
    approvePurchaseRequest: (requestId, payload) => fetchWithAuth(`/marketplace/purchase-requests/${requestId}/approve`, {
        method: "PUT",
        body: JSON.stringify(payload)
    }),
    deletePurchaseRequest: (requestId) => fetchWithAuth(`/marketplace/purchase-requests/${requestId}`, {
        method: "DELETE"
    }),

    // ==================================
    // ROI CALCULATOR API
    // ==================================
    getPondExpenseBreakdown: async (pondId) => {
        const response = await fetchWithAuth(`/expenses/pond/${pondId}/breakdown`);
        return response.success === false ? null : response;
    },
    updateHarvestRevenue: (harvestId, revenue) => fetchWithAuth(`/harvest/${harvestId}/revenue`, {
        method: "PATCH",
        body: JSON.stringify({ revenue })
    }),
    getFutureEstimation: (pondId) => fetchWithAuth(`/ponds/${pondId}/future-estimation`),

    // ==================================
    // ADMIN: USER MANAGEMENT API
    // ==================================
    getAdminUsers: () => fetchWithAuth("/admin/users"),
    getAdminFarms: () => fetchWithAuth("/admin/farms"),
    getAdminMarketplaceListings: () => fetchWithAuth("/admin/marketplace"),
    removeAdminMarketplaceListing: (stockId) => fetchWithAuth(`/admin/marketplace/${stockId}/remove`, { method: "PUT" }),
    getAdminPurchaseRequests: () => fetchWithAuth("/admin/purchase-requests"),
    deleteAdminPurchaseRequest: (requestId) => fetchWithAuth(`/admin/purchase-requests/${requestId}`, { method: "DELETE" }),
    getAdminDiseases: () => fetchWithAuth("/admin/diseases"),
    addAdminDisease: (data) => fetchWithAuth("/admin/diseases", { method: "POST", body: JSON.stringify(data) }),
    updateAdminDisease: (id, data) => fetchWithAuth(`/admin/diseases/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    toggleAdminDiseaseStatus: (id) => fetchWithAuth(`/admin/diseases/${id}/toggle`, { method: "PUT" }),
    getAdminTickets: () => fetchWithAuth("/admin/tickets"),
    replyToTicket: (id, reply) => fetchWithAuth(`/admin/tickets/${id}/reply`, { method: "PUT", body: JSON.stringify({ reply }) }),
    closeTicket: (id) => fetchWithAuth(`/admin/tickets/${id}/close`, { method: "PUT" }),
    // Announcements
    getNotifications: () => fetchWithAuth("/notifications"),
    getAdminAnnouncements: () => fetchWithAuth("/admin/announcements"),
    createAdminAnnouncement: (data) => fetchWithAuth("/admin/announcements", { method: "POST", body: JSON.stringify(data) }),
    deleteAdminAnnouncement: (id) => fetchWithAuth(`/admin/announcements/${id}`, { method: "DELETE" }),
    // Feed Rules Management
    getAdminFeedRules: () => fetchWithAuth("/admin/feed-rules"),
    createFeedRule: (data) => fetchWithAuth("/admin/feed-rules", { method: "POST", body: JSON.stringify(data) }),
    updateFeedRule: (id, data) => fetchWithAuth(`/admin/feed-rules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteFeedRule: (id) => fetchWithAuth(`/admin/feed-rules/${id}`, { method: "DELETE" }),
    // Fertilizer Rules Management
    getAdminFertilizerRules: () => fetchWithAuth("/admin/fertilizer-rules"),
    createFertilizerRule: (data) => fetchWithAuth("/admin/fertilizer-rules", { method: "POST", body: JSON.stringify(data) }),
    updateFertilizerRule: (id, data) => fetchWithAuth(`/admin/fertilizer-rules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteFertilizerRule: (id) => fetchWithAuth(`/admin/fertilizer-rules/${id}`, { method: "DELETE" }),
    // Stocking Rules
    getAdminStockingRules: () => fetchWithAuth("/admin/stocking-rules"),
    createAdminStockingRule: (data) => fetchWithAuth("/admin/stocking-rules", { method: "POST", body: JSON.stringify(data) }),
    updateAdminStockingRule: (id, data) => fetchWithAuth(`/admin/stocking-rules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteAdminStockingRule: (id) => fetchWithAuth(`/admin/stocking-rules/${id}`, { method: "DELETE" }),
    // Compatibility Rules
    getAdminCompatibilities: () => fetchWithAuth("/admin/compatibilities"),
    createAdminCompatibility: (data) => fetchWithAuth("/admin/compatibilities", { method: "POST", body: JSON.stringify(data) }),
    deleteAdminCompatibility: (id) => fetchWithAuth(`/admin/compatibilities/${id}`, { method: "DELETE" }),
    // User support
    submitTicket: (data) => fetchWithAuth("/support", { method: "POST", body: JSON.stringify(data) }),
    getMyTickets: () => fetchWithAuth("/support"),
    toggleUserStatus: (userId) => fetchWithAuth(`/admin/users/${userId}/toggle-status`, { method: "PUT" }),
    changeUserRole: (userId, role) => fetchWithAuth(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role })
    }),
    deleteUser: (userId) => fetchWithAuth(`/admin/users/${userId}`, { method: "DELETE" })
};
