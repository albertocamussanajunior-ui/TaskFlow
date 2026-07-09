"use client";

import { useState } from "react";
import { Search, X, Check, UserPlus } from "lucide-react";
import { initials } from "@/lib/ui";

export function MemberSelector({
  teamMembers,
  selectedMembers,
  onChange,
}: {
  teamMembers: Array<{ id: string; name: string; email?: string }>;
  selectedMembers: string[];
  onChange: (members: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = teamMembers.filter((member) => {
    const q = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.email?.toLowerCase().includes(q)
    );
  });

  const toggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      onChange(selectedMembers.filter((id) => id !== memberId));
    } else {
      onChange([...selectedMembers, memberId]);
    }
  };

  const selectedMembersList = teamMembers.filter((m) =>
    selectedMembers.includes(m.id),
  );

  return (
    <div className="space-y-3">
      {selectedMembersList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembersList.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => toggleMember(member.id)}
              className="inline-flex items-center gap-2 rounded-full bg-black/90 dark:bg-white/10 px-3 py-1.5 text-sm text-white transition-all hover:bg-black/80 dark:hover:bg-white/20"
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                {initials(member.name)}
              </span>
              {member.name}
              <X size={14} className="text-white/70" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            selectedMembers.length === 0
              ? "Pesquisar membros da equipa..."
              : "Pesquisar para adicionar mais..."
          }
          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-black/20 focus:border-transparent dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const isSelected = selectedMembers.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all ${
                    isSelected
                      ? "bg-black/90 text-white hover:bg-black/80 dark:bg-white/10 dark:hover:bg-white/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-300 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {initials(member.name)}
                  </span>
                  {member.name}
                  {member.email && (
                    <span className="text-xs opacity-60">({member.email})</span>
                  )}
                  {isSelected ? (
                    <Check size={14} className="text-white/70" />
                  ) : (
                    <UserPlus size={14} className="text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="w-full text-center py-4">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Nenhum membro encontrado
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 dark:text-gray-500">
          {selectedMembers.length}{" "}
          {selectedMembers.length === 1 ? "membro" : "membros"} seleccionado
          {selectedMembers.length === 1 ? "" : "s"}
        </span>
        {selectedMembers.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-gray-400 hover:text-red-500 transition-colors dark:text-gray-500 dark:hover:text-red-400"
          >
            Remover todos
          </button>
        )}
      </div>
    </div>
  );
}
