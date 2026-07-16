"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Heart, Phone, Calendar, MapPin, ClipboardList } from "lucide-react";
import { getTrekById, getParticipants, getCaptain } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { Trek, Participant, Captain } from "@/lib/types";

export default function EmergencySheetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trek, setTrek] = useState<Trek | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [captain, setCaptain] = useState<Captain | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const [trekData, roster, capData] = await Promise.all([
        getTrekById(id),
        getParticipants(id),
        getCaptain(),
      ]);

      if (trekData) setTrek(trekData);
      setParticipants(roster.filter((p) => p.status !== "Cancelled"));
      if (capData) setCaptain(capData);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-trail-orange/30 border-t-trail-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-text-primary gap-4">
        <p className="text-lg">Trek not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-trail-orange hover:bg-trail-orange-hover text-xs font-bold rounded-lg cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const printDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans p-6 print:p-0 print:bg-white print:text-black">
      {/* Print styles override */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Top Bar for Dashboard Screen (Hidden on Print) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between bg-[#141A16] border border-[#233028] rounded-xl px-4 py-3 text-text-primary shadow-lg">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roster
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-dim">Print-optimized layout</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-trail-orange hover:bg-trail-orange-hover text-white text-xs font-bold py-1.5 px-4 rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="print-container max-w-4xl mx-auto bg-white border border-neutral-200 rounded-xl p-8 print:p-0 print:border-none shadow-sm print:shadow-none space-y-8">
        
        {/* Header Block */}
        <div className="border-b-2 border-neutral-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-neutral-500">
              Emergency Manifest Sheet
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight font-[family-name:var(--font-sora-family)] text-neutral-900">
              {trek.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-neutral-500" />
                {formatDate(trek.startDate)} to {formatDate(trek.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-neutral-500" />
                {trek.location}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right text-sm text-neutral-600 space-y-1 border-t md:border-t-0 border-neutral-100 pt-3 md:pt-0 w-full md:w-auto">
            <div>
              <span className="font-semibold text-neutral-800">Captain:</span> {captain?.fullName || "Unknown"}
            </div>
            {captain?.whatsapp && (
              <div>
                <span className="font-semibold text-neutral-800">Phone:</span> +{captain.whatsapp}
              </div>
            )}
            <div className="text-xs text-neutral-400">
              Generated: {printDate}
            </div>
          </div>
        </div>

        {/* Meeting Point Block */}
        {trek.meetingPoint && (
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-neutral-500">Meeting Point & Time</span>
            <p className="text-sm font-medium text-neutral-800">{trek.meetingPoint}</p>
          </div>
        )}

        {/* Participants Table */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2 border-b border-neutral-200 pb-2">
            <ClipboardList className="w-5 h-5 text-neutral-600" />
            Trekkers List ({participants.length} Active)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400 text-neutral-600">
                  <th className="py-2.5 pr-2 font-bold">No.</th>
                  <th className="py-2.5 pr-2 font-bold">Name</th>
                  <th className="py-2.5 pr-2 font-bold">Age/Gen</th>
                  <th className="py-2.5 pr-2 font-bold">Phone</th>
                  <th className="py-2.5 pr-2 font-bold">Blood</th>
                  <th className="py-2.5 pr-2 font-bold">Emergency Contact</th>
                  <th className="py-2.5 pr-2 font-bold">Medical Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {participants.map((p, idx) => {
                  const hasMedical = !!p.medicalNotes?.trim();
                  return (
                    <tr
                      key={p.id}
                      className={`align-top ${hasMedical ? "bg-neutral-100 font-medium" : ""}`}
                    >
                      <td className="py-2.5 pr-2 text-neutral-400">{idx + 1}</td>
                      <td className="py-2.5 pr-2 font-bold text-neutral-900">{p.name}</td>
                      <td className="py-2.5 pr-2">
                        {p.age || "-"}/{p.gender ? p.gender.charAt(0).toUpperCase() : "-"}
                      </td>
                      <td className="py-2.5 pr-2 font-mono">{p.phone}</td>
                      <td className="py-2.5 pr-2 font-bold text-red-600">{p.bloodGroup || "-"}</td>
                      <td className="py-2.5 pr-2">
                        <div>{p.emergencyContact || "-"}</div>
                        {p.emergencyContactPhone && (
                          <div className="font-mono text-[10px] text-neutral-500">{p.emergencyContactPhone}</div>
                        )}
                      </td>
                      <td className="py-2.5 pr-2 text-neutral-700 italic">
                        {hasMedical ? p.medicalNotes : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes / Blank lines for field notes */}
        <div className="space-y-4 pt-4 border-t border-neutral-300">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Field Notes & Logs
          </h3>
          <div className="space-y-4">
            <div className="border-b border-dashed border-neutral-300 h-6" />
            <div className="border-b border-dashed border-neutral-300 h-6" />
            <div className="border-b border-dashed border-neutral-300 h-6" />
            <div className="border-b border-dashed border-neutral-300 h-6" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-neutral-400 pt-8 border-t border-neutral-100">
          Trek Captain Platform • Safe Trails & Adventures
        </div>

      </div>
    </div>
  );
}
