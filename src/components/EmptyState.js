import { FileQuestion } from "lucide-react";

export default function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center mt-12 text-gray-400">
      <FileQuestion className="w-10 h-10 mb-2" />
      <span className="font-semibold text-lg">{message || "No results found."}</span>
    </div>
  );
}
