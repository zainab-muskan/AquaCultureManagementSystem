"use client";

import React, { useState, useEffect } from "react";
import { farmApi } from "@/integration/farmApi";
import WelcomeModal from "@/components/layout/WelcomeModal";
import AddPondModal from "@/components/layout/AddPondModal";
import AddFishModal from "@/components/layout/AddFishModal";
import TransferFishModal from "@/components/layout/TransferFishModal";
import ManageFeedModal from "@/components/layout/ManageFeedModal";
import UpdateFarmAreaModal from "@/components/layout/UpdateFarmAreaModal";
import WaterCycleModal from "@/components/layout/WaterCycleModal";
import FertilizerModal from "@/components/layout/FertilizerModal";
import AddExpenseModal from "@/components/layout/AddExpenseModal";
import UpdateSizeModal from "@/components/layout/UpdateSizeModal";
import HarvestModal from "@/components/layout/HarvestModal";
import PostHarvestROIModal from "@/components/layout/PostHarvestROIModal";
import MortalityModal from "@/components/layout/MortalityModal";
import EditPondModal from "@/components/layout/EditPondModal";
import SaleModal from "@/components/layout/SaleModal";
import TransferWholePondModal from "@/components/layout/TransferWholePondModal";
import GrowthDetailsModal from "@/components/layout/GrowthDetailsModal";
import SmartTodoList from "@/components/layout/SmartTodoList";
import SpeciesAlertModal from "@/components/layout/SpeciesAlertModal";
import DiseaseModal from "@/components/layout/DiseaseModal";
import TreatmentModal from "@/components/layout/TreatmentModal";
import FeedInfoModal from "@/components/layout/FeedInfoModal";
import DashboardTour from "@/components/layout/DashboardTour";
import FutureEstimationModal from "@/components/layout/FutureEstimationModal";
import FarmAlertsHub from "@/components/layout/FarmAlertsHub";

import {
    Scissors,
    AlertTriangle,
    Trash2,
    Pencil,
    Plus,
    Waves,
    Fish,
    FlaskConical,
    DollarSign,
    Droplets,
    Utensils,
    ArrowRightLeft,
    Skull,
    TrendingUp,
    Wrench,
    HeartPulse,
    Search,
    BarChart3,
    X,
    Clock,
    ShoppingCart,
    Send,
    Package,
    Loader2,
    MapPin,
    XCircle,
    CheckCircle,
    Sparkles
} from "lucide-react";
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import("@/components/layout/LocationPickerMap"), {
    ssr: false,
    loading: () => (
        <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl border border-slate-200 flex items-center justify-center">
            <p className="text-sm text-slate-400">Loading Map...</p>
        </div>
    )
});


