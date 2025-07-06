import React from "react";
import { useState } from "react";
import { Lightbulb } from "lucide-react";

export default function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 max-w-md w-full border border-gray-200 animate-pulse">
      {/* Top: Subreddit badge and upvotes */}
      <div className="flex items-center gap-2 mb-1">
        <div className="bg-blue-100 rounded-full h-6 w-20" />
        <div className="bg-gray-200 rounded h-4 w-10 ml-2" />
      </div>
      {/* Title */}
      <div className="bg-gray-200 rounded h-6 w-3/4 mb-1" />
      <div className="bg-gray-200 rounded h-6 w-1/2 mb-1" />
      {/* Username */}
      <div className="bg-gray-100 rounded h-4 w-24 mb-2" />
      {/* Button */}
      <div className="bg-gradient-to-r from-blue-200 to-blue-100 rounded h-10 w-full" />
    </div>
  );
} 