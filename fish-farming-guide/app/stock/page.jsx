"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, Fish, Plus, ArrowRightLeft, Trash2, Loader2, Pencil, Leaf, Wheat, Syringe, AlertTriangle, Tag } from "lucide-react";
import { farmApi } from "@/integration/farmApi";
// Import the specific modals
import AddStockEntryModal from "@/components/layout/AddStockEntryModal";
import EditInventoryModal from "@/components/layout/EditInventoryModal";
import TransferInventoryModal from "@/components/layout/TransferInventoryModal";
import AddFeedStockModal from "@/components/layout/AddFeedStockModal";
import AddFertilizerStockModal from "@/components/layout/AddFertilizerStockModal";
import AddTreatmentStockModal from "@/components/layout/AddTreatmentStockModal";
import SaleModal from "@/components/layout/SaleModal";

export default function StockManagement() {
    const [activeTab, setActiveTab] = useState('fish'); // 'fish', 'feed', 'fertilizer', 'treatment'

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModal, setEditModal] = useState({ isOpen: false, entry: null });
    const [transferModalOpen, setTransferModalOpen] = useState(false);

    const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
    const [isFertilizerModalOpen, setIsFertilizerModalOpen] = useState(false);
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
    const [saleModal, setSaleModal] = useState(null);

    // Data states
    const [inventory, setInventory] = useState([]);
    const [feedStock, setFeedStock] = useState([]);
    const [fertilizerStock, setFertilizerStock] = useState([]);
    const [treatmentStock, setTreatmentStock] = useState([]);

    const [stats, setStats] = useState({
        totalStock: 0,
        totalValue: 0,
        speciesVariety: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summary, items, feeds, fertilizers, treatments] = await Promise.all([
                farmApi.getInventorySummary(),
                farmApi.getInventory(),
                farmApi.getFeedStock(),
                farmApi.getFertilizerStock(),
                farmApi.getTreatmentStock()
            ]);
            setStats({
                totalStock: summary.TotalStock || 0,
                totalValue: summary.TotalValue || 0,
                speciesVariety: summary.SpeciesVariety || 0
            });
            setInventory(items || []);
            setFeedStock(feeds || []);
            setFertilizerStock(fertilizers || []);
            setTreatmentStock(treatments || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch stock data:", err);
            setError("Could not load inventory. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleStockAdded = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const handleFeedStockAdded = () => {
        setIsFeedModalOpen(false);
        fetchData();
    };

    const handleFertilizerStockAdded = () => {
        setIsFertilizerModalOpen(false);
        fetchData();
    };

    const handleTreatmentStockAdded = () => {
        setIsTreatmentModalOpen(false);
        fetchData();
    };

    const handleDeleteFish = async (id, name) => {
        if (!confirm(`Are you sure you want to remove the inventory entry for ${name}?`)) return;
        try {
            await farmApi.deleteInventory(id);
            await fetchData();
        } catch (err) {
            alert("Failed to delete inventory entry.");
        }
    };

    const handleUpdateSale = async (saleData) => {
        try {
            await farmApi.toggleForSale(saleData.batchId, saleData.isForSale, saleData.quantityForSale, saleData.salePricePerUnit);
            await fetchData();
            setSaleModal(null);
        } catch (err) {
            console.error("Failed to toggle sale status:", err);
            alert("Could not update sale status. Please try again.");
        }
    };

    const handleDeleteFeed = async (id, type) => {
        if (!confirm(`Are you sure you want to remove the feed stock entry for ${type}?`)) return;
        try {
            await farmApi.deleteFeedStock(id);
            await fetchData();
        } catch (err) {
            alert("Failed to delete feed stock entry.");
        }
    };

    const handleDeleteFertilizer = async (id, name) => {
        if (!confirm(`Are you sure you want to remove the fertilizer stock entry for ${name}?`)) return;
        try {
            await farmApi.deleteFertilizerStock(id);
            await fetchData();
        } catch (err) {
            alert("Failed to delete fertilizer stock entry.");
        }
    };

    const handleDeleteTreatment = async (id, name) => {
        if (!confirm(`Are you sure you want to remove the treatment stock entry for ${name}?`)) return;
        try {
            await farmApi.deleteTreatmentStock(id);
            await fetchData();
        } catch (err) {
            alert("Failed to delete treatment stock entry.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                    <p className="text-gray-500 font-medium">Loading Inventory...</p>
                </div>
            </div>
        );
    }

    // Derived stats for Feed
    const totalFeedInventory = feedStock.reduce((acc, curr) => acc + (curr.CurrentQuantity_kg || 0), 0);
    const totalFeedValue = feedStock.reduce((acc, curr) => acc + (curr.TotalCost || 0), 0);

    // Derived stats for Fertilizer
    const totalFertInventory = fertilizerStock.reduce((acc, curr) => acc + (curr.CurrentQuantity_kg || 0), 0);
    const totalFertValue = fertilizerStock.reduce((acc, curr) => acc + (curr.TotalCost || 0), 0);

    // Derived stats for Treatment
    const totalTreatmentItems = treatmentStock.length;
    const totalTreatmentValue = treatmentStock.reduce((acc, curr) => acc + (curr.TotalCost || 0), 0);

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-white max-w-[100vw] overflow-x-hidden">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
                <div className="space-y-1.5">
                    <h1 className="text-[24px] sm:text-[28px] font-black text-slate-900 tracking-tight">Farm Inventory</h1>
                    <p className="text-[13px] sm:text-[14px] text-slate-400 font-medium">Live fish tracking and management of feed, fertilizers & treatments.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {activeTab !== 'fish' && (
                        <button
                            onClick={() => {
                                if (activeTab === 'feed') setIsFeedModalOpen(true);
                                if (activeTab === 'fertilizer') setIsFertilizerModalOpen(true);
                                if (activeTab === 'treatment') setIsTreatmentModalOpen(true);
                            }}
                            className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl transition-all text-sm font-bold shadow-lg active:scale-95 whitespace-nowrap ${
                                activeTab === 'treatment' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/10' : 'bg-[#2563eb] hover:bg-blue-700 shadow-blue-500/10'
                            }`}
                        >
                            <Plus size={18} />
                            Add {activeTab === 'feed' ? 'Feed' : activeTab === 'fertilizer' ? 'Fertilizer' : 'Treatment'} Stock
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 sm:mb-10 overflow-x-auto pb-4 scrollbar-hide max-w-[calc(100vw-32px)] sm:max-w-full">
                <button
                    onClick={() => setActiveTab('fish')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'fish'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <Fish size={16} /> Fish Inventory
                </button>
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'feed'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <Wheat size={16} /> Feed Stock
                </button>
                <button
                    onClick={() => setActiveTab('fertilizer')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'fertilizer'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <Leaf size={16} /> Fertilizer Stock
                </button>
                 <button
                    onClick={() => setActiveTab('treatment')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'treatment'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <Syringe size={16} /> Disease Treatment
                </button> 
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <span>{error}</span>
                    <button onClick={fetchData} className="underline font-bold ml-auto">Retry</button>
                </div>
            )}

            {/* Fish Tab Content */}
            {activeTab === 'fish' && (
                <>
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <div className="bg-[#eff6ff] p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-[#dbeafe] flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-[#2563eb] rounded-xl text-white shadow-blue-500/10 shadow-lg">
                                <Package size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Stock</p>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                    {stats.totalStock.toLocaleString()} <span className="text-[11px] sm:text-sm font-bold text-slate-400 ml-1">Fish</span>
                                </h3>
                            </div>
                        </div>

                        <div className="bg-[#f0fdf4] p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-[#dcfce7] flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-emerald-500/10 shadow-lg">
                                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Investment</p>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                    PKR {stats.totalValue.toLocaleString()}
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-slate-800 rounded-xl text-white shadow-slate-500/10 shadow-lg">
                                <Fish size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Variety</p>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                    {stats.speciesVariety} <span className="text-[11px] sm:text-sm font-bold text-slate-400 ml-1">Species</span>
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Fish Table */}
                    {inventory.length === 0 ? (
                        <div className="bg-white rounded-[24px] sm:rounded-3xl border border-slate-200 border-dashed p-12 sm:p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                                <Package size={32} className="sm:w-11 sm:h-11" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">No Active Ponds</h3>
                            <p className="text-[13px] sm:text-[14px] text-slate-400 mb-8 max-w-sm font-medium">
                                Fish inventory is completely automated! To see fish here, add a new pond and stock it from your Dashboard.
                            </p>
                            <a
                                href="/dashboard"
                                className="flex items-center gap-2 px-8 py-3.5 bg-[#2563eb] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                <ArrowRightLeft size={20} /> Go to Dashboard
                            </a>
                        </div>
                    ) : (
                        <div className="block bg-white rounded-2xl border border-slate-200 shadow-sm w-full overflow-hidden">
                            <div className="overflow-x-auto w-full max-w-[calc(100vw-32px)] sm:max-w-full">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Species</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (PKR)</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {inventory.map((item) => (
                                            <tr key={item.InventoryId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5 text-[13px] text-slate-500 font-medium">
                                                    {new Date(item.StockingDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-5 text-[14px] font-bold text-slate-900">{item.PondName}</td>
                                                <td className="px-6 py-5 text-[14px] font-bold text-slate-900">{item.SpeciesName}</td>
                                                <td className="px-6 py-5 text-[14px] font-black text-slate-900 text-right">{item.Quantity.toLocaleString()}</td>
                                                <td className="px-6 py-5 text-right font-black text-emerald-600">
                                                    PKR {(item.Quantity * (item.CostPerUnit_PKR || 0)).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {item.IsForSale ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                                                            <Tag size={11} />
                                                            For Sale ({item.QuantityForSale})
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-300 font-medium">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        onClick={() => setSaleModal({ batchId: item.InventoryId, speciesName: item.SpeciesName, maxQuantity: item.Quantity, currentSaleQty: item.QuantityForSale || 0, currentSalePrice: item.SalePricePerUnit || '', isForSale: item.IsForSale || false })}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-sm"
                                                    >
                                                        <Tag size={13} />
                                                        Sell
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Feed Tab Content */}
            {activeTab === 'feed' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <div className="bg-amber-50 p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-amber-100 flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-amber-600 rounded-xl text-white shadow-amber-500/10 shadow-lg">
                                <Wheat size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-amber-900/50 font-black uppercase tracking-widest">Available Feed</p>
                                <h3 className="text-lg sm:text-xl font-black text-amber-900 leading-tight">
                                    {totalFeedInventory.toLocaleString()} <span className="text-[11px] sm:text-sm font-bold text-amber-700/60 ml-1">kg</span>
                                </h3>
                            </div>
                        </div>

                        <div className="bg-[#f0fdf4] p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-[#dcfce7] flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-emerald-500/10 shadow-lg">
                                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Investment</p>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                    PKR {totalFeedValue.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {feedStock.length === 0 ? (
                        <div className="bg-white rounded-[24px] border border-slate-200 border-dashed p-12 text-center">
                            <h3 className="text-lg font-black text-slate-900 mb-2">No Feed Stock</h3>
                            <button onClick={() => setIsFeedModalOpen(true)} className="mt-4 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold">Add Feed</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 w-full max-w-[calc(100vw-32px)] sm:max-w-full">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-y border-slate-100">
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest w-32">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Feed Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Supplier</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Expiry</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest w-32">Qty Left</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest w-40">Total Cost</th>
                                        <th className="px-6 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {feedStock.map((item) => (
                                        <tr key={item.StockId} className={item.CurrentQuantity_kg < 50 ? 'bg-red-50' : 'hover:bg-slate-50/50 transition-colors'}>
                                            <td className="px-6 py-5 text-[13px] text-slate-500 font-medium">{new Date(item.PurchaseDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 font-bold text-slate-900">{item.FeedType}</td>
                                            <td className="px-6 py-5 font-medium text-slate-500">{item.Supplier || '-'}</td>
                                            <td className="px-6 py-5 text-[13px] text-slate-500 font-medium">
                                                {item.ExpiryDate ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={item.IsExpired === 1 ? 'text-red-500 font-bold' : ''}>
                                                            {new Date(item.ExpiryDate).toLocaleDateString()}
                                                        </span>
                                                        {item.IsExpired === 1 && (
                                                            <span className="text-[10px] bg-red-100 text-red-600 font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                                                                ⚠ Expired
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-5 font-black text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {item.CurrentQuantity_kg < 50 && <span className="text-red-600 flex items-center gap-1 text-[10px] px-2 py-0.5 border border-red-200 bg-red-100 rounded-full shadow-sm animate-pulse"><AlertTriangle size={10} strokeWidth={3}/> Low Stock</span>}
                                                    <span>{item.CurrentQuantity_kg} kg</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-black text-emerald-600 text-right">PKR {(item.TotalCost).toLocaleString()}</td>
                                            <td className="px-6 py-5">
                                                <button onClick={() => handleDeleteFeed(item.StockId, item.FeedType)} className="p-2 text-slate-300 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Fertilizer Tab Content */}
            {activeTab === 'fertilizer' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <div className="bg-emerald-50 p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-emerald-100 flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-emerald-500/10 shadow-lg">
                                <Leaf size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-900/50 font-black uppercase tracking-widest">Available Fertilizer</p>
                                <h3 className="text-lg sm:text-xl font-black text-emerald-900 leading-tight">
                                    {totalFertInventory.toLocaleString()} <span className="text-[11px] sm:text-sm font-bold text-emerald-700/60 ml-1">kg</span>
                                </h3>
                            </div>
                        </div>

                        <div className="bg-[#f0fdf4] p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-[#dcfce7] flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-emerald-500/10 shadow-lg">
                                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Investment</p>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                    PKR {totalFertValue.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {fertilizerStock.length === 0 ? (
                        <div className="bg-white rounded-[24px] border border-slate-200 border-dashed p-12 text-center">
                            <h3 className="text-lg font-black text-slate-900 mb-2">No Fertilizer Stock</h3>
                            <button onClick={() => setIsFertilizerModalOpen(true)} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">Add Fertilizer</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 w-full max-w-[calc(100vw-32px)] sm:max-w-full">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-y border-slate-100">
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest w-32">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest w-40">Category</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Expiry</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest w-32">Qty Left</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest w-40">Total Cost</th>
                                        <th className="px-6 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {fertilizerStock.map((item) => (
                                        <tr key={item.StockId} className={item.CurrentQuantity_kg < 50 ? 'bg-red-50' : 'hover:bg-slate-50/50 transition-colors'}>
                                            <td className="px-6 py-5 text-[13px] text-slate-500 font-medium">{new Date(item.PurchaseDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 font-bold text-slate-900">{item.Category}</td>
                                            <td className="px-6 py-5 font-medium text-slate-700">{item.ProductName}</td>
                                            <td className="px-6 py-5 text-[13px] text-slate-500 font-medium">
                                                {item.ExpiryDate ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={item.IsExpired === 1 ? 'text-red-500 font-bold' : ''}>
                                                            {new Date(item.ExpiryDate).toLocaleDateString()}
                                                        </span>
                                                        {item.IsExpired === 1 && (
                                                            <span className="text-[10px] bg-red-100 text-red-600 font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                                                                ⚠ Expired
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-5 font-black text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {item.CurrentQuantity_kg < 50 && <span className="text-red-600 flex items-center gap-1 text-[10px] px-2 py-0.5 border border-red-200 bg-red-100 rounded-full shadow-sm animate-pulse"><AlertTriangle size={10} strokeWidth={3}/> Low Stock</span>}
                                                    <span>{item.CurrentQuantity_kg} kg</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-black text-emerald-600 text-right">PKR {(item.TotalCost).toLocaleString()}</td>
                                            <td className="px-6 py-5">
                                                <button onClick={() => handleDeleteFertilizer(item.StockId, item.ProductName)} className="p-2 text-slate-300 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Treatment Tab Content */}
            {activeTab === 'treatment' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <div className="bg-rose-50 p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-rose-100 flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-rose-600 rounded-xl text-white shadow-rose-500/10 shadow-lg">
                                <Syringe size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-rose-900/50 font-black uppercase tracking-widest">Treatment Items</p>
                                <h3 className="text-lg sm:text-xl font-black text-rose-900 leading-tight">
                                    {totalTreatmentItems} <span className="text-[11px] sm:text-sm font-bold text-rose-700/60 ml-1">items</span>
                                </h3>
                            </div>
                        </div>

                        <div className="bg-[#f0fdf4] p-5 sm:p-6 rounded-[20px] sm:rounded-2xl border border-[#dcfce7] flex items-center gap-4 shadow-sm">
                            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-emerald-500/10 shadow-lg">
                                <TrendingUp size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Investment</p>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                    PKR {totalTreatmentValue.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {treatmentStock.length === 0 ? (
                        <div className="bg-white rounded-[24px] border border-slate-200 border-dashed p-12 text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 mb-6 mx-auto">
                                <Syringe size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">No Treatment Stock</h3>
                            <p className="text-[13px] text-slate-400 mb-6 max-w-sm mx-auto font-medium">Keep medicines and treatment supplies stocked for disease management.</p>
                            <button onClick={() => setIsTreatmentModalOpen(true)} className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all">Add Treatment</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 w-full max-w-[calc(100vw-32px)] sm:max-w-full">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medicine</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Available</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value (PKR)</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {treatmentStock.map((item) => (
                                        <tr key={item.StockId} className={item.CurrentQuantity < 50 ? 'bg-red-50' : 'hover:bg-slate-50/50 transition-colors'}>
                                            <td className="px-6 py-5 text-[13px] text-slate-500 font-medium">{new Date(item.PurchaseDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 font-bold text-slate-900">{item.MedicineName}</td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                    item.Category === 'Antibiotic' ? 'bg-purple-50 text-purple-700' :
                                                    item.Category === 'Chemical' ? 'bg-blue-50 text-blue-700' :
                                                    item.Category === 'Natural' ? 'bg-green-50 text-green-700' :
                                                    item.Category === 'Pesticide' ? 'bg-orange-50 text-orange-700' :
                                                    'bg-slate-50 text-slate-700'
                                                }`}>{item.Category}</span>
                                            </td>
                                            <td className="px-6 py-5 font-black text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {item.CurrentQuantity < 50 && <span className="text-red-600 flex items-center gap-1 text-[10px] px-2 py-0.5 border border-red-200 bg-red-100 rounded-full shadow-sm animate-pulse"><AlertTriangle size={10} strokeWidth={3}/> Low Stock</span>}
                                                    <span>{item.CurrentQuantity} {item.Unit}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-black text-emerald-600 text-right">PKR {(item.TotalCost || 0).toLocaleString()}</td>
                                            <td className="px-6 py-5 text-[13px] text-slate-500 font-medium">
                                                {item.ExpiryDate ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className={item.IsExpired === 1 ? 'text-red-500 font-bold' : ''}>
                                                            {new Date(item.ExpiryDate).toLocaleDateString()}
                                                        </span>
                                                        {item.IsExpired === 1 && (
                                                            <span className="text-[10px] bg-red-100 text-red-600 font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                                                                ⚠ Expired
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <button onClick={() => handleDeleteTreatment(item.StockId, item.MedicineName)} className="p-2 text-slate-300 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <AddStockEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleStockAdded} />
            <EditInventoryModal isOpen={editModal.isOpen} entry={editModal.entry} onClose={() => setEditModal({ isOpen: false, entry: null })} onSuccess={() => { setEditModal({ isOpen: false, entry: null }); fetchData(); }} />
            <TransferInventoryModal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} onSuccess={() => { setTransferModalOpen(false); fetchData(); }} />

            <AddFeedStockModal isOpen={isFeedModalOpen} onClose={() => setIsFeedModalOpen(false)} onSuccess={handleFeedStockAdded} />
            <AddFertilizerStockModal isOpen={isFertilizerModalOpen} onClose={() => setIsFertilizerModalOpen(false)} onSuccess={handleFertilizerStockAdded} />
            <AddTreatmentStockModal isOpen={isTreatmentModalOpen} onClose={() => setIsTreatmentModalOpen(false)} onSuccess={handleTreatmentStockAdded} />

            <SaleModal
                isOpen={!!saleModal}
                batch={saleModal}
                onClose={() => setSaleModal(null)}
                onUpdate={handleUpdateSale}
            />
        </div>
    );
}