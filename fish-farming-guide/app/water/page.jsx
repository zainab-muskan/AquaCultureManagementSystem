"use client";

import {
    Droplets,
    ArrowDownCircle,
    ArrowUpCircle,
    Filter,
    ShieldCheck,
    CheckCircle2,
    Info
} from "lucide-react";

export default function WaterQualityPage() {
    return (
        <div className="min-h-screen bg-white p-4 sm:p-10 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-8 sm:space-y-12">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-[24px] sm:text-[28px] font-black text-gray-900 tracking-tight">Water Cycling Management</h1>
                    <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium tracking-tight">Simple process for maintaining water quality</p>
                </div>

                {/* Method Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Method 1: Fresh Water Addition */}
                    <div className="bg-[#EEF2FF] rounded-[20px] sm:rounded-[32px] border border-[#C7D2FE] p-1 shadow-sm flex flex-col">
                        <div className="pt-6 sm:pt-8 px-5 sm:px-10 pb-6 space-y-6 sm:space-y-8 flex-1">
                            {/* Method Title */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <Droplets size={20} className="stroke-[2.5px]" />
                                        <h2 className="text-lg font-bold">Method 1: Fresh Water</h2>
                                    </div>
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                                        Tubewell / Canal
                                    </span>
                                </div>
                                <p className="text-[14px] text-blue-700/70 font-bold leading-snug">Adding fresh water from tubewell or canal to maintain water quality</p>
                            </div>

                            {/* Processes */}
                            <div className="bg-white rounded-[24px] border border-blue-100 p-6 sm:p-8 space-y-8">
                                {/* Step 1 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <ArrowDownCircle size={20} className="stroke-[2.5px]" />
                                        <h3 className="text-[15px] font-black text-gray-900">Step 1: Inlet Process</h3>
                                    </div>
                                    <ul className="space-y-2.5 ml-1">
                                        {[
                                            "Open inlet gate/valve",
                                            "Pump fresh water from tubewell or canal",
                                            "Add water slowly to avoid disturbing fish",
                                            "Fill until desired water level reached",
                                            "Typical rate: 2-4 hours for 10-20% replacement"
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[13px] text-gray-500 font-bold leading-relaxed">
                                                <span className="text-blue-500 mt-1.5">•</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Step 2 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-blue-600">
                                        <ArrowUpCircle size={20} className="stroke-[2.5px]" />
                                        <h3 className="text-[15px] font-black text-gray-900">Step 2: Outlet Process</h3>
                                    </div>
                                    <ul className="space-y-2.5 ml-1">
                                        {[
                                            "Open outlet gate at bottom of pond",
                                            "Drain old water (usually 10-30% of total)",
                                            "Use mesh/net to prevent fish escape",
                                            "Drain to irrigation channel or drainage area",
                                            "Close outlet gate when target reached"
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[13px] text-gray-500 font-bold leading-relaxed">
                                                <span className="text-blue-500 mt-1.5">•</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* When to use */}
                            <div className="bg-[#E0E7FF] rounded-[20px] border border-blue-200/50 p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-2.5 text-blue-700">
                                    <Info size={16} className="stroke-[2.5px]" />
                                    <h4 className="text-[13px] font-black uppercase tracking-tight">When to Use</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        "High ammonia or nitrite levels",
                                        "Murky or dirty water",
                                        "After heavy feeding periods",
                                        "Weekly routine maintenance (10-15%)",
                                        "Emergency situations (low oxygen)"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-3 text-[13px] text-blue-800/80 font-bold">
                                            <CheckCircle2 size={15} className="text-blue-500/80" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Stats Grid */}
                        <div className="p-8 md:p-10 pt-4 grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-blue-100 p-5 text-center space-y-1 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frequency</p>
                                <p className="text-[16px] font-bold text-gray-800">Weekly</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-blue-100 p-5 text-center space-y-1 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cost (1 acre)</p>
                                <p className="text-[16px] font-bold text-gray-800">PKR 300-500</p>
                            </div>
                        </div>
                    </div>

                    {/* Method 2: Water Filtration */}
                    <div className="bg-[#F0FAF5] rounded-[20px] sm:rounded-[32px] border border-[#D1F0E0] p-1 shadow-sm flex flex-col">
                        <div className="pt-6 sm:pt-8 px-5 sm:px-10 pb-6 space-y-6 sm:space-y-8 flex-1">
                            {/* Method Title */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <Filter size={20} className="stroke-[2.5px]" />
                                        <h2 className="text-lg font-bold">Method 2: Filtration</h2>
                                    </div>
                                    <span className="bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                                        Recirculation
                                    </span>
                                </div>
                                <p className="text-[14px] text-emerald-700/70 font-bold leading-snug">Filtering and recirculating existing pond water using mechanical and biological filters</p>
                            </div>

                            {/* Processes */}
                            <div className="bg-white rounded-[24px] border border-emerald-100 p-6 sm:p-8 space-y-8">
                                {/* Step 1 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <ArrowUpCircle size={20} className="stroke-[2.5px]" />
                                        <h3 className="text-[15px] font-black text-gray-900">Step 1: Pump Water Out</h3>
                                    </div>
                                    <ul className="space-y-2.5 ml-1">
                                        {[
                                            "Use submersible pump or suction pump",
                                            "Pump water from pond into filter tank",
                                            "Flow rate: 1000-2000 liters/hour",
                                            "Use mesh filter to block solid waste",
                                            "Continuous operation during daylight"
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[13px] text-gray-500 font-bold leading-relaxed">
                                                <span className="text-emerald-500 mt-1.5">•</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Step 2 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <Filter size={20} className="stroke-[2.5px]" />
                                        <h3 className="text-[15px] font-black text-gray-900">Step 2: Filter Process</h3>
                                    </div>
                                    <ul className="space-y-2.5 ml-1">
                                        {[
                                            "Mechanical fiber removes solid waste",
                                            "Biological filter breaks down ammonia",
                                            "Sand/gravel filter for fine particles",
                                            "UV filter optional for disease control",
                                            "Clean filters weekly for efficiency"
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[13px] text-gray-500 font-bold leading-relaxed">
                                                <span className="text-emerald-500 mt-1.5">•</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Step 3 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <ArrowDownCircle size={20} className="stroke-[2.5px]" />
                                        <h3 className="text-[15px] font-black text-gray-900">Step 3: Return Clean Water</h3>
                                    </div>
                                    <ul className="space-y-2.5 ml-1">
                                        {[
                                            "Filtered water returns to pond",
                                            "Create waterfall effect for aeration",
                                            "Distribute water evenly across pond",
                                            "Continuous recirculation maintains quality",
                                            "No water wastage - eco-friendly"
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[13px] text-gray-500 font-bold leading-relaxed">
                                                <span className="text-emerald-500 mt-1.5">•</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* When to use */}
                            <div className="bg-[#DCF3E7] rounded-[20px] border border-emerald-200/50 p-6 sm:p-8 space-y-5">
                                <div className="flex items-center gap-2.5 text-emerald-700">
                                    <Info size={16} className="stroke-[2.5px]" />
                                    <h4 className="text-[13px] font-black uppercase tracking-tight">When to Use</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        "Limited fresh water availability",
                                        "High water costs in your area",
                                        "Intensive fish farming (high density)",
                                        "Year-round continuous operation",
                                        "Environmental sustainability required"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-3 text-[13px] text-emerald-800/80 font-bold">
                                            <CheckCircle2 size={15} className="text-emerald-500/80" />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Stats Grid */}
                        <div className="p-5 sm:p-10 pt-4 grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-emerald-100 p-5 text-center space-y-1 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Setup Cost</p>
                                <p className="text-[15px] sm:text-[16px] font-bold text-gray-800">PKR 50-80k</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-emerald-100 p-5 text-center space-y-1 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Electric</p>
                                <p className="text-[15px] sm:text-[16px] font-bold text-gray-800">PKR 2-4k</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Card View for Comparison */}
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                    {[
                        { factor: "Initial Cost", fresh: "Low (Pumps)", filtration: "High (System)" },
                        { factor: "Running Cost", fresh: "Medium", filtration: "Low" },
                        { factor: "Water Need", fresh: "High", filtration: "Minimal" },
                        { factor: "Maintenance", fresh: "Easy", filtration: "Medium" },
                    ].map((row, i) => (
                        <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                            <h4 className="text-[14px] font-black text-slate-900 border-b border-gray-50 pb-3">{row.factor}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Fresh Water</p>
                                    <p className="text-[14px] font-bold text-gray-700">{row.fresh}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Filtration</p>
                                    <p className="text-[14px] font-bold text-gray-700">{row.filtration}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex justify-between items-center mt-2">
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Recommended</p>
                            <span className="inline-block bg-[#2563EB] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">Beginners</span>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Advanced</p>
                            <span className="inline-block bg-[#10B981] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">High Density</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto -mx-6 px-6 scrollbar-hide">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="border-b border-gray-50">
                            <tr>
                                <th className="pb-6 text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest">Factor</th>
                                <th className="pb-6 text-[10px] sm:text-[11px] font-black text-blue-600 uppercase tracking-widest text-center">Fresh Water</th>
                                <th className="pb-6 text-[10px] sm:text-[11px] font-black text-emerald-600 uppercase tracking-widest text-center">Filtration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { factor: "Initial Cost", fresh: "Low (Pumps)", filtration: "High (System)" },
                                { factor: "Running Cost", fresh: "Medium", filtration: "Low" },
                                { factor: "Water Need", fresh: "High", filtration: "Minimal" },
                                { factor: "Maintenance", fresh: "Easy", filtration: "Medium" },
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td className="py-6 text-[13px] sm:text-[14px] font-bold text-gray-900">{row.factor}</td>
                                    <td className="py-6 text-[13px] sm:text-[14px] font-medium text-gray-500 text-center">{row.fresh}</td>
                                    <td className="py-6 text-[13px] sm:text-[14px] font-medium text-gray-500 text-center">{row.filtration}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="py-6 text-[13px] sm:text-[14px] font-bold text-gray-900">Recommended</td>
                                <td className="py-6 text-center">
                                    <span className="bg-[#2563EB] text-white text-[9px] sm:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">Beginners</span>
                                </td>
                                <td className="py-6 text-center">
                                    <span className="bg-[#10B981] text-white text-[9px] sm:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">Advanced</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Important Water Cycling Tips */}
            <div className="bg-[#FFF8F2] rounded-[24px] sm:rounded-[40px] border border-[#FFEDD5] p-6 sm:p-12 space-y-8 sm:space-y-10">
                <div className="flex items-center gap-3 text-orange-600">
                    <ShieldCheck size={20} className="stroke-[2.5px]" />
                    <h3 className="text-xl font-bold tracking-tight">Important Tips</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Column 1 */}
                    <div className="bg-white rounded-[20px] sm:rounded-[28px] border border-orange-100/50 p-6 sm:p-8 space-y-6">
                        <h4 className="text-[14px] sm:text-[15px] font-black text-gray-900 border-b border-gray-50 pb-4">Fresh Water Method:</h4>
                        <ul className="space-y-4">
                            {[
                                "Change max 30% at once",
                                "Match incoming temperature",
                                "Use dechlorinator if needed",
                                "Change in early morning (6-8 AM)"
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-[13px] text-gray-600 font-bold leading-relaxed">
                                    <span className="text-orange-400 mt-1">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Column 2 */}
                    <div className="bg-white rounded-[20px] sm:rounded-[28px] border border-orange-100/50 p-6 sm:p-8 space-y-6">
                        <h4 className="text-[14px] sm:text-[15px] font-black text-gray-900 border-b border-gray-50 pb-4">Filtration Method:</h4>
                        <ul className="space-y-4">
                            {[
                                "Clean mechanical filters (3-5 days)",
                                "Monthly bio-filter cleaning",
                                "Check pump operation daily",
                                "Monitor flow rate regularly"
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-[13px] text-gray-600 font-bold leading-relaxed">
                                    <span className="text-orange-400 mt-1">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        );}
