"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Image as ImageIcon } from "lucide-react";
import { farmApi } from "@/integration/farmApi"; // Assuming farmApi is exported from specific path

export default function AddSpeciesModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        Name: "",
        ImageUrl: "",
        MaxStockingDensity: "",
        CompatibleRegions: "", // Will be comma-separated string
        MinTemp: 25,
        MaxTemp: 32,
        MinPH: 6.5,
        MaxPH: 8.5,
        MinDO: 5.0,
        FingerlingSizeG: "",
        MarketSizeKG: "",
        HarvestTimeMonths: "",
        SurvivalRateLower: 75,
        SurvivalRateUpper: 85,
        MinMarketPrice: "",
        MaxMarketPrice: "",
        Description: "",
        Description: "",
        FeedingZone: "Surface",
        FingerlingFeedType: "",
        GrowOutFeedType: "",
    });

    const [regions, setRegions] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [allSpecies, setAllSpecies] = useState([]);
    const [selectedCompatibleSpeciesIds, setSelectedCompatibleSpeciesIds] = useState([]);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Fetch Regions and Species on Mount
    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoadingData(true);
                try {
                    const [regionsData, speciesData] = await Promise.all([
                        farmApi.getRegions(),
                        farmApi.getApprovedSpecies()
                    ]);
                    setRegions(regionsData || []);
                    setAllSpecies(speciesData || []);
                } catch (err) {
                    console.error("Failed to fetch custom species data:", err);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // Handle Checkbox Change for Regions
    const handleRegionChange = (regionName) => {
        setSelectedRegions(prev => {
            const isSelected = prev.includes(regionName);
            const newSelection = isSelected
                ? prev.filter(r => r !== regionName)
                : [...prev, regionName];

            // Update formData immediately
            setFormData(current => ({
                ...current,
                CompatibleRegions: newSelection.join(", ")
            }));

            return newSelection;
        });
    };

    // Handle Checkbox Change for Compatible Species
    const handleCompatibleSpeciesChange = (speciesId) => {
        setSelectedCompatibleSpeciesIds(prev => {
            const isSelected = prev.includes(speciesId);
            return isSelected
                ? prev.filter(id => id !== speciesId)
                : [...prev, speciesId];
        });
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (selectedRegions.length === 0) {
            setError("Please select at least one compatible region.");
            setLoading(false);
            return;
        }

        try {
            // Attach the compatibility array to the submission data
            const submissionData = {
                ...formData,
                CompatibleSpeciesIds: selectedCompatibleSpeciesIds
            };

            await onSubmit(submissionData);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to submit species");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex justify-between items-start px-8 pt-8 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Add Custom Fish Species</h2>
                        <p className="text-sm text-gray-500 mt-1">Add your own fish species with specific growth and environmental requirements.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                        {/* Row 1 */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Name *</label>
                            <input
                                required
                                name="Name"
                                value={formData.Name}
                                onChange={handleChange}
                                placeholder="e.g., Pangasius"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Temperature Range (°C) *</label>
                            <div className="flex items-center gap-2">
                                <input required type="number" name="MinTemp" value={formData.MinTemp} onChange={handleChange} placeholder="Min" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                                <span className="text-gray-400">-</span>
                                <input required type="number" name="MaxTemp" value={formData.MaxTemp} onChange={handleChange} placeholder="Max" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">pH Range *</label>
                            <div className="flex items-center gap-2">
                                <input required type="number" step="0.1" name="MinPH" value={formData.MinPH} onChange={handleChange} placeholder="6.5" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                                <span className="text-gray-400">-</span>
                                <input required type="number" step="0.1" name="MaxPH" value={formData.MaxPH} onChange={handleChange} placeholder="8.5" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Dissolved O₂ (mg/L) *</label>
                            <input required type="number" step="0.1" name="MinDO" value={formData.MinDO} onChange={handleChange} placeholder="e.g., 5+ mg/L" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                        </div>

                        {/* Row 3 */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Feeding Zone *</label>
                            <input required name="FeedingZone" value={formData.FeedingZone} onChange={handleChange} placeholder="e.g., Surface/Column" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Fingerling Size (grams) *</label>
                            <input required type="number" name="FingerlingSizeG" value={formData.FingerlingSizeG} onChange={handleChange} placeholder="e.g., 3" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                        </div>

                        {/* Row 4 */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Market Size (kg) *</label>
                            <input required type="number" step="0.1" name="MarketSizeKG" value={formData.MarketSizeKG} onChange={handleChange} placeholder="e.g., 0.8" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Harvest Time (months) *</label>
                            <input required type="number" name="HarvestTimeMonths" value={formData.HarvestTimeMonths} onChange={handleChange} placeholder="e.g., 10" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                        </div>

                        {/* Row 5 */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Survival Rate (%) *</label>
                            <div className="flex items-center gap-2">
                                <input required type="number" name="SurvivalRateLower" value={formData.SurvivalRateLower} onChange={handleChange} placeholder="75" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                                <span className="text-gray-400">-</span>
                                <input required type="number" name="SurvivalRateUpper" value={formData.SurvivalRateUpper} onChange={handleChange} placeholder="85" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Stocking Density (per acre) *</label>
                            <input required type="number" name="MaxStockingDensity" value={formData.MaxStockingDensity} onChange={handleChange} placeholder="e.g., 4000" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Best Regions *</label>

                            {loadingData ? (
                                <div className="text-sm text-gray-400 italic px-2">Loading data...</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {regions.map((region) => (
                                        <label key={region.RegionId} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRegions.includes(region.Name)}
                                                    onChange={() => handleRegionChange(region.Name)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                                />
                                            </div>
                                            <span className={`text-sm font-medium transition-colors ${selectedRegions.includes(region.Name) ? "text-blue-700" : "text-gray-900 group-hover:text-gray-800"}`}>
                                                {region.Name}
                                            </span>
                                        </label>
                                    ))}
                                    {regions.length === 0 && (
                                        <div className="text-sm text-gray-400 px-1">No regions available</div>
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-gray-400 px-1">Selected: {selectedRegions.length > 0 ? selectedRegions.join(", ") : "None"}</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Market Price (PKR/kg) *</label>
                            <div className="flex items-center gap-2">
                                <input required type="number" name="MinMarketPrice" value={formData.MinMarketPrice} onChange={handleChange} placeholder="Min" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                                <span className="text-gray-400">-</span>
                                <input required type="number" name="MaxMarketPrice" value={formData.MaxMarketPrice} onChange={handleChange} placeholder="Max" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300" />
                            </div>
                        </div>

                        {/* Compatible Species Grid */}
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-[13px] font-bold text-gray-700 ml-1 flex items-center gap-1">
                                Compatible Species <span className="text-gray-400 font-normal text-xs">(optional - select species that can be stocked together in polyculture)</span>
                            </label>

                            {loadingData ? (
                                <div className="text-sm text-gray-400 italic px-2">Loading species...</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {allSpecies.map((species) => (
                                        <label key={species.SpeciesId} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCompatibleSpeciesIds.includes(species.SpeciesId)}
                                                    onChange={() => handleCompatibleSpeciesChange(species.SpeciesId)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                                />
                                            </div>
                                            <span className={`text-sm font-medium transition-colors ${selectedCompatibleSpeciesIds.includes(species.SpeciesId) ? "text-blue-700" : "text-gray-900 group-hover:text-gray-800"}`}>
                                                {species.Name}
                                            </span>
                                        </label>
                                    ))}
                                    {allSpecies.length === 0 && (
                                        <div className="text-sm text-gray-400 px-1">No species available</div>
                                    )}
                                </div>
                            )}
                            <p className="text-xs text-gray-400 px-1">Selected: {selectedCompatibleSpeciesIds.length > 0 ? allSpecies.filter(s => selectedCompatibleSpeciesIds.includes(s.SpeciesId)).map(s => s.Name).join(", ") : "None"}</p>
                        </div>

                        {/* Feed Guidelines */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1 flex items-center gap-1">
                                Fingerling Feed Type <span className="text-gray-400 font-normal text-xs">(optional)</span>
                            </label>
                            <input
                                name="FingerlingFeedType"
                                value={formData.FingerlingFeedType}
                                onChange={handleChange}
                                placeholder="e.g., Powdered Starter (40% Protein)"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1 flex items-center gap-1">
                                Grow-out Feed Type <span className="text-gray-400 font-normal text-xs">(optional)</span>
                            </label>
                            <input
                                name="GrowOutFeedType"
                                value={formData.GrowOutFeedType}
                                onChange={handleChange}
                                placeholder="e.g., Sinking Pellets (30% Protein)"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>

                        {/* Image URL */}
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1 flex items-center gap-1">
                                Image URL <span className="text-gray-400 font-normal text-xs">(optional)</span>
                            </label>
                            <div className="relative">
                                <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="ImageUrl"
                                    value={formData.ImageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/fish-image.jpg"
                                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        {/* Characteristics / Description */}
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                            <label className="text-[13px] font-bold text-gray-700 ml-1">Characteristics *</label>
                            <textarea
                                required
                                name="Description"
                                value={formData.Description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="e.g., Fast growing, hardy, good for beginners"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Add Species"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


