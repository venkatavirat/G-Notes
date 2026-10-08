import { useEffect, useState } from "react";
import api from "../api";

function AnalyticsBanner({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadStats() {
      try {
        const response = await api.get("/analytics/db-stats");
        if (isCurrent) {
          setStats(response.data);
          setError("");
        }
      } catch (requestError) {
        console.error("Failed to load database statistics:", requestError);
        if (isCurrent) {
          setError(requestError.response?.data?.message || "Database statistics are unavailable.");
        }
      }
    }

    loadStats();
    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  const values = [
    { label: "Notes ($count)", value: stats?.totalNotes ?? "—" },
    { label: "Semester sum ($sum)", value: stats?.semesterSum ?? "—" },
    { label: "Average semester ($avg)", value: stats?.averageSemester == null ? "—" : stats.averageSemester.toFixed(1) },
    { label: "Min semester ($min)", value: stats?.minSemester ?? "—" },
    { label: "Max semester ($max)", value: stats?.maxSemester ?? "—" }
  ];

  return (
    <section className="analytics-banner" aria-label="Database analytics">
      <div className="analytics-heading">
        <span className="eyebrow">DATABASE SNAPSHOT</span>
        <h2>Library analytics</h2>
      </div>
      {error ? (
        <p className="analytics-error" role="alert">{error}</p>
      ) : (
        <div className="analytics-stats" aria-live="polite">
          {values.map(({ label, value }) => (
            <div className="analytics-stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AnalyticsBanner;
