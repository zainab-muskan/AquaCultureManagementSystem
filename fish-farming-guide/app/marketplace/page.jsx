"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { farmApi } from "@/integration/farmApi";
import {Heart, Fish, MapPin, Loader2, Search, ArrowLeft, Star, ShoppingCart, Send, X, Package, Trash2, ChevronDown, Filter, ArrowUpDown, Bell } from "lucide-react";
import FarmReviewsModal from "@/components/layout/FarmReviewsModal";

export default function MarketplacePage() {
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [reviewsModal, setReviewsModal] = useState({ isOpen: false, farmId: null, farmName: "" });
    const [purchaseModal, setPurchaseModal] = useState({ isOpen: false, farmId: null, farmName: "", speciesName: "", maxQuantity: 0 });
    const [purchaseQuantity, setPurchaseQuantity] = useState("");
    const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);

    const [requestsModalOpen, setRequestsModalOpen] = useState(false);
    const [purchasesModalOpen, setPurchasesModalOpen] = useState(false);
    const [consumerRequests, setConsumerRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [hasUnreadReplies, setHasUnreadReplies] = useState(false);
    const [favorites, setFavorites] = useState([]);
    
    // Alerts State
    const [favoriteAlerts, setFavoriteAlerts] = useState([]);
    const [alertsModalOpen, setAlertsModalOpen] = useState(false);

    // User info for display
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/");
            return;
        }
        setUser(JSON.parse(storedUser));

        fetchFavorites();
        fetchListings();
        fetchRegions();
        fetchConsumerRequestsSilent();
        fetchFavoriteAlerts();
    }, [router]);

    const fetchFavoriteAlerts = async () => {
        try {
            const result = await farmApi.getFavoriteAlerts();
            if (result && result.success) {
                // Only show alerts for stock added within the last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                
                const recentAlerts = result.data.filter(alert => {
                    // Use SaleDate (when the farmer marked it For Sale) instead of StockingDate
                    const saleDate = new Date(alert.SaleDate);
                    return saleDate >= sevenDaysAgo;
                });
                
                setFavoriteAlerts(recentAlerts);
            }
        } catch (err) {
            console.error("Fetch alerts error:", err);
        }
    };

    const fetchFavorites = async () => {
        try {
            const result = await farmApi.getFavorites();
            if (result.success) {
                setFavorites(result.data);
            }
        } catch (err) {
            console.error("Fetch favorites error:", err);
        }
    };

    // Silent fetch on page load to detect blinking state
    const fetchConsumerRequestsSilent = async () => {
        try {
            const result = await farmApi.getConsumerRequests();
            if (result.success) {
                setConsumerRequests(result.data);
                const hasReplies = result.data.some(r => r.Status === 'Replied' || r.Status === 'Approved');
                setHasUnreadReplies(hasReplies);
            }
        } catch (err) {
            console.error("Silent fetch requests error:", err);
        }
    };

    const fetchRegions = async () => {
        try {
            const result = await farmApi.getMarketplaceRegions();
            if (result.success) {
                setRegions(result.data);
            }
        } catch (err) {
            console.error("Fetch regions error:", err);
        }
    };

    const fetchListings = async (regionId = null) => {
        setLoading(true);
        setError(null);
        try {
            const result = await farmApi.getMarketplaceListings(null, null, regionId);
            if (result.success) {
                setListings(result.data);
            } else {
                setError(result.error || "Failed to load listings");
            }
        } catch (err) {
            console.error("Fetch listings error:", err);
            setError("Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    const handleRegionChange = (e) => {
        const val = e.target.value;
        setSelectedRegion(val);
        fetchListings(val || null);
    };

    const fetchConsumerRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const result = await farmApi.getConsumerRequests();
            if (result.success) {
                setConsumerRequests(result.data);
                const hasReplies = result.data.some(r => r.Status === 'Replied' || r.Status === 'Approved');
                setHasUnreadReplies(hasReplies);
            }
        } catch (err) {
            console.error("Fetch requests error:", err);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!confirm("Are you sure you want to cancel and delete this request?")) return;
        try {
            const result = await farmApi.deletePurchaseRequest(requestId);
            if (result.success) {
                fetchConsumerRequests();
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete request.");
        }
    };

    const handlePurchaseSubmit = async () => {
        const qty = parseInt(purchaseQuantity);
        if (!qty || qty <= 0 || qty > purchaseModal.maxQuantity) {
            alert("Please enter a valid quantity up to " + purchaseModal.maxQuantity);
            return;
        }
        setIsSubmittingPurchase(true);
        try {
            const result = await farmApi.createPurchaseRequest({
                farmId: purchaseModal.farmId,
                speciesName: purchaseModal.speciesName,
                requestedQuantity: qty
            });
            if (result.success) {
                alert("Purchase request submitted to the farmer!");
                setPurchaseModal({ isOpen: false, farmId: null, farmName: "", speciesName: "", maxQuantity: 0 });
                setPurchaseQuantity("");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit request.");
        } finally {
            setIsSubmittingPurchase(false);
        }
    };

    const toggleFavorite = async (farmId) => {
        // Optimistic UI update
        const isCurrentlyFav = favorites.includes(farmId);
        if (isCurrentlyFav) {
            setFavorites(favorites.filter(id => id !== farmId));
        } else {
            setFavorites([...favorites, farmId]);
        }

        try {
            await farmApi.toggleFavorite(farmId);
        } catch (err) {
            console.error("Toggle favorite error:", err);
            // Revert on failure
            if (isCurrentlyFav) {
                setFavorites([...favorites, farmId]);
            } else {
                setFavorites(favorites.filter(id => id !== farmId));
            }
        }
    };

    const getStockBadge = (quantity) => {
        if (quantity < 1000) {
            return <span className="inline-block px-2 py-1 bg-red-50 text-red-600 font-bold text-[10px] rounded shadow-sm border border-red-100 uppercase tracking-wide ml-2">Low Stock</span>;
        } else if (quantity >= 5000) {
            return <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 font-bold text-[10px] rounded shadow-sm border border-emerald-100 uppercase tracking-wide ml-2">High Availability</span>;
        }
        return null;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <Fish className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold text-gray-900">Fish Marketplace</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {user.role === 'user' && (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <ArrowLeft size={16} /> Back to Farm
                            </button>
                        )}
                        {user && (
                            <>
                            <button
                                onClick={() => setAlertsModalOpen(true)}
                                className={`relative p-2 rounded-lg transition-all ${favoriteAlerts.length > 0 
                                    ? 'text-amber-500 hover:bg-amber-50 animate-pulse' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Bell size={20} />
                                {favoriteAlerts.length > 0 && (
                                    <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                                        {favoriteAlerts.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => { fetchConsumerRequests(); setPurchasesModalOpen(true); }}
                                className="text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all hidden sm:flex"
                            >
                                <Package size={16} /> My Purchases
                            </button>
                            <button
                                onClick={() => { fetchConsumerRequests(); setRequestsModalOpen(true); }}
                                className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${hasUnreadReplies
                                        ? 'bg-emerald-600 text-white animate-pulse shadow-lg shadow-emerald-500/40 hover:bg-emerald-700'
                                        : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                                    }`}
                            >
                                <ShoppingCart size={16} /> My Requests
                                {hasUnreadReplies && (
                                    <span className="ml-1 bg-white text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                        !
                                    </span>
                                )}
                            </button>
                            </>
                        )}
                        <span className="text-sm text-gray-600 hidden sm:block">Hello, {user.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-500 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 mt-8">
                {/* Tools Header */}
                <div className="flex flex-col gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Available Fish by Region</h2>
                            <p className="text-sm text-gray-500">Find farmers selling fingerlings and grown stock in your area.</p>
                        </div>

                        <div className="relative">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                            <select
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                className="appearance-none bg-blue-50 text-blue-700 pl-9 pr-10 py-2.5 rounded-lg hover:bg-blue-100 transition font-medium text-sm border border-blue-200 focus:ring-2 focus:ring-blue-300 focus:outline-none cursor-pointer min-w-[200px]"
                            >
                                <option value="">All Regions</option>
                                {regions.map(r => (
                                    <option key={r.RegionId} value={r.RegionId}>
                                        {r.RegionName} ({r.Province})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-purple-50 text-purple-700 pl-9 pr-10 py-2.5 rounded-lg hover:bg-purple-100 transition font-medium text-sm border border-purple-200 focus:ring-2 focus:ring-purple-300 focus:outline-none cursor-pointer min-w-[200px]"
                            >
                                <option value="default">Sort: Default</option>
                                <option value="favorites">Favorites Only</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                                <option value="alpha">Species: A-Z</option>
                                <option value="quantity">Quantity: High → Low</option>
                                <option value="quantity_asc">Quantity: Low → High</option>
                                <option value="rating">Highest Rating</option>
                                <option value="recent">Recently Stocked</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by species name (e.g. Rohu, Catla, Silver Carp...)"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:outline-none transition"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
                        <p className="font-medium">{error}</p>
                        <button onClick={() => fetchListings()} className="mt-3 text-sm underline">Try Again</button>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="bg-white border text-center py-20 rounded-xl shadow-sm">
                        <Fish className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No fish available right now</h3>
                        <p className="text-gray-500">Check back later for new listings from local farmers.</p>
                    </div>
                ) : (() => {
                    const searchFiltered = listings.filter(item => item.SpeciesName.toLowerCase().includes(searchTerm.toLowerCase()));
                    const filtered = sortBy === 'favorites' ? searchFiltered.filter(item => favorites.includes(item.FarmId)) : searchFiltered;
                    const sorted = [...filtered].sort((a, b) => {
                        if (sortBy === 'quantity') {
                            const qA = a.IsForSale === 1 ? (a.QuantityForSale || 0) : (a.TotalQuantity || 0);
                            const qB = b.IsForSale === 1 ? (b.QuantityForSale || 0) : (b.TotalQuantity || 0);
                            return qB - qA;
                        }
                        if (sortBy === 'quantity_asc') {
                            const qA = a.IsForSale === 1 ? (a.QuantityForSale || 0) : (a.TotalQuantity || 0);
                            const qB = b.IsForSale === 1 ? (b.QuantityForSale || 0) : (b.TotalQuantity || 0);
                            return qA - qB;
                        }
                        if (sortBy === 'price_asc') {
                            const pA = a.IsForSale === 1 && a.SalePricePerUnit ? a.SalePricePerUnit : Infinity;
                            const pB = b.IsForSale === 1 && b.SalePricePerUnit ? b.SalePricePerUnit : Infinity;
                            return pA - pB;
                        }
                        if (sortBy === 'price_desc') {
                            const pA = a.IsForSale === 1 && a.SalePricePerUnit ? a.SalePricePerUnit : -1;
                            const pB = b.IsForSale === 1 && b.SalePricePerUnit ? b.SalePricePerUnit : -1;
                            return pB - pA;
                        }
                        if (sortBy === 'alpha') {
                            return (a.SpeciesName || '').localeCompare(b.SpeciesName || '');
                        }
                        if (sortBy === 'rating') return (b.AverageRating || 0) - (a.AverageRating || 0);
                        if (sortBy === 'recent') return new Date(b.LastStocked) - new Date(a.LastStocked);
                        return 0;
                    });
                    return sorted.length === 0 ? (
                        <div className="bg-white border text-center py-20 rounded-xl shadow-sm">
                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No results for &quot;{searchTerm}&quot;</h3>
                            <p className="text-gray-500">Try a different species name or clear your search.</p>
                            <button onClick={() => setSearchTerm("")} className="mt-3 text-sm text-blue-600 hover:underline font-medium">Clear Search</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sorted.map((item) => (
                                <div key={`${item.FarmId}-${item.SpeciesName}`} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-block px-2.5 py-1 bg-white text-blue-700 font-bold text-xs rounded shadow-sm border border-blue-100 uppercase tracking-wide">
                                                    {item.SpeciesName}
                                                </span>
                                                {item.IsForSale === 1 ? (
                                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 font-bold text-[10px] rounded shadow-sm border border-green-200 uppercase tracking-wide">
                                                        For Sale
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 font-bold text-[10px] rounded shadow-sm border border-gray-200 uppercase tracking-wide">
                                                        Growing
                                                    </span>
                                                )}
                                                {getStockBadge(item.IsForSale === 1 ? item.QuantityForSale : item.TotalQuantity)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toggleFavorite(item.FarmId)}
                                                    className="p-1 rounded-full hover:bg-white/60 transition-colors"
                                                    title={favorites.includes(item.FarmId) ? "Remove from Favorites" : "Add to Favorites"}
                                                >
                                                    <Heart size={18} className={favorites.includes(item.FarmId) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"} />
                                                </button>
                                                <span className="text-xl font-black text-gray-900">
                                                    {item.IsForSale === 1 ? item.QuantityForSale.toLocaleString() : item.TotalQuantity.toLocaleString()} <span className="text-sm text-gray-500 font-normal">fish</span>
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mt-2">Avg Size: {Number(item.AvgSizeInches).toFixed(1)}"</h3>
                                        {item.SalePricePerUnit && item.IsForSale === 1 && (
                                            <p className="text-emerald-700 font-black text-base mt-1">
                                                PKR {Number(item.SalePricePerUnit).toLocaleString()} <span className="text-xs font-medium text-emerald-500">/ fish</span>
                                            </p>
                                        )}
                                        <p className="text-gray-600 font-medium text-sm mt-1">Stocked: {new Date(item.LastStocked).toLocaleDateString()}</p>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-start gap-3 mb-4 text-sm">
                                            <div className="mt-0.5">
                                                <MapPin size={18} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.FarmName || "Unnamed Farm"}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">Farmer: {item.FarmerName}</p>
                                                {item.RegionName && <p className="text-blue-500 text-xs mt-0.5 font-medium">{item.RegionName}</p>}

                                                {/* Ratings Display */}
                                                {(item.TotalReviews > 0) ? (
                                                    <div
                                                        onClick={() => setReviewsModal({ isOpen: true, farmId: item.FarmId, farmName: item.FarmName || "Unnamed Farm" })}
                                                        className="flex items-center gap-1 mt-1.5 cursor-pointer group"
                                                    >
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star
                                                                    key={star}
                                                                    size={12}
                                                                    className={star <= Math.round(item.AverageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-blue-600 font-medium group-hover:underline ml-1 transition">
                                                            {item.TotalReviews} Review{item.TotalReviews !== 1 && 's'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => setReviewsModal({ isOpen: true, farmId: item.FarmId, farmName: item.FarmName || "Unnamed Farm" })}
                                                        className="flex items-center gap-1 mt-1.5 cursor-pointer group"
                                                    >
                                                        <Star size={12} className="text-gray-300 transition group-hover:text-yellow-400" />
                                                        <span className="text-xs text-gray-400 group-hover:text-blue-600 group-hover:underline transition">
                                                            No ratings yet • Be the first!
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* ========================================================================= 
                                        ALTERNATIVE UI BLOCK (WITH CALL BUTTON)
                                        To use: Uncomment this block, and comment out the active block below.
                                    ========================================================================= */}
                                        {/* 
                                    {item.IsForSale === 1 ? (
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <a href={`tel:${item.FarmerPhone || '00000000'}`} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-xs transition shadow-sm flex items-center justify-center gap-1">
                                                Call 
                                            </a>
                                            <a href={`mailto:${item.FarmerEmail || ''}`} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-xs transition shadow-sm flex items-center justify-center gap-1">
                                               Send Email
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-center bg-gray-50 text-gray-400 py-2 rounded-lg font-medium text-xs border border-gray-100">
                                            Not for sale
                                        </div>
                                    )} 
                                    */}

                                        {/* ========================================================================= 
                                        ACTIVE UI BLOCK
                                    ========================================================================= */}
                                        {item.IsForSale === 1 ? (
                                            <div className="mt-2 grid grid-cols-1 gap-2">
                                                {user ? (
                                                    <button
                                                        onClick={() => setPurchaseModal({ isOpen: true, farmId: item.FarmId, farmName: item.FarmName, speciesName: item.SpeciesName, maxQuantity: item.QuantityForSale, salePricePerUnit: item.SalePricePerUnit || null })}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium text-xs transition shadow-sm flex items-center justify-center gap-1"
                                                    >
                                                        <ShoppingCart size={14} /> Request to Buy
                                                    </button>
                                                ) : (
                                                    <a href={`mailto:${item.FarmerEmail || ''}`} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-xs transition shadow-sm flex items-center justify-center gap-1">
                                                        Send Email
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-center bg-gray-50 text-gray-400 py-2 rounded-lg font-medium text-xs border border-gray-100">
                                                Not for sale
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </main>

            <FarmReviewsModal
                isOpen={reviewsModal.isOpen}
                onClose={() => setReviewsModal({ isOpen: false, farmId: null, farmName: "" })}
                farmId={reviewsModal.farmId}
                farmName={reviewsModal.farmName}
                onRatingSubmitted={() => fetchListings(selectedRegion || null)}
            />

            {/* Purchase Request Modal */}
            {purchaseModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50">
                            <div>
                                <h2 className="text-xl font-bold text-emerald-900">Request to Buy</h2>
                                <p className="text-xs text-emerald-600 font-medium">from {purchaseModal.farmName || 'Unnamed Farm'}</p>
                            </div>
                            <button onClick={() => setPurchaseModal({ ...purchaseModal, isOpen: false })} className="text-gray-400 hover:bg-white hover:text-gray-600 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Species</p>
                                <p className="font-semibold text-gray-900 text-lg">{purchaseModal.speciesName}</p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity Required (Max: {purchaseModal.maxQuantity})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={purchaseModal.maxQuantity}
                                    value={purchaseQuantity}
                                    onChange={(e) => setPurchaseQuantity(e.target.value)}
                                    className="w-full border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-gray-900 text-lg p-3"
                                    placeholder="e.g. 500"
                                />
                            </div>
                            {purchaseModal.salePricePerUnit && purchaseQuantity && Number(purchaseQuantity) > 0 && (
                                <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Estimated Cost</p>
                                    <p className="text-xl font-black text-emerald-800">PKR {(Number(purchaseQuantity) * Number(purchaseModal.salePricePerUnit)).toLocaleString()}</p>
                                    <p className="text-[10px] text-emerald-500 mt-0.5">@ PKR {Number(purchaseModal.salePricePerUnit).toLocaleString()} per fish</p>
                                </div>
                            )}
                            <button
                                onClick={handlePurchaseSubmit}
                                disabled={isSubmittingPurchase || !purchaseQuantity}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                            >
                                {isSubmittingPurchase ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Send Request to Farmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Consumer Requests Modal */}
            {requestsModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-gray-50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <ShoppingCart size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">My Purchase Requests</h2>
                            </div>
                            <button onClick={() => setRequestsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {isLoadingRequests ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
                            ) : consumerRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">You haven't made any purchase requests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {consumerRequests.map(req => (
                                        <div key={req.RequestId} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{req.SpeciesName}</h3>
                                                    <p className="text-sm text-gray-500">{req.FarmName || 'Unnamed Farm'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wide ${req.Status === 'Pending' ? 'bg-amber-100 text-amber-700' : req.Status === 'Approved' ? 'bg-green-100 text-green-800 ring-1 ring-green-300' : req.Status === 'Denied' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {req.Status === 'Approved' ? '✓ Approved' : req.Status}
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(req.CreatedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between mb-3 border border-gray-100">
                                                <span className="text-gray-600">Requested Quantity:</span>
                                                <span className="font-bold text-gray-900">{req.RequestedQuantity}</span>
                                            </div>

                                            {req.Status === 'Replied' && req.FarmerReply && (
                                                <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-3">
                                                    <p className="text-xs font-bold text-emerald-800 mb-1 uppercase tracking-wider">Farmer Reply</p>
                                                    <p className="text-emerald-900 text-sm mb-2">{req.FarmerReply}</p>
                                                    {req.ReplyLatitude && req.ReplyLongitude && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${req.ReplyLatitude},${req.ReplyLongitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-100/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                                                        >
                                                            <MapPin size={14} /> View Pinned Location
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex justify-end mt-2 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleDeleteRequest(req.RequestId)}
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                                >
                                                    <Trash2 size={14} /> Cancel Request
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Consumer Purchases Modal */}
            {purchasesModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-gray-50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Package size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">My Purchases</h2>
                            </div>
                            <button onClick={() => setPurchasesModalOpen(false)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {isLoadingRequests ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
                            ) : consumerRequests.filter(r => r.Status === 'Approved').length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">You haven't made any purchases yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {consumerRequests.filter(r => r.Status === 'Approved').map(req => (
                                        <div key={req.RequestId} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{req.SpeciesName}</h3>
                                                    <p className="text-sm text-gray-500">Purchased from {req.FarmName || 'Unnamed Farm'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wide bg-blue-100 text-blue-800 ring-1 ring-blue-300">
                                                        ✓ Purchased
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(req.UpdatedAt || req.CreatedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between border border-gray-100">
                                                <span className="text-gray-600">Quantity Bought:</span>
                                                <span className="font-bold text-gray-900">{req.RequestedQuantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Favorite Alerts Modal */}
            {alertsModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-gray-50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <Bell size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">New from Favorites</h2>
                            </div>
                            <button onClick={() => setAlertsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {favoriteAlerts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No new sales from your favorite farms in the last 7 days.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {favoriteAlerts.map((alert, index) => (
                                        <div key={index} className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                            <div className="flex justify-between items-start mb-2 ml-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                        {alert.SpeciesName}
                                                        <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-black px-2 py-0.5 rounded">New</span>
                                                    </h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                        <MapPin size={12} className="text-gray-400"/> {alert.FarmName || 'Unnamed Farm'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-emerald-600 font-black text-lg">PKR {Number(alert.SalePricePerUnit).toLocaleString()}</p>
                                                    <p className="text-xs text-gray-400">per fish</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between mt-3 border border-gray-100 ml-2">
                                                <span className="text-gray-600">Available Quantity:</span>
                                                <span className="font-bold text-gray-900">{alert.QuantityForSale.toLocaleString()} pieces</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
