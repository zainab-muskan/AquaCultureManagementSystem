"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, Plus, Sparkles, Droplets, Ruler, Leaf, RefreshCw } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function SmartTodoList() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await farmApi.getTasks();
            setTasks(data || []);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            setAdding(true);
            await farmApi.addTask(newTask);
            setNewTask("");
            fetchTasks();
        } catch (err) {
            console.error("Failed to add task:", err);
        } finally {
            setAdding(false);
        }
    };

    const handleCompleteTask = async (taskId, isAuto) => {
        if (isAuto) {
            alert("This is an AI-generated task based on farm data. To clear this task, you must actually log the requested action (e.g., Update size, Log Water Quality) in the Dashboard!");
            return;
        }

        try {
            await farmApi.completeTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("Failed to complete task:", err);
        }
    };

    const getTaskIcon = (task) => {
        if (!task.isAuto) return null;
        
        if (task.category === 'Growth') return <Ruler size={14} className="text-blue-500" />;
        if (task.category === 'Water') return <Droplets size={14} className="text-cyan-500" />;
        if (task.category === 'Fertilizer') return <Leaf size={14} className="text-emerald-500" />;
        return <Sparkles size={14} className="text-purple-500" />; // Fallback AI icon
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl h-full flex flex-col border border-gray-200">
            {/* Header */}
            <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center flex-shrink-0">
                <h3 className="font-extrabold text-indigo-900 flex items-center gap-2.5 text-lg">
                    <CheckCircle size={22} className="text-indigo-600" />
                    Daily Action Plan
                </h3>
                <button 
                    onClick={fetchTasks}
                    className="p-2 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors"
                    title="Refresh Tasks"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-b border-gray-100 flex-shrink-0">
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        disabled={adding}
                        className="flex-1 text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newTask.trim() || adding}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold text-sm flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </form>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                {loading && tasks.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-indigo-400 space-y-3">
                        <RefreshCw size={28} className="animate-spin" />
                        <span className="text-sm font-semibold">Syncing tasks...</span>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-70">
                        <CheckCircle size={40} className="text-gray-300 mb-2" />
                        <h4 className="text-gray-600 font-bold text-base">You're all caught up!</h4>
                        <p className="text-gray-400 text-sm">No pending tasks for today.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`flex items-start gap-3 p-4 rounded-xl border ${
                                    task.isAuto 
                                    ? 'bg-indigo-50/30 border-indigo-100' 
                                    : 'bg-white border-gray-200'
                                } shadow-sm hover:shadow-md transition-shadow`}
                            >
                                <button 
                                    onClick={() => handleCompleteTask(task.id, task.isAuto)}
                                    className={`mt-0.5 flex-shrink-0 transition-transform active:scale-90 ${
                                        task.isAuto 
                                        ? 'text-indigo-400 hover:text-indigo-600 cursor-help' 
                                        : 'text-gray-300 hover:text-emerald-500'
                                    }`}
                                    title={task.isAuto ? "Log this action in the dashboard to clear this automated reminder." : "Mark as completed"}
                                >
                                    <Circle size={22} strokeWidth={2.5} />
                                </button>
                                
                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                    <span className={`text-sm font-semibold ${task.isAuto ? 'text-indigo-900' : 'text-gray-700'}`}>
                                        {task.description}
                                    </span>
                                    {task.isAuto && (
                                        <span className="inline-block mt-2 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full w-fit uppercase tracking-wider">
                                            {task.category} REMINDER
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
