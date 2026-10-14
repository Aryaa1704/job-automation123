import React, { useState } from 'react';
import { Play, ChevronDown, CheckCircle2 } from 'lucide-react';

export const HapppyHelpView: React.FC = () => {
  const [queryText, setQueryText] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [queries, setQueries] = useState<
    Array<{
      id: number;
      raisedOn: string;
      context: string;
      message: string;
      status: string;
      read: string;
    }>
  >([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    const newQuery = {
      id: queries.length + 1,
      raisedOn: new Date().toLocaleDateString(),
      context: 'Outreach & Extension Support',
      message: queryText,
      status: 'In Review',
      read: 'Yes'
    };

    setQueries([newQuery, ...queries]);
    setQueryText('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs">
      {/* Header (Matches Screenshot 6) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Raise a Query</h1>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Raise a ticket for your job journey (Happpy agent, outreach). Our team will review and update status here.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] self-start md:self-center">
          <Play className="w-3 h-3 fill-emerald-800" />
          <span>Play Use Case video (1 MIN)</span>
        </button>
      </div>

      {submittedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your support query has been submitted! Our engineering team will review it.</span>
        </div>
      )}

      {/* Form Card (Matches Screenshot 6) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
        {/* Quick FAQ */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer">
          <span className="font-semibold text-slate-800">Quick FAQ</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Textarea */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              What do you need help with?
            </label>
            <textarea
              rows={5}
              placeholder="Describe your issue, steps to reproduce, or what you expected to happen..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={!queryText.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold uppercase tracking-wider disabled:opacity-40 transition-colors"
          >
            SUBMIT QUERY
          </button>
        </form>
      </div>

      {/* Previously Raised Queries Table (Matches Screenshot 6) */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Previously raised queries</h3>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                <th className="py-3 px-4">NO.</th>
                <th className="py-3 px-4">RAISED ON</th>
                <th className="py-3 px-4">CONTEXT</th>
                <th className="py-3 px-4">MESSAGE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">READ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No queries yet. Use the form above to raise your first query.
                  </td>
                </tr>
              ) : (
                queries.map((q) => (
                  <tr key={q.id}>
                    <td className="py-3 px-4 font-mono">{q.id}</td>
                    <td className="py-3 px-4 text-slate-600">{q.raisedOn}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{q.context}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{q.message}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{q.read}</td>
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
