"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    XCircle,
    Fish,
    ShieldCheck,
    BookOpen,
    Trash2,
    Plus,
    LayoutList,
    Edit,
    Users,
    Ban,
    UserCheck,
    Loader2,
    Map,
    Droplet
} from "lucide-react";
import { farmApi } from "@/integration/farmApi";
import EditPendingSpeciesModal from "@/components/layout/EditPendingSpeciesModal";
import AddSpeciesModal from "@/components/layout/AddSpeciesModal";
import FeedRuleModal from "@/components/layout/FeedRuleModal";
import FertilizerRuleModal from "@/components/layout/FertilizerRuleModal";
import StockingRuleModal from "@/components/layout/StockingRuleModal";
import CompatibilityModal from "@/components/layout/CompatibilityModal";
import DiseaseModal from "@/components/layout/DiseaseModal";
import AnnouncementModal from "@/components/layout/AnnouncementModal";
import TicketReplyModal from "@/components/layout/TicketReplyModal";
import { useParams, useRouter } from "next/navigation";

export default function AdminDashboard() {
    const params = useParams();
    const router = useRouter();
    const activeTab = params?.tab || "approvals";

    // Approvals State
    const [pendingSpecies, setPendingSpecies] = useState([]);
    const [totalApproved, setTotalApproved] = useState(0);
    const [approvedSpecies, setApprovedSpecies] = useState([]);
    const [editingSpecies, setEditingSpecies] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Knowledge State
    const [guides, setGuides] = useState([]);
    const [newGuide, setNewGuide] = useState({ title: "", category: "complete-guides" });
    const [activeGuideForm, setActiveGuideForm] = useState(null); // Which guide has the "Add Section" open
    const [newSection, setNewSection] = useState({ title: "", contentText: "" });

    // Users State
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userAction, setUserAction] = useState(null); // userId being acted on

    // Farm Overview State
    const [farms, setFarms] = useState([]);
    const [farmStats, setFarmStats] = useState({});
    const [farmsLoading, setFarmsLoading] = useState(false);

    // Marketplace Moderation State
    const [marketplaceListings, setMarketplaceListings] = useState([]);
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);
    const [moderationAction, setModerationAction] = useState(null);

    // Disease Catalog State
    const [adminDiseases, setAdminDiseases] = useState([]);
    const [diseasesLoading, setDiseasesLoading] = useState(false);
    const [diseaseFormOpen, setDiseaseFormOpen] = useState(false);
    const [editingDisease, setEditingDisease] = useState(null);
    const [diseaseAction, setDiseaseAction] = useState(null);
    const emptyDiseaseForm = { name: '', category: 'Bacterial', symptoms: '', species: '', treatment: '', prevention: '', severity: 'Moderate' };
    const [diseaseForm, setDiseaseForm] = useState(emptyDiseaseForm);

    // Support Tickets State
    const [adminTickets, setAdminTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [ticketAction, setTicketAction] = useState(null);
    const [replyingTicket, setReplyingTicket] = useState(null);
    const [ticketReply, setTicketReply] = useState('');

    // Announcements State
    const [adminAnnouncements, setAdminAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);
    const [announcementAction, setAnnouncementAction] = useState(null);
    const emptyAnnouncementForm = { title: '', message: '', type: 'Info' };
    const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncementForm);
    const [announcementFormOpen, setAnnouncementFormOpen] = useState(false);

    // Rules Management State
    const [feedRules, setFeedRules] = useState([]);
    const [fertilizerRules, setFertilizerRules] = useState([]);
    const [rulesLoading, setRulesLoading] = useState(false);
    const [rulesSubTab, setRulesSubTab] = useState('feed');
    const [ruleAction, setRuleAction] = useState(null);
    const [feedRuleModalOpen, setFeedRuleModalOpen] = useState(false);
    const [editingFeedRule, setEditingFeedRule] = useState(null);
    const emptyFeedRuleForm = { speciesId: '', stage: 'Fingerling', minSize: 0, maxSize: 99, dailyRate: 0, conditionFactor: 0.01, feedType: '', frequency: '' };
    const [feedRuleForm, setFeedRuleForm] = useState(emptyFeedRuleForm);
    const [fertRuleModalOpen, setFertRuleModalOpen] = useState(false);
    const [editingFertRule, setEditingFertRule] = useState(null);
    const emptyFertRuleForm = { cultivationType: 'Intensive', pondType: 'Earthen Pond', orgProduct: '', orgDosage: 0, orgRate: 0, orgFrequency: '', orgBenefits: '', inorgProduct: '', inorgDosage: 0, inorgRate: 0, inorgFrequency: '', inorgBenefits: '', limeProduct: '', limeDosage: 0, limeRate: 0, limeFrequency: '', limeBenefits: '' };
    const [fertRuleForm, setFertRuleForm] = useState(emptyFertRuleForm);
    const [stockingRules, setStockingRules] = useState([]);
    const [stockingRuleModalOpen, setStockingRuleModalOpen] = useState(false);
    const [editingStockingRule, setEditingStockingRule] = useState(null);
    const emptyStockingRuleForm = { Stage: 'Nursery', CultivationType: 'Extensive', CultureType: 'Polyculture', MinFishPerAcre: 0, MaxFishPerAcre: 0, MaxSpeciesAllowed: 3 };
    const [stockingRuleForm, setStockingRuleForm] = useState(emptyStockingRuleForm);
    const [compatibilities, setCompatibilities] = useState([]);
    const [compModalOpen, setCompModalOpen] = useState(false);
    const emptyCompForm = { speciesId: '', compatibleWithId: '', reason: '' };
    const [compForm, setCompForm] = useState(emptyCompForm);

    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pending, approved, knowledge] = await Promise.all([
                farmApi.getPendingSpecies(),
                farmApi.getApprovedSpecies(),
                farmApi.getKnowledgeGuides().catch(() => [])
            ]);
            setPendingSpecies(pending || []);
            setApprovedSpecies(approved || []);
            setTotalApproved(approved?.length || 0);
            setGuides(knowledge || []);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'farms') fetchFarms();
        if (activeTab === 'marketplace') fetchMarketplaceData();
        if (activeTab === 'diseases') fetchDiseases();
        if (activeTab === 'tickets') fetchTickets();
        if (activeTab === 'announcements') fetchAnnouncements();
        if (activeTab === 'rules') fetchRulesData();
    }, [activeTab]);

    const fetchRulesData = async () => {
        setRulesLoading(true);
        try {
            const [feedRes, fertRes, stockingRes, compRes] = await Promise.all([
                farmApi.getAdminFeedRules(),
                farmApi.getAdminFertilizerRules(),
                farmApi.getAdminStockingRules(),
                farmApi.getAdminCompatibilities()
            ]);
            setFeedRules(feedRes.rules || []);
            setFertilizerRules(fertRes.rules || []);
            setStockingRules(stockingRes.rules || []);
            setCompatibilities(compRes.compatibilities || []);
        } catch (err) {
            console.error("Failed to fetch rules:", err);
        } finally {
            setRulesLoading(false);
        }
    };

    const fetchAnnouncements = async () => {
        setAnnouncementsLoading(true);
        try {
            const res = await farmApi.getAdminAnnouncements();
            setAdminAnnouncements(res.announcements || []);
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        } finally {
            setAnnouncementsLoading(false);
        }
    };

    const fetchTickets = async () => {
        setTicketsLoading(true);
        try {
            const res = await farmApi.getAdminTickets();
            setAdminTickets(res.tickets || []);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
        } finally {
            setTicketsLoading(false);
        }
    };

    const fetchDiseases = async () => {
        setDiseasesLoading(true);
        try {
            const res = await farmApi.getAdminDiseases();
            setAdminDiseases(res.diseases || []);
        } catch (err) {
            console.error("Failed to fetch diseases:", err);
        } finally {
            setDiseasesLoading(false);
        }
    };

    const fetchMarketplaceData = async () => {
        setMarketplaceLoading(true);
        try {
            const [listingsRes, requestsRes] = await Promise.all([
                farmApi.getAdminMarketplaceListings(),
                farmApi.getAdminPurchaseRequests()
            ]);
            setMarketplaceListings(listingsRes.listings || []);
            setPurchaseRequests(requestsRes.requests || []);
        } catch (err) {
            console.error("Failed to fetch marketplace data:", err);
        } finally {
            setMarketplaceLoading(false);
        }
    };

    const fetchFarms = async () => {
        setFarmsLoading(true);
        try {
            const res = await farmApi.getAdminFarms();
            setFarms(res.farms || []);
            setFarmStats(res.stats || {});
        } catch (err) {
            console.error("Failed to fetch farms:", err);
        } finally {
            setFarmsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await farmApi.getAdminUsers();
            setUsers(res.users || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        setUserAction(userId);
        try {
            await farmApi.toggleUserStatus(userId);
            await fetchUsers();
        } catch (err) {
            alert(err.message || "Failed to update status");
        } finally {
            setUserAction(null);
        }
    };

    const handleChangeRole = async (userId, role) => {
        setUserAction(userId);
        try {
            await farmApi.changeUserRole(userId, role);
            await fetchUsers();
        } catch (err) {
            alert(err.message || "Failed to change role");
        } finally {
            setUserAction(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to permanently delete this user and all their data?")) return;
        setUserAction(userId);
        try {
            await farmApi.deleteUser(userId);
            await fetchUsers();
        } catch (err) {
            alert(err.message || "Failed to delete user");
        } finally {
            setUserAction(null);
        }
    };

    // -------------------------------------------------------------
    // SPECIES APPROVAL LOGIC
    // -------------------------------------------------------------
    const handleApprove = async (id) => {
        try {
            await farmApi.approveSpecies(id);
            fetchData();
        } catch (err) {
            console.error("Approval failed:", err);
        }
    };

    const handleReject = async (id) => {
        if (!confirm("Are you sure you want to reject and delete this submission?")) return;
        try {
            await farmApi.rejectSpecies(id);
            fetchData();
        } catch (err) {
            console.error("Rejection failed:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to completely delete this species from the database?")) return;
        try {
            await farmApi.deleteSpecies(id);
            fetchData();
        } catch (err) {
            console.error("Deletion failed:", err);
        }
    };

    // -------------------------------------------------------------
    // KNOWLEDGE MANAGER LOGIC
    // -------------------------------------------------------------
    const handleCreateGuide = async (e) => {
        e.preventDefault();
        if (!newGuide.title || !newGuide.category) return;

        try {
            await farmApi.addKnowledgeGuide({
                tabCategory: newGuide.category,
                title: newGuide.title,
                displayOrder: 0
            });
            setNewGuide({ ...newGuide, title: "" });
            fetchData();
        } catch (err) {
            console.error("Failed to create guide", err);
        }
    };

    const handleDeleteGuide = async (id) => {
        if (!confirm("Delete this entire guide and ALL its sections?")) return;
        try {
            await farmApi.deleteKnowledgeGuide(id);
            fetchData();
        } catch (err) {
            console.error("Failed to delete guide", err);
        }
    };

    const handleCreateSection = async (e, guideId) => {
        e.preventDefault();
        if (!newSection.title || !newSection.contentText) return;

        try {
            await farmApi.addKnowledgeSection({
                guideId: guideId,
                title: newSection.title,
                contentText: newSection.contentText,
                displayOrder: 0
            });
            setNewSection({ title: "", contentText: "" });
            setActiveGuideForm(null); // close form
            fetchData();
        } catch (err) {
            console.error("Failed to create section", err);
        }
    };

    const handleDeleteSection = async (id) => {
        if (!confirm("Delete this section text?")) return;
        try {
            await farmApi.deleteKnowledgeSection(id);
            fetchData();
        } catch (err) {
            console.error("Failed to delete section", err);
        }
    };

    // -------------------------------------------------------------
    // RENDER SCREENS
    // -------------------------------------------------------------
    const renderApprovals = () => {
        if (loading) {
            return (
                <div className="bg-white rounded-[40px] py-40 flex flex-col items-center justify-center gap-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="w-16 h-16 border-[6px] border-amber-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Loading submissions...</p>
                </div>
            );
        }

        if (pendingSpecies.length === 0) {
            return (
                <div className="bg-white rounded-[40px] py-40 flex flex-col items-center justify-center gap-8 border-2 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                        <CheckCircle2 size={56} strokeWidth={1} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-3xl font-black text-slate-900">Queue is empty</h3>
                        <p className="text-slate-400 text-[15px] font-bold">All species submissions have been reviewed.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pendingSpecies.map((s) => (
                    <div key={s.SpeciesId} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-8 flex flex-col h-full relative overflow-hidden group hover:border-amber-200 transition-all duration-300">
                        {/* Image Section */}
                        <div className="relative h-48 w-full -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 mb-6 overflow-hidden border-b border-gray-100 bg-gray-50">
                            {s.ImageUrl ? (
                                <img
                                    src={s.ImageUrl}
                                    alt={s.Name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://placehold.co/600x400?text=No+Image";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-amber-200">
                                    <Fish size={48} strokeWidth={1.5} />
                                </div>
                            )}
                        </div>

                        {/* Title area */}
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-bold text-gray-900">{s.Name}</h3>
                                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                    Pending
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(s.CompatibleRegions || "Punjab").split(/,\s*(?![^()]*\))/g).map((region, idx) => (
                                    <span key={idx} className="px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[11px] font-bold border border-gray-100 uppercase tracking-wide inline-block max-w-full whitespace-normal break-words text-center leading-snug">
                                        {region.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Data Grids */}
                        <div className="space-y-4 flex-1">
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Temperature:</span>
                                    <span className="text-gray-900 font-bold">{s.MinTemp}-{s.MaxTemp}°C</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">pH Range:</span>
                                    <span className="text-gray-900 font-bold">{s.MinPH}-{s.MaxPH}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Dissolved O₂:</span>
                                    <span className="text-gray-900 font-bold">{s.MinDO}+ mg/L</span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-50 my-2" />

                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Fingerling Size:</span>
                                    <span className="text-gray-900 font-bold">{s.FingerlingSizeG}g</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Market Size:</span>
                                    <span className="text-gray-900 font-bold">{s.MarketSizeKG} kg</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Harvest Time:</span>
                                    <span className="text-gray-900 font-bold">{s.HarvestTimeMonths} months</span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-50 my-2" />

                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Stocking/Acre:</span>
                                    <span className="text-gray-900 font-bold">{Number(s.MaxStockingDensity)?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Survival Rate:</span>
                                    <span className="text-gray-900 font-bold">{s.SurvivalRateLower}-{s.SurvivalRateUpper}%</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px]">
                                    <span className="text-gray-500">Market Price:</span>
                                    <span className="text-emerald-600 font-black tracking-tight">PKR {Number(s.MinMarketPrice).toLocaleString()}-{Number(s.MaxMarketPrice).toLocaleString()}/kg</span>
                                </div>
                            </div>

                            <div className="pt-4 space-y-2">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">User Description:</p>
                                <p className="text-[12px] text-gray-700 leading-relaxed font-medium bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic">
                                    "{s.Description || "No description provided."}"
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => setEditingSpecies(s)}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg group/btn"
                            >
                                <CheckCircle2 size={18} strokeWidth={3} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                                Review & Approve
                            </button>
                            <button
                                onClick={() => handleReject(s.SpeciesId)}
                                className="w-14 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 py-4 rounded-xl transition-all active:scale-95"
                            >
                                <XCircle size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderAllSpecies = () => {
        if (loading) {
            return (
                <div className="bg-white rounded-[40px] py-40 flex flex-col items-center justify-center gap-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="w-16 h-16 border-[6px] border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Loading species...</p>
                </div>
            );
        }

        if (approvedSpecies.length === 0) {
            return (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Live Species Management</h2>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Add New Species
                        </button>
                    </div>
                    <div className="bg-white rounded-[40px] py-40 flex flex-col items-center justify-center gap-8 border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 shadow-inner">
                            <Fish size={56} strokeWidth={1} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-black text-slate-900">No Species Found</h3>
                            <p className="text-slate-400 text-[15px] font-bold">The platform currently has no live species.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Live Species Management</h2>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add New Species
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {approvedSpecies.map((s) => (
                        <div key={s.SpeciesId} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-8 flex flex-col h-full relative overflow-hidden group hover:border-emerald-200 transition-all duration-300">
                            {/* Image Section */}
                            <div className="relative h-48 w-full -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 mb-6 overflow-hidden border-b border-gray-100 bg-gray-50">
                                {s.ImageUrl ? (
                                    <img
                                        src={s.ImageUrl}
                                        alt={s.Name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/600x400?text=No+Image";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <Fish size={48} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>

                            {/* Title area */}
                            <div className="mb-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold text-gray-900">{s.Name}</h3>
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        Verified
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(s.CompatibleRegions || "Punjab").split(/,\s*(?![^()]*\))/g).map((region, idx) => (
                                        <span key={idx} className="px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-[11px] font-bold border border-gray-100 uppercase tracking-wide inline-block max-w-full whitespace-normal break-words text-center leading-snug">
                                            {region.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Data Grids */}
                            <div className="space-y-4 flex-1">
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Temperature:</span>
                                        <span className="text-gray-900 font-bold">{s.MinTemp}-{s.MaxTemp}°C</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">pH Range:</span>
                                        <span className="text-gray-900 font-bold">{s.MinPH}-{s.MaxPH}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Dissolved O₂:</span>
                                        <span className="text-gray-900 font-bold">{s.MinDO}+ mg/L</span>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-50 my-2" />

                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Fingerling Size:</span>
                                        <span className="text-gray-900 font-bold">{s.FingerlingSizeG}g</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Market Size:</span>
                                        <span className="text-gray-900 font-bold">{s.MarketSizeKG} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Harvest Time:</span>
                                        <span className="text-gray-900 font-bold">{s.HarvestTimeMonths} months</span>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-50 my-2" />

                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Stocking/Acre:</span>
                                        <span className="text-gray-900 font-bold">{Number(s.MaxStockingDensity)?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Survival Rate:</span>
                                        <span className="text-gray-900 font-bold">{s.SurvivalRateLower}-{s.SurvivalRateUpper}%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-gray-500">Market Price:</span>
                                        <span className="text-emerald-600 font-black tracking-tight">PKR {Number(s.MinMarketPrice).toLocaleString()}-{Number(s.MaxMarketPrice).toLocaleString()}/kg</span>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-2">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Characteristics:</p>
                                    <p className="text-[12px] text-gray-700 leading-relaxed font-medium bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic">
                                        "{s.Description || "No description provided."}"
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => setEditingSpecies({ ...s, _isApprovedMode: true })}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl text-[13px] font-black transition-all active:scale-95 group/btn"
                                >
                                    <Edit size={16} strokeWidth={2.5} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                                    Edit Information
                                </button>
                                <button
                                    onClick={() => handleDelete(s.SpeciesId)}
                                    className="w-14 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 py-4 rounded-xl transition-all active:scale-95"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderKnowledgeManager = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create New Guide Panel (Sidebar in Desktop) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sticky top-8">
                        <div className="flex items-center gap-3 text-blue-600 mb-6">
                            <BookOpen size={20} strokeWidth={2.5} />
                            <h2 className="text-lg font-bold text-gray-900">Create New Guide</h2>
                        </div>
                        <form onSubmit={handleCreateGuide} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Category Tab</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={newGuide.category}
                                    onChange={(e) => setNewGuide({ ...newGuide, category: e.target.value })}
                                >
                                    <option value="complete-guides">Complete Guides</option>
                                    <option value="faq">FAQ</option>
                                    <option value="quick-tips">Quick Tips</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Guide Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Nursery Pond Management"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={newGuide.title}
                                    onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                            >
                                <Plus size={18} /> Add Guide Block
                            </button>
                        </form>
                    </div>
                </div>

                {/* Existing Guides List */}
                <div className="lg:col-span-2 space-y-6">
                    {guides.length === 0 ? (
                        <div className="bg-white rounded-[24px] border border-dashed border-gray-200 p-12 text-center text-gray-400">
                            <LayoutList size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-bold text-gray-900 text-lg">No Guides Yet</p>
                            <p className="text-sm">Create a guide block on the left to get started.</p>
                        </div>
                    ) : (
                        guides.map((guide) => (
                            <div key={guide.GuideId} className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="bg-gray-50/50 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                                                {guide.TabCategory.replace("-", " ")}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900">{guide.Title}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setActiveGuideForm(activeGuideForm === guide.GuideId ? null : guide.GuideId);
                                                setNewSection({ title: "", contentText: "" });
                                            }}
                                            className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-lg text-sm font-bold transition-all shadow-sm"
                                        >
                                            {activeGuideForm === guide.GuideId ? 'Close Form' : '+ Add Text Content'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGuide(guide.GuideId)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-colors"
                                            title="Delete Entire Guide"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content/Sections */}
                                <div className="p-5 space-y-4">
                                    {(guide.sections || []).length === 0 ? (
                                        <p className="text-sm text-gray-400 italic font-medium px-2">No sections added yet.</p>
                                    ) : (
                                        guide.sections.map((section) => (
                                            <div key={section.SectionId} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-4 group">
                                                <div className="flex-1 space-y-2">
                                                    <h4 className="font-bold text-gray-900 text-sm">{section.Title}</h4>
                                                    <p className="text-[13px] text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                                                        {section.ContentText}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSection(section.SectionId)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 rounded-lg h-fit transition-all shrink-0"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}

                                    {/* Inline Add Section Form */}
                                    {activeGuideForm === guide.GuideId && (
                                        <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-5 animate-in fade-in zoom-in-95 duration-200">
                                            <form onSubmit={(e) => handleCreateSection(e, guide.GuideId)} className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Section Header</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. What are Fingerlings?"
                                                        className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                                                        value={newSection.title}
                                                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Paragraph Content</label>
                                                    <textarea
                                                        required
                                                        rows="4"
                                                        placeholder="Enter the detailed guide text here..."
                                                        className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none font-medium text-gray-700"
                                                        value={newSection.contentText}
                                                        onChange={(e) => setNewSection({ ...newSection, contentText: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        type="submit"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm"
                                                    >
                                                        Save to Database
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderUserManagement = () => {
        if (usersLoading) {
            return (
                <div className="bg-white rounded-[40px] py-40 flex flex-col items-center justify-center gap-6 border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 border-[6px] border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Loading users...</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Registered Users ({users.length})</h2>
                </div>

                {users.length === 0 ? (
                    <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 py-20 text-center">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="font-bold text-gray-900 text-lg">No Users Found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">User</th>
                                        <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Role</th>
                                        <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Farm</th>
                                        <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Region</th>
                                        <th className="text-center px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Ponds</th>
                                        <th className="text-center px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                                        <th className="text-center px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                        <th className="text-center px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const isCurrentUser = u.UserId === JSON.parse(localStorage.getItem("user") || "{}").id;
                                        const isActive = u.IsActive !== false && u.IsActive !== 0;
                                        return (
                                            <tr key={u.UserId} className={`border-b border-gray-100 hover:bg-gray-50/50 ${!isActive ? 'opacity-50 bg-red-50/30' : ''}`}>
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{u.FullName}</p>
                                                        <p className="text-xs text-gray-400">{u.Email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {isCurrentUser ? (
                                                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                            {u.Role} (You)
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={u.Role || 'user'}
                                                            onChange={(e) => handleChangeRole(u.UserId, e.target.value)}
                                                            disabled={userAction === u.UserId}
                                                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                                        >
                                                            <option value="user">Farmer</option>
                                                            <option value="Consumer">Consumer</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-gray-800">{u.FarmName || '—'}</p>
                                                    {u.TotalArea && <p className="text-xs text-gray-400">{u.TotalArea} acres</p>}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {u.District && u.Province ? `${u.District}, ${u.Province}` : u.Province || '—'}
                                                </td>
                                                <td className="px-5 py-4 text-center font-bold text-gray-900">{u.PondCount || 0}</td>
                                                <td className="px-5 py-4 text-center font-bold text-gray-900">{(u.TotalStock || 0).toLocaleString()}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {isActive ? 'Active' : 'Banned'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {isCurrentUser ? (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleToggleStatus(u.UserId)}
                                                                disabled={userAction === u.UserId}
                                                                title={isActive ? 'Ban User' : 'Activate User'}
                                                                className={`p-2 rounded-lg transition-all ${isActive
                                                                    ? 'text-orange-500 hover:bg-orange-50 hover:text-orange-600'
                                                                    : 'text-green-500 hover:bg-green-50 hover:text-green-600'
                                                                    } disabled:opacity-30`}
                                                            >
                                                                {userAction === u.UserId ? <Loader2 size={16} className="animate-spin" /> : isActive ? <Ban size={16} /> : <UserCheck size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(u.UserId)}
                                                                disabled={userAction === u.UserId}
                                                                title="Delete User"
                                                                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all disabled:opacity-30"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderFarmOverview = () => {
        if (farmsLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                </div>
            );
        }

        return (
            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Platform Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Map size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Farms</p>
                            <p className="text-2xl font-black text-slate-900">{farmStats.totalFarms || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                            <LayoutList size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Acres</p>
                            <p className="text-2xl font-black text-slate-900">
                                {farmStats.totalAcresUsed?.toFixed(1) || 0} / {farmStats.totalAcresAllocated?.toFixed(1) || 0}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                            <Droplet size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Ponds</p>
                            <p className="text-2xl font-black text-slate-900">{farmStats.totalPonds || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <Fish size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Live Fish Stock</p>
                            <p className="text-2xl font-black text-slate-900">{(farmStats.totalFish || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Farm Data Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Platform Farms</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Farm / Owner</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Region</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Setup Date</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-center">Acres</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-center">Ponds</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Stocked Fish</th>
                                </tr>
                            </thead>
                            <tbody>
                                {farms.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            No farms found on the platform.
                                        </td>
                                    </tr>
                                ) : (
                                    farms.map((f) => (
                                        <tr key={f.FarmId} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{f.FarmName || 'Unnamed Farm'}</span>
                                                    <span className="text-xs text-slate-500">{f.OwnerName}</span>
                                                    <span className="text-[10px] text-slate-400">{f.Email}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                                    {f.RegionName || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {new Date(f.SetupDate).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-sm font-bold text-slate-900">{f.TotalAreaAcres?.toFixed(1) || 0}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-sm font-bold text-slate-900">{f.PondCount || 0}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-sm font-bold text-blue-600">{(f.TotalStock || 0).toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const handleRemoveListing = async (stockId) => {
        if (!confirm("Are you sure you want to forcibly remove this listing from the marketplace?")) return;
        setModerationAction(`listing-${stockId}`);
        try {
            await farmApi.removeAdminMarketplaceListing(stockId);
            await fetchMarketplaceData();
        } catch (err) {
            alert(err.message || "Failed to remove listing");
        } finally {
            setModerationAction(null);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!confirm("Are you sure you want to delete this purchase request?")) return;
        setModerationAction(`request-${requestId}`);
        try {
            await farmApi.deleteAdminPurchaseRequest(requestId);
            await fetchMarketplaceData();
        } catch (err) {
            alert(err.message || "Failed to delete request");
        } finally {
            setModerationAction(null);
        }
    };

    const renderMarketplaceModeration = () => {
        if (marketplaceLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                </div>
            );
        }

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Active Listings Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Active Marketplace Listings</h2>
                            <p className="text-xs text-slate-500 mt-1">Global view of all fish currently listed for sale.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Farm / Seller</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Species</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Quantity</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Price/Unit</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketplaceListings.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500">
                                            No active listings on the marketplace.
                                        </td>
                                    </tr>
                                ) : (
                                    marketplaceListings.map((listing) => (
                                        <tr key={listing.StockId} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{listing.FarmName || 'Unnamed Farm'}</span>
                                                    <span className="text-xs text-slate-500">{listing.FarmerName}</span>
                                                    <span className="text-[10px] text-slate-400">{listing.FarmerEmail}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                    {listing.SpeciesName}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-slate-900">
                                                {listing.QuantityForSale?.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-right font-medium text-emerald-600">
                                                PKR {listing.SalePricePerUnit?.toLocaleString() || '0'}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleRemoveListing(listing.StockId)}
                                                    disabled={moderationAction === `listing-${listing.StockId}`}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {moderationAction === `listing-${listing.StockId}` ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Purchase Requests Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Global Purchase Requests</h2>
                            <p className="text-xs text-slate-500 mt-1">All buyer requests sent to farmers across the platform.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Date</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Consumer</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Target Farm</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Request Details</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Status</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            No purchase requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    purchaseRequests.map((req) => (
                                        <tr key={req.RequestId} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="py-4 px-6">
                                                <span className="text-xs font-medium text-slate-700">
                                                    {new Date(req.CreatedAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{req.ConsumerName}</span>
                                                    <span className="text-[10px] text-slate-400">{req.ConsumerEmail}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{req.FarmName || 'Unnamed Farm'}</span>
                                                    <span className="text-[10px] text-slate-400">{req.FarmerName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{req.RequestedQuantity?.toLocaleString()}x {req.SpeciesName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${req.Status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                                    req.Status === 'Replied' ? 'bg-blue-50 text-blue-600' :
                                                        req.Status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                                            'bg-red-50 text-red-600'
                                                    }`}>
                                                    {req.Status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleDeleteRequest(req.RequestId)}
                                                    disabled={moderationAction === `request-${req.RequestId}`}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {moderationAction === `request-${req.RequestId}` ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const handleDiseaseSubmit = async () => {
        if (!diseaseForm.name || !diseaseForm.category) {
            alert("Disease name and category are required.");
            return;
        }
        setDiseaseAction('saving');
        try {
            if (editingDisease) {
                await farmApi.updateAdminDisease(editingDisease.DiseaseId, diseaseForm);
            } else {
                await farmApi.addAdminDisease(diseaseForm);
            }
            setDiseaseFormOpen(false);
            setEditingDisease(null);
            setDiseaseForm(emptyDiseaseForm);
            await fetchDiseases();
        } catch (err) {
            alert(err.message || "Failed to save disease");
        } finally {
            setDiseaseAction(null);
        }
    };

    const handleDiseaseEdit = (disease) => {
        setEditingDisease(disease);
        setDiseaseForm({
            name: disease.DiseaseName,
            category: disease.Category,
            symptoms: disease.Symptoms || '',
            species: disease.AffectedSpecies || '',
            treatment: disease.RecommendedTreatment || '',
            prevention: disease.PreventionTips || '',
            severity: disease.Severity || 'Moderate'
        });
        setDiseaseFormOpen(true);
    };

    const handleDiseaseToggle = async (diseaseId) => {
        setDiseaseAction(`toggle-${diseaseId}`);
        try {
            await farmApi.toggleAdminDiseaseStatus(diseaseId);
            await fetchDiseases();
        } catch (err) {
            alert(err.message || "Failed to toggle disease status");
        } finally {
            setDiseaseAction(null);
        }
    };

    const renderDiseaseCatalog = () => {
        if (diseasesLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                </div>
            );
        }

        const severityColor = (s) => {
            if (s === 'Severe') return 'bg-red-50 text-red-600';
            if (s === 'Moderate') return 'bg-amber-50 text-amber-600';
            return 'bg-emerald-50 text-emerald-600';
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <DiseaseModal
                    isOpen={diseaseFormOpen}
                    onClose={() => setDiseaseFormOpen(false)}
                    editingDisease={editingDisease}
                    diseaseForm={diseaseForm}
                    setDiseaseForm={setDiseaseForm}
                    handleDiseaseSubmit={handleDiseaseSubmit}
                    diseaseAction={diseaseAction}
                    emptyDiseaseForm={emptyDiseaseForm}
                />

                {/* Disease Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Disease Catalog</h2>
                            <p className="text-xs text-slate-500 mt-1">{adminDiseases.length} diseases registered.</p>
                        </div>
                        <button onClick={() => { setEditingDisease(null); setDiseaseForm(emptyDiseaseForm); setDiseaseFormOpen(true); }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors">
                            <Plus size={16} /> Add Disease
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Disease Name</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Category</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Severity</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Affected Species</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Status</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminDiseases.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            No diseases in the catalog. Add one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    adminDiseases.map((d) => (
                                        <tr key={d.DiseaseId} className={`border-b border-gray-100 hover:bg-gray-50/50 ${!d.IsActive ? 'opacity-50' : ''}`}>
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-slate-900">{d.DiseaseName}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                                    {d.Category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${severityColor(d.Severity)}`}>
                                                    {d.Severity}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-600 max-w-[200px] truncate">
                                                {d.AffectedSpecies || '—'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${d.IsActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {d.IsActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleDiseaseEdit(d)}
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDiseaseToggle(d.DiseaseId)}
                                                        disabled={diseaseAction === `toggle-${d.DiseaseId}`}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${d.IsActive
                                                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                                            }`}>
                                                        {diseaseAction === `toggle-${d.DiseaseId}` ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : d.IsActive ? (
                                                            <Ban size={14} />
                                                        ) : (
                                                            <CheckCircle2 size={14} />
                                                        )}
                                                        {d.IsActive ? 'Deactivate' : 'Reactivate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const handleTicketReply = async (ticketId) => {
        if (!ticketReply.trim()) {
            alert("Please enter a reply message.");
            return;
        }
        setTicketAction(`reply-${ticketId}`);
        try {
            await farmApi.replyToTicket(ticketId, ticketReply);
            setReplyingTicket(null);
            setTicketReply('');
            await fetchTickets();
        } catch (err) {
            alert(err.message || "Failed to reply");
        } finally {
            setTicketAction(null);
        }
    };

    const handleTicketClose = async (ticketId) => {
        if (!confirm("Close this ticket?")) return;
        setTicketAction(`close-${ticketId}`);
        try {
            await farmApi.closeTicket(ticketId);
            await fetchTickets();
        } catch (err) {
            alert(err.message || "Failed to close ticket");
        } finally {
            setTicketAction(null);
        }
    };

    const renderSupportTickets = () => {
        if (ticketsLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                </div>
            );
        }

        const statusColor = (s) => {
            if (s === 'Open') return 'bg-amber-50 text-amber-600';
            if (s === 'Responded') return 'bg-blue-50 text-blue-600';
            return 'bg-emerald-50 text-emerald-600';
        };

        const openCount = adminTickets.filter(t => t.Status === 'Open').length;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <TicketReplyModal
                    replyingTicket={replyingTicket}
                    setReplyingTicket={setReplyingTicket}
                    ticketReply={ticketReply}
                    setTicketReply={setTicketReply}
                    handleTicketReply={handleTicketReply}
                    ticketAction={ticketAction}
                />

                {/* Summary Bar */}
                {openCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 font-black text-lg">
                            {openCount}
                        </div>
                        <p className="text-sm font-bold text-amber-700">
                            {openCount} ticket{openCount > 1 ? 's' : ''} awaiting your response.
                        </p>
                    </div>
                )}

                {/* Tickets Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Support Tickets</h2>
                        <p className="text-xs text-slate-500 mt-1">{adminTickets.length} total tickets.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Date</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">User</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Subject</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Category</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">Status</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            No support tickets yet.
                                        </td>
                                    </tr>
                                ) : (
                                    adminTickets.map((t) => (
                                        <tr key={t.TicketId} className={`border-b border-gray-100 hover:bg-gray-50/50 ${t.Status === 'Closed' ? 'opacity-50' : ''}`}>
                                            <td className="py-4 px-6">
                                                <span className="text-xs font-medium text-slate-700">
                                                    {new Date(t.CreatedAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{t.UserName}</span>
                                                    <span className="text-[10px] text-slate-400">{t.UserEmail}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-medium text-slate-900 text-sm">{t.Subject}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                                    {t.Category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusColor(t.Status)}`}>
                                                    {t.Status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {t.Status !== 'Closed' && (
                                                        <>
                                                            <button onClick={() => { setReplyingTicket(t); setTicketReply(t.AdminReply || ''); }}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                                                <Edit size={12} /> Reply
                                                            </button>
                                                            <button onClick={() => handleTicketClose(t.TicketId)}
                                                                disabled={ticketAction === `close-${t.TicketId}`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50">
                                                                {ticketAction === `close-${t.TicketId}` ? (
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 size={12} />
                                                                )}
                                                                Close
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const handleAnnouncementSubmit = async () => {
        if (!announcementForm.title || !announcementForm.message) {
            alert("Title and message are required.");
            return;
        }
        setAnnouncementAction('submitting');
        try {
            await farmApi.createAdminAnnouncement(announcementForm);
            setAnnouncementForm(emptyAnnouncementForm);
            setAnnouncementFormOpen(false);
            await fetchAnnouncements();
        } catch (err) {
            alert(err.message || "Failed to create announcement");
        } finally {
            setAnnouncementAction(null);
        }
    };

    const handleAnnouncementDelete = async (id) => {
        if (!confirm("Delete this announcement?")) return;
        setAnnouncementAction(`delete-${id}`);
        try {
            await farmApi.deleteAdminAnnouncement(id);
            await fetchAnnouncements();
        } catch (err) {
            alert(err.message || "Failed to delete announcement");
        } finally {
            setAnnouncementAction(null);
        }
    };

    const renderAnnouncements = () => {
        if (announcementsLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                </div>
            );
        }

        const typeColor = (type) => {
            if (type === 'Warning') return 'bg-amber-100 text-amber-700';
            if (type === 'Alert') return 'bg-red-100 text-red-700';
            return 'bg-blue-100 text-blue-700';
        };

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">System Announcements</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage global notifications sent to all farmers.</p>
                    </div>
                    <button onClick={() => setAnnouncementFormOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                        <Plus size={16} /> New Announcement
                    </button>
                </div>

                {/* Create Modal */}
                <AnnouncementModal
                    isOpen={announcementFormOpen}
                    onClose={() => setAnnouncementFormOpen(false)}
                    announcementForm={announcementForm}
                    setAnnouncementForm={setAnnouncementForm}
                    handleAnnouncementSubmit={handleAnnouncementSubmit}
                    announcementAction={announcementAction}
                />

                {/* List */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {adminAnnouncements.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No announcements posted.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {adminAnnouncements.map((a) => (
                                <div key={a.Id} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                                    <div className={`mt-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${typeColor(a.Type)}`}>
                                        {a.Type}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900">{a.Title}</h3>
                                        <p className="text-sm text-slate-600 mt-1">{a.Message}</p>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-3 tracking-wider">
                                            Posted by {a.CreatorName || 'Admin'} • {new Date(a.CreatedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <button onClick={() => handleAnnouncementDelete(a.Id)} disabled={announcementAction === `delete-${a.Id}`}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50">
                                        {announcementAction === `delete-${a.Id}` ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ====== RULES MANAGEMENT HANDLERS ======
    const handleFeedRuleSubmit = async () => {
        if (!feedRuleForm.speciesId || !feedRuleForm.feedType) { alert("Species and Feed Type required."); return; }
        setRuleAction('submitting');
        try {
            if (editingFeedRule) {
                await farmApi.updateFeedRule(editingFeedRule.RuleId, feedRuleForm);
            } else {
                await farmApi.createFeedRule(feedRuleForm);
            }
            setFeedRuleForm(emptyFeedRuleForm); setFeedRuleModalOpen(false); setEditingFeedRule(null);
            await fetchRulesData();
        } catch (err) { alert(err.message || "Failed"); } finally { setRuleAction(null); }
    };
    const handleFeedRuleEdit = (r) => {
        setEditingFeedRule(r);
        setFeedRuleForm({ speciesId: r.SpeciesID, stage: r.Stage, minSize: r.MinSize_inch, maxSize: r.MaxSize_inch, dailyRate: r.DailyRate_Percent, conditionFactor: r.ConditionFactor_K, feedType: r.FeedType, frequency: r.Frequency });
        setFeedRuleModalOpen(true);
    };
    const handleFeedRuleDelete = async (id) => {
        if (!confirm("Delete this feed rule?")) return;
        setRuleAction(`del-feed-${id}`);
        try { await farmApi.deleteFeedRule(id); await fetchRulesData(); } catch (err) { alert(err.message); } finally { setRuleAction(null); }
    };
    const handleFertRuleSubmit = async () => {
        if (!fertRuleForm.cultivationType || !fertRuleForm.pondType) { alert("Cultivation Type and Pond Type required."); return; }
        setRuleAction('submitting-fert');
        try {
            if (editingFertRule) { await farmApi.updateFertilizerRule(editingFertRule.RecId, fertRuleForm); }
            else { await farmApi.createFertilizerRule(fertRuleForm); }
            setFertRuleForm(emptyFertRuleForm); setFertRuleModalOpen(false); setEditingFertRule(null);
            await fetchRulesData();
        } catch (err) { alert(err.message || "Failed"); } finally { setRuleAction(null); }
    };
    const handleFertRuleEdit = (r) => {
        setEditingFertRule(r);
        setFertRuleForm({ cultivationType: r.CultivationType, pondType: r.PondType, orgProduct: r.Org_Product, orgDosage: r.Org_Dosage_kg_Acre, orgRate: r.Org_Rate_PKR, orgFrequency: r.Org_Frequency, orgBenefits: r.Org_Benefits, inorgProduct: r.Inorg_Product, inorgDosage: r.Inorg_Dosage_kg_Acre, inorgRate: r.Inorg_Rate_PKR, inorgFrequency: r.Inorg_Frequency, inorgBenefits: r.Inorg_Benefits, limeProduct: r.Lime_Product, limeDosage: r.Lime_Dosage_kg_Acre, limeRate: r.Lime_Rate_PKR, limeFrequency: r.Lime_Frequency, limeBenefits: r.Lime_Benefits });
        setFertRuleModalOpen(true);
    };
    const handleFertRuleDelete = async (id) => {
        if (!confirm("Delete this fertilizer rule?")) return;
        setRuleAction(`del-fert-${id}`);
        try { await farmApi.deleteFertilizerRule(id); await fetchRulesData(); } catch (err) { alert(err.message); } finally { setRuleAction(null); }
    };

    const handleStockingRuleSubmit = async () => {
        if (!stockingRuleForm.Stage || !stockingRuleForm.CultivationType || !stockingRuleForm.CultureType) { alert("Required fields missing."); return; }
        setRuleAction('submitting-stocking');
        try {
            if (editingStockingRule) { await farmApi.updateAdminStockingRule(editingStockingRule.RuleId, stockingRuleForm); }
            else { await farmApi.createAdminStockingRule(stockingRuleForm); }
            setStockingRuleForm(emptyStockingRuleForm); setStockingRuleModalOpen(false); setEditingStockingRule(null);
            await fetchRulesData();
        } catch (err) { alert(err.message || "Failed"); } finally { setRuleAction(null); }
    };

    const handleStockingRuleEdit = (r) => {
        setEditingStockingRule(r);
        setStockingRuleForm({ Stage: r.Stage, CultivationType: r.CultivationType, CultureType: r.CultureType, MinFishPerAcre: r.MinFishPerAcre, MaxFishPerAcre: r.MaxFishPerAcre, MaxSpeciesAllowed: r.MaxSpeciesAllowed });
        setStockingRuleModalOpen(true);
    };

    const handleStockingRuleDelete = async (id) => {
        if (!confirm("Delete this stocking rule?")) return;
        setRuleAction(`del-stocking-${id}`);
        try { await farmApi.deleteAdminStockingRule(id); await fetchRulesData(); } catch (err) { alert(err.message); } finally { setRuleAction(null); }
    };

    const handleCompSubmit = async () => {
        if (!compForm.speciesId || !compForm.compatibleWithId || !compForm.reason) { alert("All fields are required."); return; }
        if (compForm.speciesId === compForm.compatibleWithId) { alert("Species cannot be compatible with itself."); return; }
        setRuleAction('submitting-comp');
        try {
            await farmApi.createAdminCompatibility(compForm);
            setCompForm(emptyCompForm); setCompModalOpen(false);
            await fetchRulesData();
        } catch (err) { alert(err.message || "Failed to add compatibility."); } finally { setRuleAction(null); }
    };

    const handleCompDelete = async (id) => {
        if (!confirm("Delete this compatibility rule?")) return;
        setRuleAction(`del-comp-${id}`);
        try { await farmApi.deleteAdminCompatibility(id); await fetchRulesData(); } catch (err) { alert(err.message); } finally { setRuleAction(null); }
    };

    const renderRulesManagement = () => {
        if (rulesLoading) return (<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div></div>);

        const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
        const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header + Sub-tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Rules Management</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage feed guidelines and fertilizer recommendations.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setRulesSubTab('feed')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${rulesSubTab === 'feed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Feed Rules</button>
                        <button onClick={() => setRulesSubTab('fertilizer')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${rulesSubTab === 'fertilizer' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Fertilizer Rules</button>
                        <button onClick={() => setRulesSubTab('stocking')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${rulesSubTab === 'stocking' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Stocking Densities</button>
                        <button onClick={() => setRulesSubTab('compatibility')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${rulesSubTab === 'compatibility' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Species Compatibility</button>
                    </div>
                </div>

                {/* ===== FEED RULES TAB ===== */}
                {rulesSubTab === 'feed' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => { setEditingFeedRule(null); setFeedRuleForm(emptyFeedRuleForm); setFeedRuleModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"><Plus size={16} /> Add Feed Rule</button>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr><th className="px-4 py-3">Species</th><th className="px-4 py-3">Stage</th><th className="px-4 py-3">Size Range</th><th className="px-4 py-3">Daily Rate</th><th className="px-4 py-3">Feed Type</th><th className="px-4 py-3">Frequency</th><th className="px-4 py-3 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {feedRules.length === 0 ? (<tr><td colSpan={7} className="p-8 text-center text-slate-400">No feed rules found.</td></tr>) : feedRules.map(r => (
                                            <tr key={r.RuleId} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">{r.SpeciesName || `ID: ${r.SpeciesID}`}</td>
                                                <td className="px-4 py-3">{r.Stage}</td>
                                                <td className="px-4 py-3">{r.MinSize_inch}-{r.MaxSize_inch} in</td>
                                                <td className="px-4 py-3 font-bold text-blue-600">{r.DailyRate_Percent}%</td>
                                                <td className="px-4 py-3">{r.FeedType}</td>
                                                <td className="px-4 py-3">{r.Frequency}</td>
                                                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                                                    <button onClick={() => handleFeedRuleEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                                                    <button onClick={() => handleFeedRuleDelete(r.RuleId)} disabled={ruleAction === `del-feed-${r.RuleId}`} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                                                        {ruleAction === `del-feed-${r.RuleId}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <FeedRuleModal
                            isOpen={feedRuleModalOpen}
                            onClose={() => { setFeedRuleModalOpen(false); setEditingFeedRule(null); }}
                            editingFeedRule={editingFeedRule}
                            feedRuleForm={feedRuleForm}
                            setFeedRuleForm={setFeedRuleForm}
                            approvedSpecies={approvedSpecies}
                            handleFeedRuleSubmit={handleFeedRuleSubmit}
                            ruleAction={ruleAction}
                        />
                    </div>
                )}

                {/* ===== FERTILIZER RULES TAB ===== */}
                {rulesSubTab === 'fertilizer' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => { setEditingFertRule(null); setFertRuleForm(emptyFertRuleForm); setFertRuleModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"><Plus size={16} /> Add Fertilizer Rule</button>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr><th className="px-4 py-3">Cultivation</th><th className="px-4 py-3">Pond Type</th><th className="px-4 py-3">Organic</th><th className="px-4 py-3">Inorganic</th><th className="px-4 py-3">Lime</th><th className="px-4 py-3 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {fertilizerRules.length === 0 ? (<tr><td colSpan={6} className="p-8 text-center text-slate-400">No fertilizer rules found.</td></tr>) : fertilizerRules.map(r => (
                                            <tr key={r.RecId} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">{r.CultivationType}</td>
                                                <td className="px-4 py-3">{r.PondType}</td>
                                                <td className="px-4 py-3"><span className="text-xs">{r.Org_Product}</span><br /><span className="text-[10px] text-slate-400">{r.Org_Dosage_kg_Acre} kg/acre</span></td>
                                                <td className="px-4 py-3"><span className="text-xs">{r.Inorg_Product}</span><br /><span className="text-[10px] text-slate-400">{r.Inorg_Dosage_kg_Acre} kg/acre</span></td>
                                                <td className="px-4 py-3"><span className="text-xs">{r.Lime_Product}</span><br /><span className="text-[10px] text-slate-400">{r.Lime_Dosage_kg_Acre} kg/acre</span></td>
                                                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                                                    <button onClick={() => handleFertRuleEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                                                    <button onClick={() => handleFertRuleDelete(r.RecId)} disabled={ruleAction === `del-fert-${r.RecId}`} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                                                        {ruleAction === `del-fert-${r.RecId}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <FertilizerRuleModal
                            isOpen={fertRuleModalOpen}
                            onClose={() => { setFertRuleModalOpen(false); setEditingFertRule(null); }}
                            editingFertRule={editingFertRule}
                            fertRuleForm={fertRuleForm}
                            setFertRuleForm={setFertRuleForm}
                            handleFertRuleSubmit={handleFertRuleSubmit}
                            ruleAction={ruleAction}
                        />
                    </div>
                )}

                {/* ===== STOCKING RULES TAB ===== */}
                {rulesSubTab === 'stocking' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => { setEditingStockingRule(null); setStockingRuleForm(emptyStockingRuleForm); setStockingRuleModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors"><Plus size={16} /> Add Stocking Rule</button>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr><th className="px-4 py-3">Stage</th><th className="px-4 py-3">Cultivation Type</th><th className="px-4 py-3">Culture Type</th><th className="px-4 py-3">Fish/Acre</th><th className="px-4 py-3">Max Species</th><th className="px-4 py-3 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {stockingRules.length === 0 ? (<tr><td colSpan={6} className="p-8 text-center text-slate-400">No stocking rules found.</td></tr>) : stockingRules.map(r => (
                                            <tr key={r.RuleId} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">{r.Stage}</td>
                                                <td className="px-4 py-3 text-slate-600">{r.CultivationType}</td>
                                                <td className="px-4 py-3 text-slate-600">{r.CultureType}</td>
                                                <td className="px-4 py-3 font-bold text-amber-600">{Number(r.MinFishPerAcre).toLocaleString()} - {Number(r.MaxFishPerAcre).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-slate-600">{r.MaxSpeciesAllowed}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleStockingRuleEdit(r)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Edit size={14} /></button>
                                                        <button onClick={() => handleStockingRuleDelete(r.RuleId)} disabled={ruleAction === `del-stocking-${r.RuleId}`} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                                                            {ruleAction === `del-stocking-${r.RuleId}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <StockingRuleModal
                            isOpen={stockingRuleModalOpen}
                            onClose={() => { setStockingRuleModalOpen(false); setEditingStockingRule(null); }}
                            editingStockingRule={editingStockingRule}
                            stockingRuleForm={stockingRuleForm}
                            setStockingRuleForm={setStockingRuleForm}
                            handleStockingRuleSubmit={handleStockingRuleSubmit}
                            ruleAction={ruleAction}
                        />
                    </div>
                )}

                {/* ===== COMPATIBILITY RULES TAB ===== */}
                {rulesSubTab === 'compatibility' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => { setCompForm(emptyCompForm); setCompModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"><Plus size={16} /> Add Compatibility Rule</button>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr><th className="px-4 py-3">Species</th><th className="px-4 py-3">Compatible With</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {compatibilities.length === 0 ? (<tr><td colSpan={4} className="p-8 text-center text-slate-400">No compatibility rules found.</td></tr>) : compatibilities.map(c => (
                                            <tr key={c.CompatibilityId} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-900">{c.MainSpeciesName}</td>
                                                <td className="px-4 py-3 font-bold text-slate-900">{c.CompatibleSpeciesName}</td>
                                                <td className="px-4 py-3 text-slate-600 italic">{c.CompatibilityReason}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleCompDelete(c.CompatibilityId)} disabled={ruleAction === `del-comp-${c.CompatibilityId}`} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                                                        {ruleAction === `del-comp-${c.CompatibilityId}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <CompatibilityModal
                            isOpen={compModalOpen}
                            onClose={() => setCompModalOpen(false)}
                            compForm={compForm}
                            setCompForm={setCompForm}
                            approvedSpecies={approvedSpecies}
                            handleCompSubmit={handleCompSubmit}
                            ruleAction={ruleAction}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] text-slate-900 px-4 sm:px-8 py-10 lg:py-12 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 lg:pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-5 sm:gap-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center text-white shrink-0">
                            <ShieldCheck size={28} className="text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">System Admin</h1>
                            <p className="text-slate-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mt-1 shrink-0">
                                Global Control Dashboard
                            </p>
                        </div>
                    </div>

                    {/* Stats Badges */}
                    <div className="flex gap-4">
                        <div className="bg-white border border-slate-100 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-sm flex flex-col items-center min-w-[90px] sm:min-w-[100px]">
                            <span className="text-xl sm:text-2xl font-black text-amber-600">{pendingSpecies.length}</span>
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                        </div>
                        <div className="bg-white border border-slate-100 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-sm flex flex-col items-center min-w-[90px] sm:min-w-[100px]">
                            <span className="text-xl sm:text-2xl font-black text-slate-900">{totalApproved}</span>
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Species</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div>
                    {activeTab === 'approvals' && renderApprovals()}
                    {activeTab === 'species' && renderAllSpecies()}
                    {activeTab === 'farms' && renderFarmOverview()}
                    {activeTab === 'marketplace' && renderMarketplaceModeration()}
                    {activeTab === 'diseases' && renderDiseaseCatalog()}
                    {activeTab === 'tickets' && renderSupportTickets()}
                    {activeTab === 'announcements' && renderAnnouncements()}
                    {activeTab === 'rules' && renderRulesManagement()}
                    {activeTab === 'knowledge' && renderKnowledgeManager()}
                    {activeTab === 'users' && renderUserManagement()}
                </div>

                <EditPendingSpeciesModal
                    isOpen={!!editingSpecies}
                    species={editingSpecies}
                    isApprovedMode={editingSpecies?._isApprovedMode}
                    onClose={() => setEditingSpecies(null)}
                    onApprove={async (id, data) => {
                        await farmApi.approveSpecies(id, data);
                        setEditingSpecies(null);
                        fetchData();
                    }}
                />

                <AddSpeciesModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={async (data) => {
                        await farmApi.addCustomSpecies(data);
                        fetchData();
                    }}
                />

            </div>
        </div>
    );
}