export default function DashboardPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [user, setUser] = useState(null);

    // ---------- States ----------
    const [farmSetup, setFarmSetup] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [farmSkipped, setFarmSkipped] = useState(false);
    const [ponds, setPonds] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [areaUsage, setAreaUsage] = useState(null);
    const [waterAlerts, setWaterAlerts] = useState([]);
    const [expenseSummary, setExpenseSummary] = useState({ overall: { GrandTotal: 0 }, breakdown: [] });

    const [activePondId, setActivePondId] = useState(null);

    const [showAddPond, setShowAddPond] = useState(false);
    const [showAddFish, setShowAddFish] = useState(false);
    const [showWaterCycleModal, setShowWaterCycleModal] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(null);
    const [showFertilizerModal, setShowFertilizerModal] = useState(null);
    const [showManageFeedModal, setShowManageFeedModal] = useState(null);
    const [showUpdateFarmArea, setShowUpdateFarmArea] = useState(false);
    const [showMortalityModal, setShowMortalityModal] = useState(null);
    const [showEditPond, setShowEditPond] = useState(false);
    const [editingPond, setEditingPond] = useState(null);
    const [showTasksModal, setShowTasksModal] = useState(false);
    const [showFarmAlertsModal, setShowFarmAlertsModal] = useState(false);

    const [updateSizeModal, setUpdateSizeModal] = useState(null);
    const [showStockingConfirm, setShowStockingConfirm] = useState(false);
    const [hideEmptyPonds, setHideEmptyPonds] = useState(false);
    const [pondSortOrder, setPondSortOrder] = useState("created"); // "created" or "alpha"
    const [saleModal, setSaleModal] = useState(null);
    const [transferWholeModal, setTransferWholeModal] = useState(null);
    const [showGrowthPond, setShowGrowthPond] = useState(null);

    const [transferModal, setTransferModal] = useState(null);
    const [showHarvestModal, setShowHarvestModal] = useState(null);
    const [showROIModal, setShowROIModal] = useState(null);
    const [speciesAlertModal, setSpeciesAlertModal] = useState(null);
    const [showDiseaseModal, setShowDiseaseModal] = useState(null);
    const [treatmentModal, setTreatmentModal] = useState(null);
    const [diseaseOutbreaks, setDiseaseOutbreaks] = useState([]);
    const [waterSummary, setWaterSummary] = useState([]);
    const [feedInfoModal, setFeedInfoModal] = useState(null);
    const [fcrData, setFcrData] = useState({}); // { pondId: { fcr, rating, ... } }
    const [feedSchedule, setFeedSchedule] = useState([]); // Per-species feed schedule from DB
    const [fertilizerSchedule, setFertilizerSchedule] = useState([]);
    const [showFinancialsModal, setShowFinancialsModal] = useState(null);
    const [financialsData, setFinancialsData] = useState(null);
    const [financialsLoading, setFinancialsLoading] = useState(false);
    const [showFutureEstimation, setShowFutureEstimation] = useState(null);

    // --- PURCHASE REQUESTS STATE ---
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [farmerRequests, setFarmerRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [replyLocation, setReplyLocation] = useState(null);
    const [approvingRequest, setApprovingRequest] = useState(null); // { requestId, speciesName, qty }
    const [approvePrice, setApprovePrice] = useState("");
    const [processingAction, setProcessingAction] = useState(null); // requestId being processed

    // --- PANEL DEFENSE TASKS (Hidden States) ---
    const [searchTerm, setSearchTerm] = useState("");
    const [feedFilter, setFeedFilter] = useState("All");

    const [loading, setLoading] = useState(true);

    const normalizePondData = (pond) => ({
        ...pond,
        id: pond.PondId || pond.id,
        pondName: pond.PondName || pond.pondName || pond.name || "Unnamed Pond",
        size: Number(pond.Size || pond.size || 0),
        pondType: pond.PondType || pond.pondType || pond.type || "Grow-out",
        cultureType: pond.CultureType || pond.cultureType,
        cultivationType: pond.CultivationType || pond.cultivationType,
        stage: pond.Stage || pond.stage,
        // Dimensions
        length: pond.LengthFeet || pond.length,
        width: pond.WidthFeet || pond.width,
        depth: pond.DepthFeet || pond.depth,
        volume: pond.VolumeLiters || pond.volume,
        volumeGallons: Number(pond.VolumeGallons) || (Number(pond.VolumeLiters || pond.volume || 0) > 0 ? Math.round(Number(pond.VolumeLiters || pond.volume) * 0.264172) : 0),
        // Status Badges
        needsMaintenance: pond.NeedsMaintenance || pond.needsMaintenance || false,
        isAutoCreated: pond.IsAutoCreated || pond.isAutoCreated || false,
        species: (pond.species || []).map(s => {
            return {
                ...s,
                id: s.PondStockId || s.BatchId || s.id,
                SpeciesId: s.SpeciesId || s.batchSpeciesId,
                species: s.SpeciesName || s.species,
                quantity: s.Quantity || s.quantity,
                currentSize: s.CurrentSizeInch || s.currentSize,
                targetSize: s.TargetSizeInch || s.targetSize,
                lastUpdateDate: s.LastSizeUpdateDate || s.lastUpdateDate,
                isForSale: s.IsForSale || false,
                quantityForSale: s.QuantityForSale || 0
            };
        })
    });

    // ---------- 1. Get User and Load Farm Data from Backend ----------
    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            const userData = JSON.parse(loggedInUser);
            setUser(userData);

            // Fetch Farm Details from Backend to check if setup is done
            const loadFarmData = async () => {
                try {
                    setLoading(true);
                    // 1. Check if farm exists
                    const farmData = await farmApi.getFarmDetails();

                    if (farmData && farmData.FarmId) {
                        // Farm exists -> Hide Welcome, Load Ponds
                        setFarmSetup({
                            totalArea: farmData.TotalAreaAcres,
                            regionId: farmData.RegionId,
                            province: farmData.RegionName,
                            farmId: farmData.FarmId
                        });
                        setShowWelcome(false);

                        // 2. Fetch Ponds
                        const pondData = await farmApi.getPonds();
                        const normalized = (pondData || []).map(normalizePondData);
                        setPonds(normalized);

                        // 3. Fetch Water Alerts
                        fetchWaterAlerts();

                        // 4. Fetch Expense Summary
                        fetchExpenseSummary();

                        // 5. Fetch Activity Feed
                        fetchActivity();

                        // 6. Fetch Disease Outbreaks
                        fetchDiseaseOutbreaks();

                        // 7. Fetch FCR Data for all ponds
                        fetchFCRData(normalized);

                        // 8. Fetch Feed Schedule
                        fetchFeedSchedule();

                        // 9. Fetch Fertilizer Schedule
                        fetchFertilizerSchedule();

                        // 10. Fetch Water Summary
                        fetchWaterSummary();
                    }
                } catch (err) {
                    console.error("Farm check failed:", err);
                    // If error is 404 (Farm not found), Show Welcome
                    if (err.message.includes("Farm not found") || err.message.includes("404")) {
                        setShowWelcome(true);
                    }
                } finally {
                    setLoading(false);
                }
            };

            loadFarmData();
        } else {
            setLoading(false);
        }
        setIsMounted(true);
    }, []);

    // ---------- 2. User-Specific Persistence Effect ----------
    useEffect(() => {
        if (isMounted && user?.email) {
            const storageKey = `farmData_${user.email}`;
            const dataToSave = {
                ponds,
                setup: farmSetup,
                activityLogs
            };
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        }
    }, [ponds, farmSetup, activityLogs, user?.email, isMounted]);

    // ---------- Helpers ----------
    const fetchActivity = async () => {
        try {
            const activities = await farmApi.getActivityFeed();
            // Map backend structure to frontend structure if needed
            const normalized = (activities || []).map(a => ({
                id: Math.random().toString(36).substr(2, 9),
                message: a.Description,
                category: a.Category, // Feeding, Stocking, Mortality, etc.
                pondName: a.Category, // Using Category as sub-header for display
                time: a.ActivityTime,
                relativeTime: a.RelativeTime
            }));
            setActivityLogs(normalized);
        } catch (err) {
            console.error("Failed to fetch activity feed:", err);
        }
    };

    const addActivity = async (text, pondName) => {
        // Optimistic update
        const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            message: text,
            pondName,
            time: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            relativeTime: "Just now"
        };
        setActivityLogs((prev) => [newLog, ...prev]);

        // Refresh from server to get persistence and correct sorting
        await fetchActivity();
    };

    const timeAgo = (isoTime) => {
        const now = new Date();
        const past = new Date(isoTime);
        const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
        if (diff < 60) return `${diff} sec ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
    };

    const isReadyForTransfer = (fish) => {
        return Number(fish.currentSize) >= 6;
    };

    const isHarvestReady = (fish, pond) => {
        if (pond && String(pond.stage || pond.pondType || "").toLowerCase().includes("nursery")) {
            return Number(fish.currentSize) >= 6;
        }
        return Number(fish.currentSize) >= Number(fish.targetSize);
    };

    const handleDeletePond = async (pondId, pondName) => {
        if (!confirm(`Delete pond "${pondName}"? This action cannot be undone.`)) return;

        try {
            await farmApi.deletePond(pondId);
            setPonds((prev) => prev.filter((p) => p.id !== pondId && p.PondId !== pondId));
            addActivity(`Pond deleted`, pondName);
            fetchAreaUsage(); // Refresh area usage
            fetchExpenseSummary(); // Refresh expenses since pond-specific expenses were deleted from DB
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Failed to delete pond. Please try again.");
        }
    };

    const fetchAreaUsage = async () => {
        try {
            const result = await farmApi.getAreaUsage();
            if (result.success) {
                setAreaUsage(result.data);
            }
        } catch (err) {
            console.error("Failed to fetch area usage:", err);
        }
    };

    const fetchPonds = async () => {
        try {
            const data = await farmApi.getPonds();
            // Normalize backend data to frontend structure
            const normalized = (data || []).map(normalizePondData);
            setPonds(normalized);
            // Refresh FCR data whenever ponds are fetched
            fetchFCRData(normalized);
            // Refresh area usage whenever ponds are fetched
            fetchAreaUsage();
            // Refresh feed schedule whenever ponds are fetched
            fetchFeedSchedule();
        } catch (err) {
            console.error("Failed to fetch ponds:", err);
        }
    };

    const fetchWaterAlerts = async () => {
        try {
            const alerts = await farmApi.getWaterAlerts();
            setWaterAlerts(alerts || []);
        } catch (err) {
            console.error("Failed to fetch water alerts:", err);
        }
    };

    const fetchDiseaseOutbreaks = async () => {
        try {
            const data = await farmApi.getOutbreaks();
            setDiseaseOutbreaks(data || []);
        } catch (err) {
            // Silently fail — disease tables may not be set up yet
            setDiseaseOutbreaks([]);
        }
    };

    const getPondDiseaseOutbreaks = (pondId) => {
        return diseaseOutbreaks.filter(o => o.PondId === pondId && o.Status !== 'Resolved');
    };

    // Get active disease outbreaks for a specific batch in a pond
    const getBatchDiseaseOutbreaks = (pondId, batchId) => {
        return diseaseOutbreaks.filter(o =>
            o.PondId === pondId &&
            o.Status !== 'Resolved' &&
            (o.AffectedBatchId == batchId || (!o.AffectedBatchId && !o.AffectedSpeciesName))
        );
    };

    const fetchExpenseSummary = async () => {
        try {
            const summary = await farmApi.getExpenseSummary();
            setExpenseSummary(summary || { overall: { GrandTotal: 0 }, breakdown: [] });
        } catch (err) {
            console.error("Failed to fetch expense summary:", err);
        }
    };

    const fetchFarmerRequests = async () => {
        setRequestsLoading(true);
        try {
            const result = await farmApi.getFarmerRequests();
            if (result.success) {
                setFarmerRequests(result.data);
            }
        } catch (err) {
            console.error("Fetch farmer requests error:", err);
        } finally {
            setRequestsLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmerRequests();
    }, []);

    const handleReplySubmit = async (requestId) => {
        if (!replyMessage) return;
        try {
            const payload = {
                replyMessage,
                latitude: replyLocation?.lat,
                longitude: replyLocation?.lng
            };
            const result = await farmApi.replyToPurchaseRequest(requestId, payload);
            if (result.success) {
                setReplyingTo(null);
                setReplyMessage("");
                setReplyLocation(null);
                fetchFarmerRequests();
            }
        } catch (err) {
            console.error("Reply error:", err);
            alert("Failed to send reply.");
        }
    };

    const handleDenyRequest = async (requestId) => {
        setProcessingAction(requestId);
        try {
            const result = await farmApi.denyPurchaseRequest(requestId);
            if (result.success) {
                fetchFarmerRequests();
            }
        } catch (err) {
            console.error("Deny error:", err);
        } finally {
            setProcessingAction(null);
        }
    };

    const handleDeleteFarmerRequest = async (requestId) => {
        setProcessingAction(requestId);
        try {
            const result = await farmApi.deletePurchaseRequest(requestId);
            if (result.success) {
                fetchFarmerRequests();
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setProcessingAction(null);
        }
    };

    const handleApproveRequest = async (requestId, speciesName, qty) => {
        // Show inline approval UI instead of confirm/prompt
        setApprovingRequest({ requestId, speciesName, qty });
        setApprovePrice("");
    };

    const handleConfirmApprove = async () => {
        if (!approvingRequest) return;
        const { requestId } = approvingRequest;
        let finalPrice = null;
        if (approvePrice.trim() !== "") {
            finalPrice = Number(approvePrice);
            if (isNaN(finalPrice) || finalPrice < 0) {
                return; // invalid input, do nothing
            }
        }
        setProcessingAction(requestId);
        try {
            const result = await farmApi.approvePurchaseRequest(requestId, { finalPrice });
            if (result.success) {
                setApprovingRequest(null);
                setApprovePrice("");
                fetchFarmerRequests();
                fetchPonds();
                fetchExpenseSummary();
                fetchActivity();
            }
        } catch (err) {
            console.error("Approve error:", err);
        } finally {
            setProcessingAction(null);
        }
    };

    // FCR: Fetch Feed Conversion Ratio for all ponds
    const fetchFCRData = async (pondList) => {
        try {
            const pondsToFetch = pondList || ponds;
            if (!pondsToFetch || pondsToFetch.length === 0) return;

            console.log(`Fetching FCR for ${pondsToFetch.length} ponds...`);
            const results = {};

            await Promise.all(
                pondsToFetch.map(async (p) => {
                    const pid = p.PondId || p.id;
                    if (!pid) return;
                    try {
                        const data = await farmApi.getPondFCR(pid);
                        if (data) {
                            results[pid] = data;
                        }
                    } catch (err) {
                        console.error(`FCR fetch failed for pond ${pid}:`, err);
                    }
                })
            );

            console.log("FCR results fetched:", Object.keys(results).length, "entries");
            setFcrData(results);
        } catch (err) {
            console.error("Failed to fetch FCR data:", err);
        }
    };

    const handleUpdatePond = async (pondId, data) => {
        try {
            const result = await farmApi.updatePond(pondId, data);
            if (result.success) {
                await fetchPonds();
                setShowEditPond(false);
                setEditingPond(null);
                addActivity(`Pond updated`, data.PondName);
            }
        } catch (err) {
            console.error("Update Error:", err);
            alert(err.message || "Failed to update pond. Please try again.");
        }
    };

    const handleFarmSetup = async (data) => {
        setFarmSetup(data);
        // After setup, fetch the actual ponds from DB (including the auto-created nursery)
        await fetchPonds();
        addActivity("Farm setup completed", "System");
        setShowWelcome(false);
        setFarmSkipped(false);
    };

    const handleSkip = () => {
        setFarmSkipped(true);
        setShowWelcome(false);
    };

    const handleStartSetup = () => {
        setFarmSkipped(false);
        setShowWelcome(true);
    };

    const getPondAlert = (pond) => {
        return waterAlerts.find(alert => alert.pond === (pond.pondName || pond.name));
    };

    const getSpeciesAlert = (pond, speciesName) => {
        return waterAlerts.find(alert =>
            alert.pond === (pond.pondName || pond.name) &&
            alert.species === speciesName
        );
    };

    const checkWaterQuality = (pond) => {
        return getPondAlert(pond) ? "Warning" : "Normal";
    };

    const handleDeleteBatch = async (pondId, batchId, speciesName) => {
        if (!confirm(`Are you sure you want to remove this batch of ${speciesName}?`)) return;

        try {
            await farmApi.deleteStocking(batchId);
            await fetchPonds(); // Refresh to get accurate counts and updated species list
            addActivity(`Removed ${speciesName} batch`, "System");
        } catch (err) {
            console.error("Failed to delete batch:", err);
            alert(err.message || "Could not delete the batch. Please try again.");
        }
    };

    const handleUpdateSale = async (saleData) => {
        try {
            await farmApi.toggleForSale(saleData.batchId, saleData.isForSale, saleData.quantityForSale);
            await fetchPonds();
            addActivity(`Updated sale quantity for ${saleData.speciesName} to ${saleData.quantityForSale}`, "System");
            setSaleModal(null);
        } catch (err) {
            console.error("Failed to toggle sale status:", err);
            alert("Could not update sale status. Please try again.");
        }
    };

    const handleStockFish = async (fish) => {
        try {
            const stockingData = {
                pondId: Number(fish.pondId),
                speciesId: Number(fish.speciesId),
                quantity: Number(fish.quantity),
                pricePerPiece: Number(fish.pricePerPiece || 0),
                currentSize: Number(fish.currentSize || 2.0),
                targetSize: Number(fish.targetSize || 12.0),
                stockingDate: new Date().toISOString()
            };

            const result = await farmApi.stockFish(stockingData);

            if (result.success) {
                // Refresh all ponds from DB to get normalized data and accurate counts
                await fetchPonds();
                await fetchExpenseSummary(); // Fetch new expenses from stock purchase
                setShowAddFish(false);
                addActivity(`Stocked ${fish.quantity} ${fish.species} in ${activePond?.name || 'Pond'}`, "System");
            }
        } catch (err) {
            alert(err.message || "Failed to stock fish. Please try again.");
        }
    };

    const handleAddPond = async (pondData) => {
        const newSize = Number(pondData.size || 0);
        if (newSize > availableArea) {
            alert(`Validation Error: ${newSize} acres exceeds your remaining ${availableArea.toFixed(2)} acres.`);
            return;
        }

        try {
            // Map the frontend data back into the Provisioning Engine schema
            const payload = {
                pondPlan: pondData.pondPlan.map(p => ({
                    speciesId: p.speciesId,
                    quantity: p.quantity
                })),
                pondSpecs: {
                    pondName: pondData.pondName,           // Pass explicit pond name
                    pondType: pondData.pondType,           // Pass explicit structure type (Earthen/Concrete)
                    targetArea: newSize,
                    recommendedLengthFeet: pondData.LengthFeet || 0,
                    recommendedWidthFeet: pondData.WidthFeet || 0,
                    recommendedDepthFeet: pondData.DepthFeet || 0,
                    estimatedVolumeLiters: pondData.VolumeLiters || 0,
                    stage: pondData.stage || "Grow-out",   // Pass explicit stage
                    cultivationType: pondData.cultivationType || "Extensive",
                    cultureType: pondData.cultureType || "Polyculture"
                }
            };

            const result = await farmApi.provisionPond(payload);

            if (result.success) {
                // Refresh list to get the full DB record with ID
                await fetchPonds();
                await fetchExpenseSummary(); // Fetch new expenses from pond provisioning/stocking
                setShowAddPond(false);
                addActivity(`Pond "${pondData.pondName}" engineered and stocked successfully`, "System");
            }
        } catch (err) {
            console.error("Provisioning Error:", err);
            alert(`Failed to engineer and stock pond: ${err.message}`);
        }
    };

    const ActionButton = ({
        children,
        onClick,
        color = "gray",
    }) => {
        const styles = {
            purple: "bg-purple-100 border border-purple-200 text-purple-700 hover:bg-purple-50",
            pink: "bg-pink-100 border border-pink-200 text-pink-700 hover:bg-gray-50",
            gray: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
            blue: "bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100",
            yellow: "bg-yellow-50 border border-yellow-100 text-yellow-700 hover:bg-yellow-100",
            orange: "bg-orange-50 border border-orange-100 text-orange-700 hover:bg-orange-100",
            green: "bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100",
            red: "bg-red-50 border border-red-100 text-red-700 hover:bg-red-100",
            dark: "bg-gray-800 text-white border border-gray-900 hover:bg-gray-900",
        };
        return (
            <button
                onClick={onClick}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors shadow-sm ${styles[color]}`}
            >
                {children}
            </button>
        );
    };

    const usedArea = areaUsage?.usedArea || ponds.reduce((sum, p) => sum + (p.size || 0), 0);
    const totalArea = areaUsage?.totalArea || farmSetup?.totalArea || 0;
    const availableArea = areaUsage?.remainingArea || Math.max(0, totalArea - usedArea);
    const totalFingerlings = ponds.reduce((sum, p) => sum + (p.species || []).reduce((acc, fish) => acc + (fish.quantity || 0), 0), 0);
    const totalExpenses = expenseSummary.overall?.GrandTotal || 0;
    const activePond = ponds.find((p) => p.id === activePondId) || null;

    // Aggregate Stats for Dashboard Summary Row
    const totalRevenue = ponds.reduce((sum, p) => sum + (p.EstimatedRevenue || 0), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const activeOutbreaksCount = diseaseOutbreaks.filter(o => o.Status !== 'Resolved').length;
    const harvestReadyCount = ponds.reduce((sum, p) => sum + ((p.species || []).filter(f => isHarvestReady(f, p)).length), 0);

    // Feed Schedule Helpers — DB-driven per-species feeding frequency
    const fetchFeedSchedule = async () => {
        try {
            const result = await farmApi.getFeedSchedule();
            setFeedSchedule(result?.schedule || []);
        } catch (err) {
            console.error("Failed to fetch feed schedule:", err);
        }
    };

    const fetchFertilizerSchedule = async () => {
        try {
            const result = await farmApi.getFertilizerSchedule();
            setFertilizerSchedule(result?.schedule || []);
        } catch (err) {
            console.error("Failed to fetch fertilizer schedule:", err);
        }
    };

    const fetchWaterSummary = async () => {
        try {
            const result = await farmApi.getWaterSummary();
            setWaterSummary(result || []);
        } catch (err) {
            console.error("Failed to fetch water summary:", err);
        }
    };

    const getSpeciesFeedingFrequency = (speciesName) => {
        // Look up from DB-backed schedule data first
        const entry = feedSchedule.find(s => s.speciesName === speciesName);
        if (entry && entry.frequency !== 'Not defined') return entry.frequency;
        return "Check Feed Rules";
    };

    const getPondFeedSchedule = (pondId) => {
        return feedSchedule.filter(s => s.pondId === pondId);
    };

    const formatTimeUntil = (minutes) => {
        if (minutes === null || minutes === undefined) return "No data";
        const absMin = Math.abs(minutes);
        if (absMin < 60) return `${absMin}m`;
        const hrs = Math.floor(absMin / 60);
        const mins = absMin % 60;
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    };

    const getPondAge = (pond) => {
        if (!pond.species || pond.species.length === 0) return null;
        const dates = pond.species.map(s => new Date(s.stockingDate)).filter(d => !isNaN(d));
        if (dates.length === 0) return null;
        const oldestDate = new Date(Math.min(...dates));
        const days = Math.floor((new Date() - oldestDate) / (1000 * 60 * 60 * 24));
        if (days === 0) return "Stocked Today";
        return `Day ${days}`;
    };

    // --- DELETE FARM (Full Reset) ---
    const handleDeleteFarm = async () => {
        const confirm1 = window.confirm("⚠️ WARNING: This will permanently delete your ENTIRE farm — all ponds, fish, expenses, harvests, and activity logs. This cannot be undone!\n\nAre you sure?");
        if (!confirm1) return;
        const confirm2 = window.prompt('Type "DELETE" to confirm farm deletion:');
        if (confirm2 !== "DELETE") {
            alert("Deletion cancelled. You must type DELETE exactly.");
            return;
        }
        try {
            const result = await farmApi.resetFarm();
            if (result.success) {
                localStorage.removeItem("ffg_tour_completed");
                alert("Farm deleted successfully. You will now be redirected to set up a new farm.");
                window.location.reload();
            } else {
                alert(result.message || "Failed to delete farm.");
            }
        } catch (err) {
            console.error("Delete farm error:", err);
            alert("Failed to delete farm: " + (err.message || "Unknown error"));
        }
    };

    // Render Loading State
    if (!isMounted || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Waves className="animate-bounce text-blue-600" size={48} />
                    <p className="text-gray-500 font-medium">Loading Farm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <WelcomeModal
                isOpen={showWelcome}
                onClose={() => {
                    setShowWelcome(false);
                    setFarmSkipped(true);
                }}
                onSkip={handleSkip}
                onComplete={handleFarmSetup}
            />

            {!farmSetup && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6">
                        <Waves size={48} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Fish Farm</h2>
                    <p className="text-gray-500 max-w-md mb-8">Complete the initial setup to start tracking your farm operations.</p>
                    <button
                        onClick={handleStartSetup}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Start Farm Setup
                    </button>
                </div>
            )}

            {farmSetup && (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard – Pond Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Create and manage your fish farming ponds</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowTasksModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
                            >
                                <TrendingUp size={18} />
                                View Tasks
                            </button>
                            <button
                                onClick={() => setShowFarmAlertsModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
                            >
                                <AlertTriangle size={18} />
                                Farm Alerts
                            </button>
                            <button
                                onClick={() => { fetchFarmerRequests(); setShowRequestsModal(true); }}
                                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${farmerRequests.filter(r => r.Status === 'Pending').length > 0
                                    ? 'bg-red-600 text-white animate-pulse shadow-red-500/50 hover:bg-red-700'
                                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                            >
                                <ShoppingCart size={18} />
                                Purchase Requests {farmerRequests.filter(r => r.Status === 'Pending').length > 0 && `(${farmerRequests.filter(r => r.Status === 'Pending').length})`}
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('restart-tour'))}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
                                title="Replay the guided tour"
                            >
                                <Sparkles size={16} />
                                Tour
                            </button>
                            <button
                                onClick={handleDeleteFarm}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
                                title="Delete entire farm and start over"
                            >
                                <Trash2 size={16} />
                                Reset Farm
                            </button>
                            <button
                                data-tour="add-pond-btn"
                                onClick={() => setShowAddPond(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
                            >
                                <Plus size={18} />
                                Add New Pond
                            </button>
                        </div>
                    </div>

                    <div data-tour="stats-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        <StatCard title="Total Ponds" value={ponds.length} icon={<Waves size={24} />} variant="orange" />
                        <StatCard title="Total Fish Stock" value={totalFingerlings} icon={<Fish size={24} />} variant="pink" />
                        <StatCard title="Total Expenses" value={totalExpenses > 0 ? `${totalExpenses}` : "0"} icon={<DollarSign size={24} />} variant="purple" />
                        <StatCard
                            title="Water Quality"
                            value={ponds.some((p) => checkWaterQuality(p) === "Warning") ? "⚠ Warning" : "Normal"}
                            icon={<Droplets size={24} />}
                            variant="blue"
                        />
                    </div>

                    {/* ===== DASHBOARD SUMMARY ROW ===== */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {/* <div className="p-3 sm:p-5 rounded-2xl border shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100/60 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <div className="p-2 rounded-xl mb-2 sm:mb-3 inline-flex bg-emerald-100 text-emerald-600">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="w-full min-w-0">
                                <p className="text-[10px] sm:text-[13px] font-black uppercase tracking-wider opacity-70 truncate mb-0.5">Est. Revenue</p>
                                <h3 className="text-[18px] sm:text-[24px] font-black leading-tight text-emerald-800 truncate">Rs {Math.round(totalRevenue).toLocaleString()}</h3>
                            </div>
                        </div> */}
                        {/* <div className={`p-3 sm:p-5 rounded-2xl border shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left ${totalProfit >= 0 ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-100/60' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100/60'}`}>
                            <div className={`p-2 rounded-xl mb-2 sm:mb-3 inline-flex ${totalProfit >= 0 ? 'bg-yellow-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="w-full min-w-0">
                                <p className="text-[10px] sm:text-[13px] font-black uppercase tracking-wider opacity-70 truncate mb-0.5">Est. Profit</p>
                                <h3 className={`text-[18px] sm:text-[24px] font-black leading-tight truncate ${totalProfit >= 0 ? 'text-yellow-500' : 'text-red-700'}`}>Rs {Math.round(totalProfit).toLocaleString()}</h3>
                            </div>
                        </div> */}
                        {/* <div className={`p-3 sm:p-5 rounded-2xl border shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left ${activeOutbreaksCount > 0 ? 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200' : 'bg-gray-50/80 border-gray-100/50'}`}>
                            <div className={`p-2 rounded-xl mb-2 sm:mb-3 inline-flex ${activeOutbreaksCount > 0 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
                                <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="w-full min-w-0">
                                <p className="text-[10px] sm:text-[13px] font-black uppercase tracking-wider opacity-70 truncate mb-0.5">Active Outbreaks</p>
                                <h3 className={`text-[18px] sm:text-[24px] font-black leading-tight truncate ${activeOutbreaksCount > 0 ? 'text-rose-700' : 'text-gray-900'}`}>{activeOutbreaksCount}</h3>
                            </div>
                        </div> */}
                        {/* <div className={`p-3 sm:p-5 rounded-2xl border shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left ${harvestReadyCount > 0 ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100/60' : 'bg-gray-50/80 border-gray-100/50'}`}>
                            <div className={`p-2 rounded-xl mb-2 sm:mb-3 inline-flex ${harvestReadyCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                                <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="w-full min-w-0">
                                <p className="text-[10px] sm:text-[13px] font-black uppercase tracking-wider opacity-70 truncate mb-0.5">Harvest Ready</p>
                                <h3 className={`text-[18px] sm:text-[24px] font-black leading-tight truncate ${harvestReadyCount > 0 ? 'text-amber-800' : 'text-gray-900'}`}>{harvestReadyCount} batch{harvestReadyCount !== 1 ? 'es' : ''}</h3>
                            </div>
                        </div> */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6">
                        <div data-tour="my-ponds" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <h2 className="text-lg font-semibold text-gray-800">My Ponds ({ponds.length})</h2>

                                {/* PANEL DEFENSE TASK 1: Pond Search Bar */}
                                <div className="relative w-full sm:w-64">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search ponds by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col items-start sm:items-end gap-1">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-sm select-none">
                                            <button
                                                role="switch"
                                                aria-checked={hideEmptyPonds}
                                                onClick={() => setHideEmptyPonds(prev => !prev)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${hideEmptyPonds ? 'bg-blue-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${hideEmptyPonds ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                                            </button>
                                            Hide Empty
                                        </label>
                                        <div className="relative">
                                            <select 
                                                value={pondSortOrder}
                                                onChange={(e) => setPondSortOrder(e.target.value)}
                                                className="appearance-none text-xs px-3 py-2 pr-8 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 font-medium transition-colors shadow-sm outline-none cursor-pointer"
                                            >
                                                <option value="created">Sort: Newest First</option>
                                                <option value="alpha">Sort: A-Z</option>
                                                <option value="alerts_desc">Sort: Most Alerts</option>
                                                <option value="size_desc">Sort: Largest Area</option>
                                                <option value="size_asc">Sort: Smallest Area</option>
                                                <option value="fish_desc">Sort: Most Fish</option>
                                                <option value="fish_asc">Sort: Least Fish</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowAddPond(true)} className="text-xs px-3 py-2 rounded-lg bg-gray-600 text-white hover:bg-blue-700 flex items-center gap-1.5 font-medium transition-colors shadow-sm">
                                            <Plus size={14} /> Add
                                        </button>
                                        <button onClick={() => setShowUpdateFarmArea(true)} className="text-xs px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 font-medium transition-colors">
                                            <Pencil size={14} /> Edit
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        <span className="font-medium text-gray-700">
                                            {Number(usedArea || 0).toFixed(2)}
                                        </span> / {Number(totalArea || 0).toFixed(2)} acres used
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {ponds.filter(p => (!hideEmptyPonds || (p.species && p.species.length > 0 && p.species.reduce((acc, s) => acc + (s.quantity || 0), 0) > 0)) && (!searchTerm || (p.pondName && p.pondName.toLowerCase().includes(searchTerm.toLowerCase())))).sort((a, b) => {
                                    if (pondSortOrder === "alpha") return (a.pondName || "").localeCompare(b.pondName || "");
                                    if (pondSortOrder === "size_desc") return (b.size || 0) - (a.size || 0);
                                    if (pondSortOrder === "size_asc") return (a.size || 0) - (b.size || 0);
                                    if (pondSortOrder === "alerts_desc") {
                                        const countAlerts = (p) => {
                                            let count = 0;
                                            if (p.needsMaintenance) count++;
                                            if (p.species?.some(f => isHarvestReady(f, p))) count++;
                                            if (checkWaterQuality(p) === "Warning") count++;
                                            return count;
                                        };
                                        return countAlerts(b) - countAlerts(a);
                                    }
                                    if (pondSortOrder === "fish_desc") {
                                        const qtyA = a.species?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
                                        const qtyB = b.species?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
                                        return qtyB - qtyA;
                                    }
                                    if (pondSortOrder === "fish_asc") {
                                        const qtyA = a.species?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
                                        const qtyB = b.species?.reduce((acc, s) => acc + (s.quantity || 0), 0) || 0;
                                        return qtyA - qtyB;
                                    }
                                    return 0; // Default created sort (assuming array is already in created order from API)
                                }).map((p, idx) => {
                                    // REVENUE & PROFIT FROM API NATIVELY
                                    const estimatedRevenue = p.EstimatedRevenue || 0;
                                    const pondExpenses = p.PondExpenses || p.pondExpenses || 0;
                                    const estimatedProfit = p.EstimatedProfit || 0;

                                    // CAPACITY CHECK: Red border if pond is > 90% full
                                    const currentStock = (p.species || []).reduce((acc, s) => acc + (s.quantity || 0), 0);
                                    const maxCapacity = (p.MaxFishPerAcre || 0) * (p.size || 0);
                                    const isOverCapacity = maxCapacity > 0 && currentStock > maxCapacity * 0.9;

                                    return (
                                        <div
                                            key={`${p.id}-${idx}`}
                                            className={`rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-5 shadow-sm hover:shadow-md transition-shadow ${isOverCapacity ? "border-2 border-red-400 bg-red-50/30" : "border border-gray-200 bg-white"}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 sm:gap-0">
                                                <div className="flex items-start gap-3 w-full sm:w-auto">
                                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                                        <Waves size={20} />
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="font-bold text-gray-900 text-base">
                                                                {p.pondName}
                                                            </h3>


                                                            {p.isAutoCreated && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-600 border border-red-200 shadow-sm">
                                                                    Auto Created
                                                                </span>
                                                            )}

                                                            {getPondAlert(p) && (
                                                                <div className="flex items-center justify-center p-1.5  text-red-600  shadow-sm animate-pulse" title="Water Quality Warning">
                                                                    <AlertTriangle size={14} />
                                                                </div>
                                                            )}

                                                            {getPondDiseaseOutbreaks(p.id).length > 0 && (
                                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 border border-rose-200 animate-pulse" title={`${getPondDiseaseOutbreaks(p.id).length} active disease outbreak(s)`}>
                                                                    <HeartPulse size={11} className="text-rose-600" />
                                                                    <span className="text-[9px] font-black text-rose-700 uppercase">{getPondDiseaseOutbreaks(p.id).length} Disease</span>
                                                                </div>
                                                            )}

                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold shadow-sm ${String(p.stage || "").toLowerCase().includes("nursery")
                                                                ? "bg-green-100 text-green-600 border border-green-200"
                                                                : "bg-blue-100 text-blue-600 border border-blue-200"
                                                                }`}>
                                                                {p.stage || p.pondType || "Grow-out"}
                                                            </span>

                                                            {/* PANEL DEFENSE TASK: Pond Age Badge */}
                                                            {getPondAge(p) && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold shadow-sm bg-purple-100 text-purple-600 border border-purple-200">
                                                                    {getPondAge(p)}
                                                                </span>
                                                            )}

                                                            {/* PANEL DEFENSE TASK 2: Harvest Ready Badge */}
                                                            {p.species?.some(f => isHarvestReady(f, p)) && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold shadow-sm bg-emerald-100 text-emerald-600 border border-emerald-200 animate-pulse">
                                                                    Harvest Ready
                                                                </span>
                                                            )}

                                                            {p.needsMaintenance && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold shadow-sm bg-red-100 text-red-600 border border-red-200 animate-pulse">
                                                                    Needs Maintenance
                                                                </span>
                                                            )}


                                                            {!p.isAutoCreated && (
                                                                <div className="flex items-center gap-1.5 ml-1">
                                                                    <button
                                                                        onClick={() => setShowGrowthPond(p)}
                                                                        className="p-1 rounded-md text-emerald-500 hover:bg-emerald-50 transition"
                                                                        title="View Growth Highlights"
                                                                    >
                                                                        <TrendingUp size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setEditingPond(p); setShowEditPond(true); }}
                                                                        className="p-1 rounded-md text-blue-400 hover:bg-blue-50 transition"
                                                                        title="Edit pond"
                                                                    >
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePond(p.id, p.pondName || p.name)}
                                                                        className="p-1 rounded-md text-red-400 hover:bg-red-50 transition"
                                                                        title="Delete pond"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {p.size.toFixed(2)} acres • {p.species?.reduce((acc, s) => acc + (s.quantity || 0), 0).toLocaleString() || 0} {String(p.stage || "").toLowerCase().includes("nursery") ? "fingerlings" : "fish"}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            Species: {p.species?.map(s => s.species).filter((v, i, a) => a.indexOf(v) === i).join(", ") || "None"}
                                                        </p>

                                                        {(p.length || p.width || p.depth) && (
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-400 font-medium">
                                                                <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                                    <span className="text-gray-600">{p.length}ft</span>
                                                                    <span className="text-gray-300">×</span>
                                                                    <span className="text-gray-600">{p.width}ft</span>
                                                                    <span className="text-gray-300">×</span>
                                                                    <span className="text-gray-600">{p.depth}ft</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                                                    <span className="text-[9px] text-gray-300 uppercase">Vol:</span>
                                                                    <span className="text-blue-600/70" title={`${Number(p.volume || 0).toLocaleString()} Liters`}>
                                                                        {(isNaN(p.volumeGallons) ? 0 : Number(p.volumeGallons || 0)).toLocaleString()} Gal
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}


                                                        {/* PROFIT ESTIMATION WIDGET (Only show if there are fish) */}
                                                        {/* {p.species?.reduce((acc, s) => acc + (s.quantity || 0), 0) > 0 && (
                                                            <div className="mt-3 py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/60 rounded-xl flex items-center justify-between shadow-sm">
                                                                <div className="flex items-center gap-2 text-emerald-800">
                                                                    <div className="p-1 bg-white/60 rounded-md">
                                                                        <DollarSign size={14} className="text-emerald-700" />
                                                                    </div>
                                                                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-900/80">Est. Profit</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-sm tracking-tight font-black ${estimatedProfit >= 0 ? "text-emerald-800" : "text-red-600"}`}>
                                                                        :{Math.round(estimatedProfit).toLocaleString()}
                                                                    </div>
                                                                    <div className="text-[9px] font-bold text-emerald-600/70 mt-0.5 tracking-wide">
                                                                        ${Math.round(estimatedRevenue).toLocaleString()} - EXP: ${Math.round(pondExpenses).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )} */}

                                                        {/* FCR WIDGET (Feed Conversion Ratio) */}
                                                        {(() => {
                                                            const pid = p.PondId || p.id;
                                                            const fcr = fcrData[pid];
                                                            if (!fcr || fcr.fcr === null || fcr.fcr === undefined) return null;

                                                            const ratingColors = {
                                                                "Excellent": "text-emerald-700 bg-emerald-50 border-emerald-200",
                                                                "Good": "text-blue-700 bg-blue-50 border-blue-200",
                                                                "Average": "text-amber-700 bg-amber-50 border-amber-200",
                                                                "Poor": "text-red-700 bg-red-50 border-red-200"
                                                            };
                                                            const colorClass = ratingColors[fcr.rating] || ratingColors["Average"];
                                                            // return (
                                                            //     <div className="mt-2 py-2 px-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100/60 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                                                            //         <div className="flex items-center gap-2">
                                                            //             <div className="p-1 bg-white/60 rounded-md">
                                                            //                 <TrendingUp size={14} className="text-blue-600" />
                                                            //             </div>
                                                            //             <div>
                                                            //                 <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-900/80">Efficiency (FCR)</span>
                                                            //                 <p className="text-[8px] text-blue-500/70 font-medium -mt-0.5">Feed Conversion Ratio</p>
                                                            //             </div>
                                                            //         </div>
                                                            //         <div className="flex items-center gap-2">
                                                            //             <span className="text-sm font-black text-blue-800">{fcr.fcr}</span>
                                                            //             <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${colorClass}`}>{fcr.rating}</span>
                                                            //         </div>
                                                            //     </div>
                                                            // );
                                                        })()}

                                                        {/* NEXT FEED SCHEDULE WIDGET — Per-Species from DB */}
                                                        {/* {(() => {
                                                            const pid = p.PondId || p.id;
                                                            const pondSchedule = getPondFeedSchedule(pid);
                                                            if (!pondSchedule || pondSchedule.length === 0) return null;

                                                            // Find the most urgent entry for this pond
                                                            const mostUrgent = pondSchedule[0]; // Already sorted by urgency from backend
                                                            const statusConfig = {
                                                                overdue: { bg: 'from-red-50/80 to-rose-50/80', border: 'border-red-200/70', icon: 'text-red-600', label: 'text-red-900/80', badge: 'bg-red-100 text-red-700 border-red-300', badgeText: 'OVERDUE' },
                                                                due_soon: { bg: 'from-amber-50/80 to-yellow-50/80', border: 'border-amber-200/70', icon: 'text-amber-600', label: 'text-amber-900/80', badge: 'bg-amber-100 text-amber-700 border-amber-300', badgeText: 'DUE SOON' },
                                                                on_track: { bg: 'from-emerald-50/60 to-green-50/60', border: 'border-emerald-200/60', icon: 'text-emerald-600', label: 'text-emerald-900/80', badge: 'bg-emerald-100 text-emerald-700 border-emerald-300', badgeText: 'ON TRACK' },
                                                                no_data: { bg: 'from-gray-50/60 to-slate-50/60', border: 'border-gray-200/60', icon: 'text-gray-500', label: 'text-gray-700/80', badge: 'bg-gray-100 text-gray-600 border-gray-300', badgeText: 'NOT FED YET' }
                                                            };
                                                            const cfg = statusConfig[mostUrgent.status] || statusConfig.no_data;

                                                            return (
                                                                <div className={`mt-2 py-2 px-3 bg-gradient-to-r ${cfg.bg} border ${cfg.border} rounded-xl shadow-sm`}>
                                                                    <div className="flex items-center justify-between mb-1.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1 bg-white/60 rounded-md">
                                                                                <Clock size={14} className={cfg.icon} />
                                                                            </div>
                                                                            <span className={`text-[11px] font-extrabold uppercase tracking-widest ${cfg.label}`}>Next Feed</span>
                                                                        </div>
                                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${cfg.badge} ${mostUrgent.status === 'overdue' ? 'animate-pulse' : ''}`}>
                                                                            {cfg.badgeText}
                                                                        </span>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {pondSchedule.slice(0, 3).map((entry, idx) => {
                                                                            const entryCfg = statusConfig[entry.status] || statusConfig.no_data;
                                                                            return (
                                                                                <div key={`sched-${entry.stockId}-${idx}`} className="flex items-center justify-between">
                                                                                    <span className="text-[10px] font-semibold text-gray-700 truncate max-w-[50%]">
                                                                                        {entry.speciesName}
                                                                                    </span>
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <span className="text-[9px] text-gray-500 font-medium">{entry.frequency}</span>
                                                                                        <span className={`text-[9px] font-bold px-1 py-0.5 rounded border ${entryCfg.badge}`}>
                                                                                            {entry.status === 'overdue' ? `${formatTimeUntil(entry.minutesUntilDue)} ago` :
                                                                                                entry.status === 'no_data' ? 'Never fed' :
                                                                                                    `in ${formatTimeUntil(entry.minutesUntilDue)}`}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }     )()} */}
                                                    </div>
                                                </div>

                                                {/* CAPACITY GAUGE — top right of card */}
                                                {(() => {
                                                    const fillPercent = maxCapacity > 0 ? Math.min(Math.round((currentStock / maxCapacity) * 100), 100) : null;
                                                    const strokeColor = fillPercent === null ? '#d1d5db' : fillPercent > 90 ? '#ef4444' : fillPercent > 70 ? '#f59e0b' : '#3b82f6';
                                                    const textColor = fillPercent === null ? 'text-gray-400' : fillPercent > 90 ? 'text-red-600' : fillPercent > 70 ? 'text-amber-600' : 'text-blue-600';
                                                    const circumference = 2 * Math.PI * 28;
                                                    const dashOffset = circumference - ((fillPercent ?? 0) / 100) * circumference;
                                                    return (
                                                        <div className="flex flex-col items-center shrink-0" title={fillPercent !== null ? `${currentStock.toLocaleString()} / ${maxCapacity.toLocaleString()} fish capacity` : 'No capacity data'}>
                                                            <div className="relative w-14 h-14">
                                                                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                                                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                                                                    <circle
                                                                        cx="32" cy="32" r="28" fill="none"
                                                                        stroke={strokeColor}
                                                                        strokeWidth="5"
                                                                        strokeLinecap="round"
                                                                        strokeDasharray={circumference}
                                                                        strokeDashoffset={dashOffset}
                                                                        className="transition-all duration-700 ease-out"
                                                                    />
                                                                </svg>
                                                                <span className={`absolute inset-0 flex items-center justify-center text-xs font-black tabular-nums ${textColor}`}>
                                                                    {fillPercent !== null ? `${fillPercent}%` : '—'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[9px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">Filled</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <ActionButton color="indigo" onClick={() => setTransferWholeModal(p)}>
                                                    <ArrowRightLeft size={14} /> Transfer All
                                                </ActionButton>
                                                {p.needsMaintenance ? (
                                                    <ActionButton color="red" onClick={async () => {
                                                        try {
                                                            await farmApi.markPondMaintained(p.id);

                                                            // fallback to fetch explicitly since loadFarmData is scoped inside useEffect
                                                            const pondData = await farmApi.getPonds();
                                                            const normalized = (pondData || []).map(normalizePondData);
                                                            setPonds(normalized);

                                                            addActivity("Performed pond maintenance and cleared status", p.pondName);
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert("Failed to mark maintanence complete.");
                                                        }
                                                    }}>
                                                        <Wrench size={14} /> Mark Maintained
                                                    </ActionButton>
                                                ) : (
                                                    <ActionButton color="gray" onClick={() => { setActivePondId(p.id); setShowAddFish(true); }}>
                                                        <Fish size={14} /> Add Fish
                                                    </ActionButton>
                                                )}
                                                <ActionButton color="blue" onClick={() => setShowWaterCycleModal(p)}>
                                                    <Droplets size={14} /> Water Cycle
                                                </ActionButton>
                                                
                                                <ActionButton color="orange" onClick={() => setShowExpenseModal(p)}>
                                                    <DollarSign size={14} /> Expense
                                                </ActionButton>
                                                <ActionButton color="yellow" onClick={() => setShowManageFeedModal(p)}>
                                                    <Utensils size={14} /> Manage Feed
                                                </ActionButton>
                                                {(() => {
                                                    const fertSchedule = fertilizerSchedule.find(s => s.pondId === p.id);
                                                    const fertAlert = fertSchedule && (fertSchedule.status === 'overdue' || fertSchedule.status === 'due_soon');
                                                    
                                                    let badgeText = "";
                                                    let badgeClass = "";
                                                    
                                                    if (fertSchedule) {
                                                        if (fertSchedule.daysUntilDue < 0) {
                                                            badgeText = "Overdue";
                                                            badgeClass = "bg-red-500 text-white animate-pulse";
                                                        } else if (fertSchedule.daysUntilDue === 0) {
                                                            badgeText = "Today";
                                                            badgeClass = "bg-amber-400 text-amber-900";
                                                        } else {
                                                            badgeText = `In ${fertSchedule.daysUntilDue} day${fertSchedule.daysUntilDue > 1 ? 's' : ''}`;
                                                            badgeClass = "bg-blue-100 text-blue-700";
                                                        }
                                                    }

                                                    return (
                                                        <ActionButton color={fertAlert ? "red" : "pink"} onClick={() => setShowFertilizerModal(p)}>
                                                            <div className="flex items-center gap-1">
                                                                <FlaskConical size={14} className={fertAlert ? "animate-pulse" : ""} /> 
                                                                Fertilizers
                                                                {fertSchedule && (
                                                                    <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeClass}`}>
                                                                        {badgeText}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </ActionButton>
                                                    );
                                                })()}
                                                <ActionButton color="purple" onClick={() => setShowMortalityModal(p)}>
                                                    <Skull size={14} /> Mortality
                                                </ActionButton>
                                                <ActionButton color="red" onClick={() => setShowDiseaseModal(p)}>
                                                    <HeartPulse size={14} /> Log Disease
                                                </ActionButton>
                                                <ActionButton color="green" onClick={async () => {
                                                    setShowFinancialsModal(p);
                                                    setFinancialsLoading(true);
                                                    try {
                                                        const res = await farmApi.getPondFinancials(p.id);
                                                        if (res.success) setFinancialsData(res.data);
                                                    } catch (err) {
                                                        console.error("Financials Error:", err);
                                                    } finally {
                                                        setFinancialsLoading(false);
                                                    }
                                                }}>
                                                    <BarChart3 size={14} /> Details
                                                </ActionButton>
                                                <ActionButton color="indigo" onClick={() => setShowFutureEstimation(p)}>
                                                    <TrendingUp size={14} /> Estimation
                                                </ActionButton>

                                                {p.species?.some(f => isHarvestReady(f, p)) && (
                                                    <ActionButton color="red" onClick={() => setShowHarvestModal({ pondId: p.id, pondName: p.pondName || p.name, species: p.species })}>
                                                        <Scissors size={14} /> Harvest
                                                    </ActionButton>
                                                )}
                                               

                                                {String(p.stage || "").toLowerCase().includes("nursery") && p.species?.some(isReadyForTransfer) && (
                                                    <ActionButton color="green" onClick={() => {
                                                        const readyFish = p.species.find(isReadyForTransfer);
                                                        if (readyFish) setTransferModal({ pondId: p.id, fish: readyFish });
                                                    }}>
                                                        <ArrowRightLeft size={14} /> Fish Transfer
                                                    </ActionButton>
                                                )}
                                            </div>


                                            {p.species?.length > 0 && (
                                                <div className="border-t border-gray-100 pt-4 space-y-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Summary:</p>
                                                    {p.species.map((f, i) => {
                                                        const batchId = f.id ? String(f.id) : `batch-${i}`;
                                                        const uniqueKey = `${p.id}-${batchId}-${i}`;
                                                        const batchDiseases = getBatchDiseaseOutbreaks(p.id, f.id);
                                                        return (
                                                            <div key={uniqueKey} className={`text-sm p-3 rounded-lg border group transition-colors ${batchDiseases.length > 0 ? 'bg-red-50/40 border-red-200 hover:border-red-300' : 'bg-gray-50/50 border-gray-100 hover:border-blue-200'}`}>
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="font-semibold text-gray-800">{f.species} × {f.quantity}</p>
                                                                            {isReadyForTransfer(f) && String(p.stage || "").toLowerCase().includes("nursery") && (
                                                                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-tighter">
                                                                                    Ready for Transfer
                                                                                </span>
                                                                            )}
                                                                            {isHarvestReady(f, p) && (
                                                                                <span className="text-[9px] font-black bg-pink-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-tighter">
                                                                                    Ready for Harvest
                                                                                </span>
                                                                            )}
                                                                            {batchDiseases.map((d) => (
                                                                                <span key={d.OutbreakId} className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${d.Severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' :
                                                                                    d.Severity === 'Severe' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                                        d.Severity === 'Moderate' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                                                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                                                    }`}>
                                                                                    🩺 {d.DiseaseName} ({d.Status})
                                                                                </span>
                                                                            ))}
                                                                            {(() => {
                                                                                const speciesAlert = getSpeciesAlert(p, f.species);
                                                                                if (!speciesAlert) return null;
                                                                                return (
                                                                                    <button
                                                                                        onClick={() => setSpeciesAlertModal(speciesAlert)}
                                                                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors active:scale-95 cursor-pointer shadow-sm animate-pulse"
                                                                                        title={`⚠ Water quality alert for ${f.species}`}
                                                                                    >
                                                                                        <AlertTriangle size={10} />
                                                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Alert</span>
                                                                                    </button>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                        <div className="flex items-center gap-3 mt-1.5">
                                                                            <p className="text-xs text-gray-500">Current: <span className="text-gray-900 font-bold">{f.currentSize}"</span> | Target: {f.targetSize}"</p>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const lastFeed = activityLogs.find(log =>
                                                                                        log.category === "Feeding" &&
                                                                                        log.message &&
                                                                                        log.message.toLowerCase().includes((p.pondName || p.name || "").toLowerCase())
                                                                                    );
                                                                                    const speciesScheduleEntry = feedSchedule.find(s => s.pondId === (p.PondId || p.id) && s.speciesName === f.species);
                                                                                    setFeedInfoModal({
                                                                                        speciesName: f.species,
                                                                                        pondName: p.pondName || p.name,
                                                                                        feedLog: lastFeed || null,
                                                                                        feedingFrequency: f.FeedingFrequency || getSpeciesFeedingFrequency(f.species),
                                                                                        totalFeedKg: fcrData[p.PondId || p.id]?.totalFeedKg || 0,
                                                                                        scheduleEntry: speciesScheduleEntry || null
                                                                                    });
                                                                                }}
                                                                                className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 font-bold tracking-tighter transition-colors active:scale-95 cursor-pointer shadow-sm"
                                                                                title="Click to see last feeding time"
                                                                            >
                                                                                <Utensils size={9} />
                                                                                {f.FeedingFrequency || getSpeciesFeedingFrequency(f.species)}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => setShowDiseaseModal({ id: p.id, pondName: p.pondName, species: p.species })}
                                                                            className="text-xs text-rose-600 font-bold hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-100 transition-all"
                                                                            title="Log Disease"
                                                                        >
                                                                            <HeartPulse size={15} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setUpdateSizeModal({ pondId: p.id, batchId: batchId, speciesName: f.species, currentSize: f.currentSize, lastUpdateDate: f.lastUpdateDate })}
                                                                            className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all"
                                                                        >
                                                                            Update age
                                                                        </button>
                                                                        <button onClick={() => handleDeleteBatch(p.id, batchId, f.species)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all">
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {/* Recommended Treatment for active diseases */}
                                                                {batchDiseases.length > 0 && (
                                                                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                                        <p className="text-[9px] font-black text-emerald-900 uppercase tracking-wider mb-1">💊 Active Diseases & Treatments</p>
                                                                        {batchDiseases.map(d => (
                                                                            <div key={d.OutbreakId} className="mt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-emerald-100/50 pb-2 last:border-0 last:pb-0">
                                                                                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                                                                                    <span className="font-bold">{d.DiseaseName}:</span> {d.RecommendedTreatment || "No specific treatment recommended."}
                                                                                </p>
                                                                                <button
                                                                                    onClick={() => setTreatmentModal({ ...d, PondName: p.pondName })}
                                                                                    className="shrink-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
                                                                                >
                                                                                    Log Treatment
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );

                                })}
                            </div>
                        </div>

                        <div data-tour="activity-feed" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">Live Activity Feed</h3>

                                {/* PANEL DEFENSE TASK 3: Activity Feed Filter */}
                                <select
                                    value={feedFilter}
                                    onChange={(e) => setFeedFilter(e.target.value)}
                                    className="text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-colors"
                                >
                                    <option value="All">All Activities</option>
                                    <option value="Stocking">Stocking</option>
                                    <option value="Feeding">Feeding</option>
                                    <option value="Fertilizer">Fertilizers</option>
                                    <option value="Water Quality">Water Quality</option>
                                    <option value="Disease Alert">Disease Alerts</option>
                                    <option value="Treatment">Treatments</option>
                                    <option value="Mortality">Mortality</option>
                                    <option value="Harvest">Harvests</option>
                                    <option value="Expense">Expenses</option>
                                    <option value="Stock Purchase">Stock Purchases</option>
                                    <option value="Transfer">Transfers</option>
                                    <option value="Marketplace">Marketplace</option>
                                    <option value="Growth Update">Growth Updates</option>
                                    <option value="System">System & Setup</option>
                                </select>
                            </div>

                            {/* ======== DEFAULT VIEW (NO SCROLL, LIMIT 15) ======== */}

                            <div className="flex-1">
                                {activityLogs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                        <div className="mb-3 p-4 bg-gray-50 rounded-full"><Waves size={32} /></div>
                                        <p className="text-sm">No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* PANEL DEFENSE TASK 3: Map updated with filter */}
                                        {activityLogs.filter(log => feedFilter === "All" || log.pondName === feedFilter).slice(0, 15).map((log, i) => (
                                            <div key={log.id || i} className="flex gap-3 items-start pb-3 border-b border-gray-50 last:border-0">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{log.message}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.time)} • {log.pondName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>


                            {/* ======== PANEL REQUEST VIEW (SCROLL ALL ACTIVITIES) ======== */}
                            {/* Instructions: To show all activities with a scrollbar, COMMENT out the "DEFAULT VIEW" block above, and UNCOMMENT the block below. */}
                            {/* 
                              <div className="flex-1 overflow-y-auto max-h-[1000px] pr-2 css-scroll">
                                {activityLogs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                        <div className="mb-3 p-4 bg-gray-50 rounded-full"><Waves size={32} /></div>
                                        <p className="text-sm">No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {[...activityLogs].filter(log => feedFilter === "All" || log.pondName === feedFilter).reverse().map((log, i) => (
                                            <div key={log.id || i} className="flex gap-3 items-start pb-3 border-b border-gray-50 last:border-0">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{log.message}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.time)} • {log.pondName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>   */}
                        </div>

                        <div className="lg:col-span-2 bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 shrink-0 shadow-sm">
                                    <AlertTriangle size={22} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-bold text-blue-900 text-base">Farm Structure Workflow</h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-3 text-[13px] leading-relaxed text-blue-800/80">
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span>
                                            <p><strong className="text-blue-900">Nursery Pond:</strong> Start fingerlings here (1-4 inches, 2-3 months)</p>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span>
                                            <p><strong className="text-blue-900">Track Growth:</strong> Update fish size regularly using "Update Size" button</p>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span>
                                            <p><strong className="text-blue-900">Transfer Ready Fish:</strong> When fish reach 4+ inches, move to grow-out ponds</p>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span>
                                            <p><strong className="text-blue-900">Grow-out Ponds:</strong> Continue raising fish until harvest size (10-12 inches)</p>
                                        </li>
                                        <li className="flex items-start gap-2.5 md:col-span-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span>
                                            <p><strong className="text-blue-900">All Activities:</strong> Feeding, water cycle, fertilization, and expenses track per pond</p>
                                        </li>
                                    </ul>
                                </div>
                                {showEditPond && (
                                    <EditPondModal
                                        isOpen={showEditPond}
                                        onClose={() => { setShowEditPond(false); setEditingPond(null); }}
                                        pond={editingPond}
                                        availableArea={availableArea}
                                        onUpdate={handleUpdatePond}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )
            }

            {/* ------------------- MODALS ------------------- */}
            {
                showTasksModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] relative">
                            <button
                                onClick={() => setShowTasksModal(false)}
                                className="absolute top-4 right-4 p-2 bg-white/50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition z-10 shadow-sm"
                            >
                                ✕
                            </button>
                            <div className="flex-1 overflow-hidden">
                                <SmartTodoList />
                            </div>
                        </div>
                    </div>
                )
            }
            {
                activePond && (
                    <AddFishModal
                        isOpen={showAddFish}
                        pondId={activePond.id}
                        pondName={activePond.name}
                        pondSize={activePond.size || 1}
                        currentPondQuantity={activePond.fishCount || 0}
                        existingSpecies={activePond.species.map((f) => f.species)}
                        cultureType={activePond.cultureType}
                        userProvince={farmSetup?.province || "Punjab"}
                        onClose={() => setShowAddFish(false)}
                        onAdd={handleStockFish}
                    />
                )}

            {showAddPond && (
                <AddPondModal
                    isOpen={showAddPond}
                    onClose={() => setShowAddPond(false)}
                    onAdd={handleAddPond}
                    availableArea={farmSetup ? Number(farmSetup.totalArea) - ponds.reduce((acc, p) => acc + Number(p.Size || p.size || 0), 0) : 0}
                    totalArea={farmSetup?.totalArea || 0}
                    usedArea={ponds.reduce((acc, p) => acc + Number(p.Size || p.size || 0), 0)}
                    farmRegionName={farmSetup?.province || "Punjab"}
                />
            )}

            {showFutureEstimation && (
                <FutureEstimationModal 
                    isOpen={!!showFutureEstimation} 
                    onClose={() => setShowFutureEstimation(null)} 
                    pond={showFutureEstimation} 
                />
            )}
            {showWaterCycleModal && (
                <WaterCycleModal
                    pond={showWaterCycleModal}
                    onClose={() => setShowWaterCycleModal(null)}
                    onRecord={async (data) => {
                        try {
                            const payload = {
                                PondId: showWaterCycleModal.id,
                                ...data
                            };
                            const result = await farmApi.recordWaterQuality(payload);
                            if (result.success) {
                                await fetchWaterAlerts(); // Refresh alerts immediately
                                addActivity(`Water cycle recorded for ${showWaterCycleModal.name}`, "System");
                                setShowWaterCycleModal(null);
                            }
                        } catch (err) {
                            console.error("Water Cycle Error:", err);
                            alert(err.message || "Failed to record water quality. Please try again.");
                        }
                    }}
                />
            )}
            {showUpdateFarmArea && farmSetup && (
                <UpdateFarmAreaModal
                    isOpen={showUpdateFarmArea}
                    totalArea={farmSetup.totalArea}
                    usedArea={usedArea}
                    onClose={() => setShowUpdateFarmArea(false)}
                    onUpdate={async (newArea, lat, lng) => {
                        try {
                            const result = await farmApi.updateFarmArea(newArea, lat, lng);
                            if (result.success) {
                                setFarmSetup({ ...farmSetup, totalArea: newArea });
                                fetchAreaUsage(); // Refresh area usage from DB
                                addActivity(`Farm area updated to ${newArea} acres`, "System");
                                setShowUpdateFarmArea(false);
                            }
                        } catch (err) {
                            console.error("Update Farm Area Error:", err);
                            throw err; // Let the modal handle error display
                        }
                    }}
                />
            )}
            {showExpenseModal && (
                <AddExpenseModal
                    isOpen={true}
                    pondId={showExpenseModal.id}
                    pondName={showExpenseModal.pondName || showExpenseModal.name}
                    onClose={() => setShowExpenseModal(null)}
                    onAdd={async (expenseData) => {
                        try {
                            const result = await farmApi.addExpense(expenseData);
                            if (result.success) {
                                await fetchExpenseSummary(); // Refresh global summary
                                await fetchPonds(); // Refresh individual pond stats (recalculates Est. Profit)
                                addActivity(`Expense: $${expenseData.amount} for ${expenseData.category}`, showExpenseModal.pondName || showExpenseModal.name);
                                setShowExpenseModal(null);
                            }
                        } catch (err) {
                            console.error("Add Expense Error:", err);
                            alert(err.message || "Failed to add expense. Please try again.");
                        }
                    }}
                />
            )}
            {showManageFeedModal && (
                <ManageFeedModal
                    isOpen={true}
                    pondId={showManageFeedModal.id}
                    pondName={showManageFeedModal.pondName}
                    onClose={() => setShowManageFeedModal(null)}
                    onAdd={async (feedData) => {
                        try {
                            const result = await farmApi.logFeed(feedData);
                            if (result.message) {
                                addActivity(`Feed: ${feedData.quantity}kg of ${feedData.feedType}`, showManageFeedModal.name);
                                await fetchFCRData(); // Refresh FCR after feed logged
                                await fetchFeedSchedule(); // Refresh next feed schedule
                                setShowManageFeedModal(null);
                            }
                        } catch (err) {
                            throw err;
                        }
                    }}
                />
            )}
            {showFertilizerModal && (
                <FertilizerModal
                    pondId={showFertilizerModal.id}
                    pondName={showFertilizerModal.pondName || showFertilizerModal.name}
                    intensity={showFertilizerModal.cultivationType}
                    onClose={() => setShowFertilizerModal(null)}
                    onRecord={async (fertData) => {
                        try {
                            const result = await farmApi.logFertilizer(fertData);
                            if (result.message) {
                                addActivity(`Fertilizer: ${fertData.qty}kg of ${fertData.product}`, showFertilizerModal.pondName || showFertilizerModal.name);
                                await fetchFertilizerSchedule(); // Refresh next fertilization schedule
                                setShowFertilizerModal(null);
                            }
                        } catch (err) {
                            throw err;
                        }
                    }}
                />
            )}

            {updateSizeModal && (
                <UpdateSizeModal
                    isOpen={!!updateSizeModal}
                    speciesName={updateSizeModal.speciesName}
                    currentSize={updateSizeModal.currentSize}
                    lastUpdateDate={updateSizeModal.lastUpdateDate}
                    onClose={() => setUpdateSizeModal(null)}
                    onUpdate={async (updateData) => {
                        try {
                            const { size, date } = updateData;
                            await farmApi.updateStocking(updateSizeModal.batchId, { currentSize: size, recordDate: date });
                            await fetchPonds();
                            addActivity(`Updated ${updateSizeModal.speciesName} size to ${size}"`, "System");
                            setUpdateSizeModal(null);
                        } catch (err) {
                            console.error("Update Size Error:", err);
                            alert(err.message || "Failed to update size. Please try again.");
                        }
                    }}
                />
            )}

            {transferModal && (
                <TransferFishModal
                    isOpen={true}
                    sourcePondName={ponds.find(p => p.id === transferModal.pondId)?.pondName || "Nursery"}
                    availableSpecies={ponds.find(p => p.id === transferModal.pondId)?.species || []}
                    growOutPonds={ponds.filter(p =>
                        (String(p.stage || "").toLowerCase().includes("grow") ||
                            String(p.pondType || "").toLowerCase().includes("grow")) &&
                        p.id !== transferModal.pondId
                    )}
                    onClose={() => setTransferModal(null)}
                    onTransfer={async (targetPondId, transfers) => {
                        try {
                            const sourcePond = ponds.find(p => p.id === transferModal.pondId);
                            if (!sourcePond) return;

                            // Call transfer API for each selected batch
                            await Promise.all(
                                transfers.map(transfer =>
                                    farmApi.transferStocking(transfer.batchId, targetPondId, transfer.quantity)
                                )
                            );

                            await fetchPonds();
                            addActivity(`Moved ${transfers.length} batch(es) to Grow-out`, sourcePond.pondName || sourcePond.name);
                            setTransferModal(null);
                        } catch (err) {
                            console.error("Transfer Error:", err);
                            alert(err.message || "Failed to transfer fish. Please try again.");
                        }
                    }}
                />
            )}
            {showMortalityModal && (
                <MortalityModal
                    isOpen={true}
                    pondName={showMortalityModal.pondName || showMortalityModal.name}
                    speciesList={showMortalityModal.species.map((s) => ({
                        id: s.id,
                        SpeciesId: s.SpeciesId,
                        name: s.species,
                        quantity: s.quantity
                    }))}
                    onClose={() => setShowMortalityModal(null)}
                    onRecord={async (mortData) => {
                        try {
                            const result = await farmApi.addMortality({
                                pondId: showMortalityModal.id,
                                ...mortData
                            });
                            if (result.success) {
                                await fetchPonds(); // Refresh to update stock counts
                                addActivity(`Mortality: ${mortData.quantity} ${mortData.speciesName} in ${showMortalityModal.pondName || showMortalityModal.name}`, "System");
                                setShowMortalityModal(null);
                            }
                        } catch (err) {
                            console.error("Mortality Error:", err);
                            alert(err.message || "Failed to log mortality. Please try again.");
                        }
                    }}
                />
            )}
            {showHarvestModal && (
                <HarvestModal
                    isOpen={true}
                    pondName={showHarvestModal.pondName}
                    speciesList={showHarvestModal.species.map((s) => ({
                        id: s.SpeciesId || s.id,
                        name: s.species,
                        quantity: s.quantity
                    }))}
                    onClose={() => setShowHarvestModal(null)}
                    onRecord={async (harvestData) => {
                        try {
                            // Find the species object to get the ID
                            const speciesObj = showHarvestModal.species.find(s => s.species === harvestData.species);
                            if (!speciesObj) throw new Error("Species not found");

                            const payload = {
                                pondId: showHarvestModal.pondId,
                                speciesId: speciesObj.SpeciesId || speciesObj.speciesId || speciesObj.id,
                                quantity: harvestData.quantity,
                                weight: harvestData.totalWeight,
                                revenue: harvestData.revenue,
                                note: `Harvested on ${harvestData.date}. Quantity: ${harvestData.quantity}`
                            };

                            const result = await farmApi.recordHarvest(payload);
                            if (result.success) {
                                await fetchPonds(); // Refresh to update stock counts
                                addActivity(`Harvested ${harvestData.quantity} ${harvestData.species}`, showHarvestModal.pondName);
                                // Calculate total stock from the state BEFORE harvest is subtracted
                                const totalPondStock = showHarvestModal.species.reduce((sum, s) => sum + (s.quantity || 0), 0);
                                setShowHarvestModal(null);
                                // Open ROI Modal
                                setShowROIModal({
                                    pondId: showHarvestModal.pondId,
                                    pondName: showHarvestModal.pondName,
                                    speciesName: harvestData.species,
                                    quantity: harvestData.quantity,
                                    totalWeight: harvestData.totalWeight,
                                    harvestLogId: result.harvestLogId,
                                    totalPondStock: totalPondStock,
                                    batchStock: speciesObj.quantity
                                });
                            }
                        } catch (err) {
                            console.error("Harvest Error:", err);
                            alert(err.message || "Failed to record harvest. Please try again.");
                        }
                    }}
                />
            )}

            <PostHarvestROIModal
                isOpen={!!showROIModal}
                harvestData={showROIModal}
                onClose={() => setShowROIModal(null)}
            />

            <SaleModal
                isOpen={!!saleModal}
                batch={saleModal}
                onClose={() => setSaleModal(null)}
                onUpdate={handleUpdateSale}
            />

            {transferWholeModal && (
                <TransferWholePondModal
                    pond={transferWholeModal}
                    allPonds={ponds}
                    onClose={() => setTransferWholeModal(null)}
                    onSuccess={(destinationPond) => {
                        setTransferWholeModal(null);
                        addActivity(`Bulk transferred all fish from ${transferWholeModal.pondName} to ${destinationPond.pondName}`, "System");
                        fetchPonds();
                    }}
                />
            )}

            <GrowthDetailsModal
                isOpen={!!showGrowthPond}
                pond={showGrowthPond}
                onClose={() => setShowGrowthPond(null)}
            />



            {showDiseaseModal && (
                <DiseaseModal
                    isOpen={true}
                    pondId={showDiseaseModal.id}
                    pondName={showDiseaseModal.pondName}
                    speciesList={showDiseaseModal.species || []}
                    onClose={() => setShowDiseaseModal(null)}
                    onSuccess={() => {
                        fetchDiseaseOutbreaks();
                        addActivity(`Disease outbreak logged`, showDiseaseModal.pondName);
                    }}
                />
            )}

            <TreatmentModal
                isOpen={!!treatmentModal}
                outbreak={treatmentModal}
                onClose={() => setTreatmentModal(null)}
                onSuccess={() => {
                    fetchDiseaseOutbreaks();
                    addActivity(`Treatment applied for ${treatmentModal.DiseaseName}`, treatmentModal.PondName);
                    // Fetch expense summary since treatment logs may have costs
                    fetchExpenseSummary();
                }}
            />

            <SpeciesAlertModal
                isOpen={!!speciesAlertModal}
                alertData={speciesAlertModal}
                onClose={() => setSpeciesAlertModal(null)}
            />

            <FeedInfoModal
                isOpen={!!feedInfoModal}
                data={feedInfoModal}
                onClose={() => setFeedInfoModal(null)}
            />

            {showFarmAlertsModal && (
                <FarmAlertsHub 
                    ponds={ponds}
                    waterAlerts={waterAlerts}
                    waterSummary={waterSummary}
                    diseaseOutbreaks={diseaseOutbreaks}
                    feedSchedule={feedSchedule}
                    fertilizerSchedule={fertilizerSchedule}
                    onClose={() => setShowFarmAlertsModal(false)}
                />
            )}

            {/* === POND FINANCIALS DETAILS MODAL === */}
            {showFinancialsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowFinancialsModal(null); setFinancialsData(null); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-bold">📊 Pond Financial Details</h2>
                                <p className="text-emerald-100 text-sm mt-0.5">{showFinancialsModal.pondName || showFinancialsModal.name}</p>
                            </div>
                            <button onClick={() => { setShowFinancialsModal(null); setFinancialsData(null); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {financialsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                                <span className="ml-3 text-gray-500">Loading financial data...</span>
                            </div>
                        ) : financialsData ? (() => {
                            const isNursery = String(financialsData.pond.Stage || financialsData.pond.PondType || '').toLowerCase().includes('nursery');
                            return (
                                <div className="p-6 space-y-6">
                                    {/* Pond Info Bar */}
                                    <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
                                        <div><span className="text-gray-400">Type:</span> <span className="font-semibold">{financialsData.pond.PondType || '—'}</span></div>
                                        <div><span className="text-gray-400">Culture:</span> <span className="font-semibold">{financialsData.pond.CultivationType || '—'}</span></div>
                                        <div><span className="text-gray-400">Size:</span> <span className="font-semibold">{financialsData.pond.Size} acres</span></div>
                                        <div><span className="text-gray-400">Dimensions:</span> <span className="font-semibold">{financialsData.pond.LengthFeet}ft × {financialsData.pond.WidthFeet}ft × {financialsData.pond.DepthFeet}ft</span></div>
                                        <div><span className="text-gray-400">Volume:</span> <span className="font-semibold">{Number(financialsData.pond.VolumeGallons || 0).toLocaleString()} Gal</span></div>
                                    </div>

                                    {/* Nursery Info Banner */}
                                    {isNursery && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                            <span className="text-2xl">🐟</span>
                                            <div>
                                                <p className="font-bold text-amber-800 text-sm">Nursery Pond — Investment Phase</p>
                                                <p className="text-xs text-amber-600 mt-1">This pond primarily raises fingerlings for transfer, but stock can also be harvested directly. Revenue is generated upon harvest. The financials below reflect the operational cost.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary Cards — Context-Aware */}
                                    {isNursery ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 text-center">
                                                <p className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Total Investment</p>
                                                <p className="text-2xl font-black text-orange-700 mt-1">₨{Number(financialsData.totalExpenses).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                                                <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Current Fish Stock</p>
                                                <p className="text-2xl font-black text-blue-700 mt-1">{financialsData.currentStock.reduce((sum, s) => sum + s.quantity, 0).toLocaleString()}</p>
                                                <p className="text-xs text-blue-500 mt-0.5">{financialsData.currentStock.length} species</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
                                                <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Total Revenue</p>
                                                <p className="text-2xl font-black text-green-700 mt-1">₨{Number(financialsData.totalRevenue).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 text-center">
                                                <p className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Total Expenses</p>
                                                <p className="text-2xl font-black text-red-700 mt-1">₨{Number(financialsData.totalExpenses).toLocaleString()}</p>
                                            </div>
                                            <div className={`bg-gradient-to-br ${financialsData.netProfit >= 0 ? 'from-emerald-50 to-green-50 border-emerald-200' : 'from-red-50 to-pink-50 border-red-200'} border rounded-xl p-4 text-center`}>
                                                <p className={`text-[10px] uppercase font-bold tracking-wider ${financialsData.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Net Profit</p>
                                                <p className={`text-2xl font-black mt-1 ${financialsData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {financialsData.netProfit >= 0 ? '₨' : '-₨'}{Math.abs(financialsData.netProfit).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Per-Species Revenue — Grow-out Only */}
                                    {!isNursery && (
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                                                Revenue by Species
                                            </h3>
                                            {financialsData.speciesRevenue.length > 0 ? (
                                                <div className="space-y-2">
                                                    {financialsData.speciesRevenue.map((sp, i) => {
                                                        const pct = financialsData.totalRevenue > 0 ? (sp.revenue / financialsData.totalRevenue * 100).toFixed(1) : 0;
                                                        return (
                                                            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-gray-800">{sp.speciesName}</span>
                                                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{pct}%</span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-1 space-x-3">
                                                                        <span>Harvested: {sp.harvested.toLocaleString()} fish</span>
                                                                        <span>Weight: {sp.weightKg.toLocaleString()} kg</span>
                                                                    </div>
                                                                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                                                                    </div>
                                                                </div>
                                                                <div className="ml-4 text-right">
                                                                    <p className="text-lg font-black text-green-700">₨{sp.revenue.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-sm bg-gray-50 rounded-xl p-4 text-center">No harvest revenue recorded yet</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Expense Category Breakdown */}
                                    {financialsData.expenseBreakdown.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                                                {isNursery ? 'Investment Breakdown' : 'Expenses by Category'}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {financialsData.expenseBreakdown.map((ex, i) => (
                                                    <div key={i} className={`${isNursery ? 'bg-orange-50/50 border-orange-100' : 'bg-red-50/50 border-red-100'} border rounded-lg p-3 flex justify-between items-center`}>
                                                        <span className="text-sm font-medium text-gray-700">{ex.category}</span>
                                                        <span className={`font-bold ${isNursery ? 'text-orange-700' : 'text-red-700'}`}>₨{ex.amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Stock Asset Value */}
                                    {financialsData.currentStock.length > 0 && (
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                                                {isNursery ? 'Fingerling Stock Value' : 'Estimated Asset Value (Current Stock)'}
                                            </h3>
                                            <div className="space-y-2">
                                                {financialsData.currentStock.map((st, i) => (
                                                    <div key={i} className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex justify-between items-center">
                                                        <div>
                                                            <span className="font-semibold text-gray-800">{st.speciesName}</span>
                                                            <span className="text-xs text-gray-400 ml-2">× {st.quantity.toLocaleString()}</span>
                                                        </div>
                                                        <span className="font-bold text-blue-700">₨{st.estMinValue.toLocaleString()} — ₨{st.estMaxValue.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={`mt-3 bg-gradient-to-r ${isNursery ? 'from-amber-600 to-orange-600' : 'from-blue-600 to-indigo-600'} rounded-xl p-4 text-white text-center`}>
                                                <p className="text-xs uppercase font-bold tracking-wider opacity-80">{isNursery ? 'Total Fingerling Value' : 'Total Estimated Asset Value'}</p>
                                                <p className="text-xl font-black mt-1">
                                                    ₨{financialsData.estimatedAssetValue.min.toLocaleString()} — ₨{financialsData.estimatedAssetValue.max.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Nursery ROI Note */}
                                    {isNursery && (
                                        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                            <p className="text-xs text-gray-500">📌 <strong>ROI Tracking:</strong> Transfer fingerlings to grow-out ponds to begin the revenue cycle. Profit is calculated when harvested fish are sold from grow-out ponds.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })() : (
                            <div className="p-10 text-center text-gray-400">No financial data available</div>
                        )}
                    </div>
                </div>
            )}

            {/* FARMER REQUESTS MODAL */}
            {showRequestsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-gray-50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <ShoppingCart size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Incoming Purchase Requests</h2>
                            </div>
                            <button onClick={() => setShowRequestsModal(false)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {requestsLoading ? (
                                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
                            ) : farmerRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No purchase requests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {farmerRequests.map(req => (
                                        <div key={req.RequestId} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{req.SpeciesName}</h3>
                                                    <p className="text-sm text-gray-500">From: {req.ConsumerName} ({req.ConsumerEmail})</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wide ${req.Status === 'Pending' ? 'bg-amber-100 text-amber-700' : req.Status === 'Denied' ? 'bg-red-100 text-red-700' : req.Status === 'Approved' ? 'bg-green-100 text-green-800 ring-1 ring-green-300' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {req.Status === 'Approved' ? '✓ Approved' : req.Status}
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(req.CreatedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between mb-3 border border-gray-100">
                                                <span className="text-gray-600">Requested Quantity:</span>
                                                <span className="font-bold text-gray-900">{req.RequestedQuantity}</span>
                                            </div>

                                            {/* Inline Approve Confirmation UI */}
                                            {approvingRequest?.requestId === req.RequestId && (
                                                <div className="mt-2 mb-3 bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in duration-200">
                                                    <p className="text-sm font-bold text-green-800 mb-2">
                                                        Confirm Sale: {approvingRequest.qty} × {approvingRequest.speciesName}
                                                    </p>
                                                    <label className="block text-xs text-green-700 mb-1 font-medium">
                                                        Final Sale Price (PKR) — leave blank for auto-pricing
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={approvePrice}
                                                        onChange={(e) => setApprovePrice(e.target.value)}
                                                        placeholder="e.g. 25000"
                                                        className="w-full text-sm border border-green-300 rounded-lg p-2.5 bg-white focus:ring-green-500 focus:border-green-500 mb-3"
                                                    />
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => { setApprovingRequest(null); setApprovePrice(""); }}
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleConfirmApprove}
                                                            disabled={processingAction === req.RequestId}
                                                            className="px-4 py-1.5 text-sm font-bold bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5"
                                                        >
                                                            {processingAction === req.RequestId ? (
                                                                <><Loader2 size={14} className="animate-spin" /> Processing...</>
                                                            ) : (
                                                                <><CheckCircle size={14} /> Confirm Sale</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {(req.Status === 'Pending' || req.Status === 'Replied') && replyingTo !== req.RequestId && approvingRequest?.requestId !== req.RequestId && (
                                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => handleApproveRequest(req.RequestId, req.SpeciesName, req.RequestedQuantity)}
                                                        disabled={processingAction === req.RequestId}
                                                        className="text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                                    >
                                                        <CheckCircle size={14} /> Approve & Sell
                                                    </button>
                                                    {req.Status === 'Pending' && (
                                                        <button
                                                            onClick={() => setReplyingTo(req.RequestId)}
                                                            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <Send size={14} /> Reply to Customer
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDenyRequest(req.RequestId)}
                                                        disabled={processingAction === req.RequestId}
                                                        className="text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                                    >
                                                        {processingAction === req.RequestId ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Deny
                                                    </button>
                                                </div>
                                            )}

                                            {replyingTo === req.RequestId && (
                                                <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                                                    <p className="text-sm font-semibold text-blue-900 mb-2">Send Reply</p>
                                                    <textarea
                                                        className="w-full text-sm border-gray-300 rounded-lg p-3 bg-white focus:ring-blue-500 focus:border-blue-500 mb-3 resize-none"
                                                        rows="3"
                                                        placeholder="Add location details, contact number, or pickup instructions..."
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                    />

                                                    <div className="mb-4">
                                                        <p className="text-xs font-semibold text-blue-800 mb-2">Optional: Add Pickup Location Pin</p>
                                                        <div className="h-48 rounded-lg overflow-hidden border border-blue-200">
                                                            <LocationPickerMap onLocationSelect={(loc) => setReplyLocation(loc)} />
                                                        </div>
                                                        {replyLocation && <p className="text-xs text-blue-600 mt-1">✓ Location pin selected</p>}
                                                    </div>

                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => { setReplyingTo(null); setReplyMessage(""); setReplyLocation(null); }}
                                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleReplySubmit(req.RequestId)}
                                                            disabled={!replyMessage}
                                                            className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Send size={14} /> Send
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {req.Status === 'Replied' && req.FarmerReply && (
                                                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Your Reply</p>
                                                    <p className="text-gray-800 text-sm mb-2">{req.FarmerReply}</p>
                                                    {req.ReplyLatitude && req.ReplyLongitude && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${req.ReplyLatitude},${req.ReplyLongitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition-colors"
                                                        >
                                                            <MapPin size={14} /> View Pinned Location
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex justify-end mt-2 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleDeleteFarmerRequest(req.RequestId)}
                                                    disabled={processingAction === req.RequestId}
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                                >
                                                    {processingAction === req.RequestId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete Request
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

            {/* ── Guided Tour (first-time users) ── */}
            {farmSetup && <DashboardTour userEmail={user?.email} isNewUser={ponds.length === 0 && activityLogs.length === 0} />}
        </div>
    );
}

const StatCard = ({ title, value, icon, variant = "white" }) => {
    const variants = {
        blue: "bg-blue-50/80 text-blue-600 border-blue-100/50",
        gray: "bg-gray-50/80 text-gray-700 border-gray-100/50",
        orange: "bg-orange-50/80 text-orange-600 border-orange-100/50",
        white: "bg-white text-gray-600 border-gray-100",
        purple: "bg-purple-50/80 text-purple-600 border-purple-100/50",
        pink: "bg-pink-50/80 text-pink-600 border-pink-100/50"
    };

    const iconBg = {
        blue: "bg-blue-100 text-blue-600",
        gray: "bg-gray-200 text-gray-600",
        orange: "bg-orange-100 text-orange-600",
        white: "bg-gray-100 text-gray-600",
        purple: "bg-purple-100 text-purple-600",
        pink: "bg-pink-100 text-pink-600"
    };

    return (
        <div className={`p-3 sm:p-5 rounded-2xl border shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left ${variants[variant]}`}>
            <div className={`p-2 rounded-xl mb-2 sm:mb-3 inline-flex ${iconBg[variant]}`}>
                {/* Clone icon to enforce smaller size on mobile */}
                {React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
            </div>
            <div className="w-full min-w-0">
                <p className="text-[10px] sm:text-[13px] font-black uppercase tracking-wider opacity-70 truncate mb-0.5" title={title}>{title}</p>
                <h3 className="text-[18px] sm:text-[24px] font-black leading-tight text-gray-900 truncate" title={String(value)}>{value}</h3>
            </div>
        </div>
    );
};
