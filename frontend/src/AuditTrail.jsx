import { useEffect, useMemo, useState } from "react";

const EVENT_BADGE_CLASSES = {
  TENDER_UPLOADED: "bg-blue-100 text-blue-700",
  BID_ANALYZED: "bg-purple-100 text-purple-700",
  VENDOR_RANKED: "bg-green-100 text-green-700",
  REPORT_GENERATED: "bg-orange-100 text-orange-700",
};

function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (!import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.host}`;
  }

  return "http://localhost:8000";
}

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/audit/logs`);
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) {
      return logs;
    }
    const query = search.trim().toLowerCase();
    return logs.filter((log) =>
      String(log?.tender_id ?? "")
        .toLowerCase()
        .includes(query)
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
        <p className="text-sm text-slate-600 mt-1">
          All procurement events logged by the system
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label
          htmlFor="audit-search"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Filter by Tender ID
        </label>
        <input
          id="audit-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter tender ID..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Tender ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Performed By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No audit entries found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const eventType = String(log?.event_type ?? "UNKNOWN");
                    const badgeClass =
                      EVENT_BADGE_CLASSES[eventType] || "bg-slate-100 text-slate-700";

                    const detailsValue =
                      typeof log?.details === "object" && log?.details !== null
                        ? JSON.stringify(log.details)
                        : String(log?.details ?? "");

                    const timestampText = log?.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "-";

                    return (
                      <tr key={log?.event_id ?? `${eventType}-${timestampText}`}>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {timestampText}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
                          >
                            {eventType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {log?.tender_id ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {log?.performed_by ?? "system"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xl break-words">
                          {detailsValue || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
