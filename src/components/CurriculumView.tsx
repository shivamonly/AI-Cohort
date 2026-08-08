import React, { useState } from 'react';
import { BookOpen, Search, Layers, CheckCircle2, Wrench } from 'lucide-react';
import curriculumRaw from '../data/curriculum.json' with { type: 'json' };
import { CurriculumData } from '../types/interview';

const curriculum = curriculumRaw as unknown as CurriculumData;

export const CurriculumView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<number | 'ALL'>('ALL');

  const filteredDays = curriculum.days.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tools.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.objectives.some((o) => o.toLowerCase().includes(searchTerm.toLowerCase())) ||
      `day ${d.day}`.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedModule !== 'ALL') {
      const mod = curriculum.modules.find((m) => m.n === selectedModule);
      if (!mod || d.day < mod.days[0] || d.day > mod.days[1]) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-zinc-100 space-y-8">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] tracking-widest font-mono text-zinc-500 uppercase block mb-1">
            ENTERPRISE AI GROUNDING • 31-DAY CURRICULUM
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            Curriculum Architecture
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">
            8 core engineering modules spanning local environments, vector retrieval, RAG, function calling, QLoRA fine-tuning, and multi-agent systems.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tools, objectives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 pl-9 pr-4 py-2 rounded-full text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500 font-mono"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-xs font-mono focus:outline-none focus:border-zinc-500"
          >
            <option value="ALL">All 8 Modules</option>
            {curriculum.modules.map((m) => (
              <option key={m.n} value={m.n}>
                Module {m.n}: {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Days Grid - Mone Style (01/, 02/) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDays.map((day) => {
          const mod = curriculum.modules.find((m) => m.days[0] <= day.day && day.day <= m.days[1]);
          const dayFormatted = day.day < 10 ? `0${day.day}` : `${day.day}`;

          return (
            <div
              key={day.day}
              className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-600 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="font-mono text-xl font-extrabold text-zinc-400 group-hover:text-white transition-colors">
                    {dayFormatted}/
                  </span>

                  <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {day.type}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base leading-snug uppercase tracking-wide group-hover:text-indigo-300 transition-colors">
                  {day.title}
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-1">
                  MODULE {mod?.n}: {mod?.title}
                </p>

                {/* Tools */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {day.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 text-[10px] font-mono border border-zinc-800"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                {/* Objectives */}
                <div className="mt-5 pt-4 border-t border-zinc-900 space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">CURRICULUM OBJECTIVES:</span>
                  <ul className="space-y-1.5">
                    {day.objectives.slice(0, 3).map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
