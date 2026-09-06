"use client";

import { useState, useEffect } from "react";
import { X, Star, Loader2, MessageSquare } from "lucide-react";
import { farmApi } from "@/integration/farmApi";

export default function FarmReviewsModal({ isOpen, onClose, farmId, farmName, onRatingSubmitted }) {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Draft state
    const [isWriting, setIsWriting] = useState(false);
    const [myRating, setMyRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [myComment, setMyComment] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        fetchRatings();
    }, [isOpen, farmId]);

    const fetchRatings = async () => {
        try {
            setLoading(true);
            const res = await farmApi.getFarmRatings(farmId);
            if (res.success) {
                setRatings(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch ratings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRating = async () => {
        if (myRating < 1 || myRating > 5) return alert("Please select a star rating first.");
        
        try {
            setSubmitting(true);
            const res = await farmApi.rateFarm(farmId, myRating, myComment);
            if (res.success) {
                // Refresh local ratings
                await fetchRatings();
                setIsWriting(false);
                setMyRating(0);
                setMyComment("");
                // Notify parent component to refresh marketplace list average ratings if needed
                if (onRatingSubmitted) onRatingSubmitted();
            }
        } catch (err) {
            alert("Failed to submit rating: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const renderStars = (val) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={14}
                        className={s <= val ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{farmName} Ratings</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{ratings.length} Review{ratings.length !== 1 && 's'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Write Review Section */}
                    {!isWriting ? (
                        <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-center">
                            <p className="text-sm font-medium text-gray-700 mb-3">Bought from this farmer? Share your experience.</p>
                            <button
                                onClick={() => setIsWriting(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                            >
                                Write a Review
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6 p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Rate your experience</h3>
                            
                            <div className="flex items-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setMyRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={32}
                                            className={`${(hoverRating || myRating) >= star ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-300"}`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-medium text-gray-500">
                                    {myRating === 1 ? "Poor" : myRating === 2 ? "Fair" : myRating === 3 ? "Good" : myRating === 4 ? "Very Good" : myRating === 5 ? "Excellent" : ""}
                                </span>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Comment (Optional)</label>
                                <textarea
                                    value={myComment}
                                    onChange={(e) => setMyComment(e.target.value)}
                                    placeholder="What did you like about the fish or the farmer?"
                                    className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsWriting(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitRating}
                                    disabled={myRating === 0 || submitting}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                                    Submit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Existing Reviews List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Consumer Reviews</h3>
                        {loading ? (
                            <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : ratings.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-6 bg-gray-50 rounded-xl">No reviews yet. Be the first to rate!</p>
                        ) : (
                            ratings.map((r, i) => (
                                <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                                                {r.RetailerName.substring(0, 1)}
                                            </div>
                                            <p className="font-bold text-sm text-gray-800">{r.RetailerName}</p>
                                        </div>
                                        {renderStars(r.RatingValue)}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                                        {r.Comment || <span className="text-gray-400 italic">No comment provided.</span>}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-wide">
                                        {new Date(r.CreatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
