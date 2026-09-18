import React, { useState } from 'react';
import { PlusCircle, Calendar, FileText, Edit2, Trash2, AlertTriangle } from 'lucide-react';

export default function Keuangan({ 
  revenueData, 
  isAdmin, 
  onOpenAddModal, 
  onEditRevenue, 
  onDeleteRevenue 
}) {

  return (
    <div data-aos="fade-up" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase">FINANCIAL RECORDS</p>
          <h2 className="text-xl font-serif font-bold text-neutral-900">Revenue History</h2>
        </div>

        {/* Action Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-[#1C1A17] text-[#FBBF24] px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-black transition shadow-sm"
          >
            <PlusCircle size={15} />
            Record Entry
          </button>
        )}
      </div>

      {/* Financial Records List */}
      <div className="flex flex-col gap-3">
        {revenueData.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#EFE8DC]">
            <p className="text-xs text-neutral-400">No financial records found.</p>
          </div>
        ) : (
          revenueData.map((item) => {
            const dateObj = new Date(item.period);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            return (
              <div
                key={item.id || item.period}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#EFE8DC] flex justify-between items-start"
              >
                <div className="flex flex-col gap-1 pr-2">
                  <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                    <Calendar size={13} className="text-amber-700" />
                    <span className="font-semibold text-neutral-800">{formattedDate}</span>
                  </div>

                  {item.notes ? (
                    <p className="text-xs text-neutral-500 mt-1 flex items-start gap-1">
                      <FileText size={12} className="mt-0.5 shrink-0 text-neutral-400" />
                      <span>{item.notes}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-neutral-400 italic">No additional notes</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block font-medium uppercase tracking-wider">Total</span>
                    <span className="text-sm font-bold text-emerald-700 font-mono">
                      Rp {Number(item.total_revenue).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Edit & Delete Action Buttons (Admin Only) */}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditRevenue(item)}
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                        title="Edit Record"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => onDeleteRevenue(item)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        title="Delete Record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}