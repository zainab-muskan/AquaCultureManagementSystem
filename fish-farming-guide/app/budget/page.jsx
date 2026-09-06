"use client";

import { useState, useEffect } from "react";
import { DollarSign, Calendar, TrendingUp, Package, Plus } from "lucide-react";
import { farmApi } from "@/integration/farmApi";
import Sidebar from "@/components/layout/Sidebar";
import AddExpenseModal from "@/components/layout/AddExpenseModal";

export default function BudgetExpensesPage() {
    const [stats, setStats] = useState({
        totalAllTime: 0,
        last30Days: 0,
        count30Days: 0,
        avgDaily: 0,
        highestCategory: "None",
        highestCategoryAmount: 0,
        categoryBreakdown: [],
        recentExpenses: []
    });
    const [pnl, setPnL] = useState({
        initialBudget: 0,
        totalExpenses: 0,
        totalRevenue: 0,
        netProfit: 0,
        remainingBudget: 0
    });
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState("");

    // Modal State
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [ponds, setPonds] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [dashboardData, pondsData, pnlData] = await Promise.all([
                farmApi.getBudgetDashboard(),
                farmApi.getPonds(),
                farmApi.getPnLSummary()
            ]);

            if (dashboardData) {
                setStats(dashboardData);
            }
            if (pondsData) {
                setPonds(pondsData);
            }
            if (pnlData) {
                setPnL(pnlData);
                setTempBudget(pnlData.initialBudget);
            }
        } catch (error) {
            console.error("Failed to fetch budget dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (expenseData) => {
        try {
            await farmApi.addExpense(expenseData);
            // Refresh dashboard data after adding
            fetchDashboardData();
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to add expense. Please try again.");
        }
    };

    const handleSaveBudget = async () => {
        try {
            await farmApi.updateBudget(Number(tempBudget));
            setIsEditingBudget(false);
            fetchDashboardData();
        } catch (error) {
            console.error("Error updating budget:", error);
            alert("Failed to update budget.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Farm Financials</h1>
                                <p className="text-sm text-gray-500 mt-1">Track your initial capital, native expenses, and harvest revenues.</p>
                            </div>
                            <button
                                onClick={() => setShowAddExpense(true)}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add Manual Expense
                            </button>
                        </div>

                        {/* Top Native P&L Metrics Container */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Budget Card */}
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 shadow-sm border border-indigo-200">
                                <div className="text-sm text-indigo-700 font-bold uppercase tracking-wider mb-2">Initial Farm Budget</div>
                                {isEditingBudget ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={tempBudget} 
                                            onChange={(e) => setTempBudget(e.target.value)}
                                            className="w-full px-2 py-1 rounded border border-indigo-300 text-sm focus:outline-none focus:border-indigo-500" 
                                        />
                                        <button onClick={handleSaveBudget} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-semibold">Save</button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center cursor-pointer group" onClick={() => setIsEditingBudget(true)}>
                                        <h2 className="text-2xl font-black text-indigo-900 group-hover:text-indigo-700 transition-colors">PKR {Number(pnl.initialBudget).toLocaleString()}</h2>
                                        <span className="text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit ✎</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Target P&L Output */}
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-sm border border-emerald-200">
                                <div className="text-sm text-emerald-700 font-bold uppercase tracking-wider mb-2">Harvest Revenue</div>
                                <h2 className="text-2xl font-black text-emerald-900">PKR {Number(pnl.totalRevenue).toLocaleString()}</h2>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-sm border border-red-200">
                                <div className="text-sm text-red-700 font-bold uppercase tracking-wider mb-2">Total Expenses</div>
                                <h2 className="text-2xl font-black text-red-900">PKR {Number(pnl.totalExpenses).toLocaleString()}</h2>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-sm border border-blue-200">
                                <div className="text-sm text-blue-700 font-bold uppercase tracking-wider mb-2">Net Profit (Loss)</div>
                                <h2 className={`text-2xl font-black ${pnl.netProfit >= 0 ? "text-blue-900" : "text-red-600"}`}>
                                    {pnl.netProfit >= 0 ? "+" : ""}PKR {Number(pnl.netProfit).toLocaleString()}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Last 30 Days (Expenses)</p>
                                    <h2 className="text-2xl font-bold text-gray-900">PKR {Number(stats.last30Days).toLocaleString()}</h2>
                                    <p className="text-[11px] text-gray-400 mt-1">{stats.count30Days} transactions</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700">
                                    <Calendar size={24} />
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">Remaining Budget</p>
                                    <h2 className="text-2xl font-bold text-gray-900">PKR {Number(pnl.remainingBudget).toLocaleString()}</h2>
                                    <p className="text-[11px] text-gray-400 mt-1">Initial - Expenses + Revenue</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700">
                                    <DollarSign size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Expense Breakdown Category Block */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h3 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                                    <Package size={18} className="text-gray-400" />
                                    Expense Breakdown by Category
                                </h3>
                            </div>
                            <div className="p-6">
                                {stats.categoryBreakdown.length > 0 ? (
                                    <div className="space-y-5">
                                        {stats.categoryBreakdown.map((cat, idx) => (
                                            <div key={idx} className="relative">
                                                <div className="flex justify-between items-end mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-10 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat.category.substring(0, 5)}</span>
                                                        <span className="text-sm font-medium text-gray-900 capitalize">{cat.category}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[13px] font-bold text-gray-900">PKR {Number(cat.amount).toLocaleString()}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">{cat.percentage}%</div>
                                                    </div>
                                                </div>
                                                {/* Progress Bar Background */}
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    {/* Progress Fill */}
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${cat.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-sm text-gray-500">No category breakdown available.</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Expenses List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-400" />
                                    Recent Expenses
                                </h3>
                                <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">All Categories ▾</span>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {stats.recentExpenses.length > 0 ? (
                                    stats.recentExpenses.map(expense => (
                                        <div key={expense.ExpenseId} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 flex-shrink-0 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    {expense.Category.substring(0, 5)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 capitalize">{expense.Category}</h4>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                                                        <span className="truncate max-w-[120px] sm:max-w-[200px]">{expense.PondName}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span>{new Date(expense.ExpenseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    {expense.Description && (
                                                        <p className="text-[12px] text-gray-500 mt-1 max-w-[200px] sm:max-w-md truncate">{expense.Description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-right text-gray-900 sm:w-auto">
                                                PKR {Number(expense.Amount).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-sm text-gray-500">No recent expenses found.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddExpenseModal
                isOpen={showAddExpense}
                onClose={() => setShowAddExpense(false)}
                ponds={ponds}
                onAdd={handleAddExpense}
            />

        </div>
    );
}
