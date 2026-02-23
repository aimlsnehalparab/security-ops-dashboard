import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

function KpiCard({ title, value }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-xl text-center hover:scale-105 transition-all">
      <div className="text-sm text-gray-400 mb-2">{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function RiskBadge({ level }) {
  const styles = {
    Low: "bg-green-500/20 text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-400",
    High: "bg-red-500/20 text-red-400",
    Critical: "bg-red-700/30 text-red-500",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        styles[level] || "bg-gray-700 text-gray-300"
      }`}
    >
      {level}
    </span>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [health, setHealth] = useState(null);   // ✅ ADD HERE
  const [activeSection, setActiveSection] = useState("health");

useEffect(() => {
  const sections = ["health", "risk-profiles", "travel", "logs"];

  const handleScroll = () => {
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top;
        if (top >= 0 && top <= 200) {
          setActiveSection(id);
        }
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
  // 🔥 NEW FILTER STATES
  const [logFilterDate, setLogFilterDate] = useState("");
  const [logSearch, setLogSearch] = useState("");

  const [kpis, setKpis] = useState({
    totalUsers: 0,
    highRiskUsers: 0,
    impossibleTravel: 0,
    botIndicators: 0,
    blockedUsers: 0,
  });

  /* -------------------- Load Logs -------------------- */

  useEffect(() => {
    fetch("http://localhost:5000/api/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data.reverse());
      })
      .catch(() => {});

    socket.on("new-alert", (alert) => {
      const formattedLog = {
        _id: Date.now().toString(),
        message: `${alert.attackType} detected (${alert.reason})`,
        level: alert.severity || "info",
        source: "Detection Engine",
        timestamp: new Date().toISOString(),
      };

      setLogs((prev) => [formattedLog, ...prev]);
    });

    return () => socket.off("new-alert");
  }, []);

  /* -------------------- Load Risk Profiles -------------------- */

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token || token.split(".").length !== 3) {
      localStorage.removeItem("accessToken");
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/admin/risk-profiles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        const profiles = data.profiles || [];
        setRiskProfiles(profiles);

        setKpis({
          totalUsers: profiles.length,
          highRiskUsers: profiles.filter(
            (p) => p.riskLevel === "High" || p.riskLevel === "Critical"
          ).length,
          impossibleTravel: profiles.filter((p) =>
            p.signals?.includes("Impossible travel detected")
          ).length,
          botIndicators: profiles.filter((p) => p.botIndicators > 0).length,
          blockedUsers: profiles.filter(
            (p) => p.status === "locked" || p.status === "blacklisted"
          ).length,
        });

        setChartData([
          profiles.filter((p) => p.riskLevel === "Low").length,
          profiles.filter((p) => p.riskLevel === "Medium").length,
          profiles.filter((p) => p.riskLevel === "High").length,
          profiles.filter((p) => p.riskLevel === "Critical").length,
        ]);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
      });
  }, [navigate]);

  /* -------------------- Load Health Panel -------------------- */

useEffect(() => {
  fetch("http://localhost:5000/api/admin/health")
    .then((res) => res.json())
    .then((data) => {
      setHealth(data);
    })
    .catch((err) => {
      console.error("Health fetch error:", err);
    });
}, []);

  const impossibleTravelProfiles = riskProfiles.filter((p) =>
    p.signals?.includes("Impossible travel detected")
  );

  /* -------------------- FILTER LOGS -------------------- */

  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.timestamp)
      .toISOString()
      .split("T")[0];

    const matchesDate = logFilterDate
      ? logDate === logFilterDate
      : true;

    const matchesSearch = logSearch
      ? log.message.toLowerCase().includes(logSearch.toLowerCase())
      : true;

    return matchesDate && matchesSearch;
  });

  /* -------------------- Chart Config -------------------- */

  const riskChart = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "Users by Risk Level",
        data: chartData,
        backgroundColor: [
          "rgba(34,197,94,0.6)",
          "rgba(234,179,8,0.6)",
          "rgba(239,68,68,0.6)",
          "rgba(127,29,29,0.8)",
        ],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white p-6">

      <div className="absolute inset-0 -z-10 overflow-hidden">
  <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse top-10 left-20"></div>
  <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse bottom-20 right-20"></div>
</div>
      <h1 className="text-4xl font-extrabold text-center mb-6
bg-gradient-to-r from-blue-400 via-purple-500 to-red-500
text-transparent bg-clip-text tracking-wide animate-glow">
  🛡 SECURITY OPERATIONS DASHBOARD
</h1>

{/* ================= NAVIGATION ================= */}

<div className="flex justify-center mb-10">
  <div className="flex gap-6 bg-white/5 backdrop-blur-md 
  border border-white/10 px-6 py-3 rounded-full shadow-lg">

    <a href="#health"
      className={`px-4 py-2 rounded-full font-semibold transition-all duration-300
  ${activeSection === "health"
    ? "bg-blue-500/30 text-blue-400 scale-110"
    : "bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 hover:scale-110"}`}>
      Overview
    </a>

    <a href="#risk-profiles"
      className={`px-4 py-2 rounded-full font-semibold transition-all duration-300
  ${activeSection === "risk-profiles"
    ? "bg-blue-500/30 text-blue-400 scale-110"
    : "bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 hover:scale-110"}`}>
      Risk Profiles
    </a>

    <a href="#travel"
      className={`px-4 py-2 rounded-full font-semibold transition-all duration-300
  ${activeSection === "travel"
    ? "bg-blue-500/30 text-blue-400 scale-110"
    : "bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 hover:scale-110"}`}>
      Travel Alerts
    </a>

    <a href="#logs"
      className={`px-4 py-2 rounded-full font-semibold transition-all duration-300
  ${activeSection === "logs"
    ? "bg-blue-500/30 text-blue-400 scale-110"
    : "bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 hover:scale-110"}`}>
      Logs
    </a>

  </div>
</div>
      {/* ================= SOC HEALTH PANEL ================= */}

{health && (
  <>
    <h2 id="health" className="text-xl font-semibold mb-6">
      📊 SOC Health Overview (Today)
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
      <KpiCard title="🚨 Total Alerts Today" value={health.totalAlertsToday} />
      <KpiCard title="🔴 High Severity Alerts" value={health.highSeverityCount} />
      <KpiCard title="🔒 Locked Accounts" value={health.lockedAccounts} />
      <KpiCard title="🤖 Bot Detections" value={health.botDetections} />
      <KpiCard title="❌ Failed Logins (24h)" value={health.failedLoginsToday} />
      <KpiCard title="📈 Avg Risk Score" value={health.avgRiskScore} />
      <KpiCard
        title="⏰ Peak Attack Hour"
        value={
          health.peakHour !== null
            ? `${health.peakHour}:00 (${health.peakCount})`
            : "—"
        }
      />
      <KpiCard
        title="🎯 Most Targeted User"
        value={
          health.mostTargetedUser
            ? `${health.mostTargetedUser._id} (${health.mostTargetedUser.attempts})`
            : "—"
        }
      />
    </div>
  </>
)}

{/* ================= FAILED LOGIN TREND ================= */}

{health && (
  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-12 h-80">
    <h2 className="text-xl font-semibold mb-6">
      📉 Failed Login Trend (Today)
    </h2>

    <Bar
    data={{
      labels: health.hourlyTrend.map((h) => {
  const hour = h._id;
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${formattedHour.toString().padStart(2, "0")}:00 ${period} IST`;
}),
      datasets: [
        {
          label: "Failed Logins",
          data: health.hourlyTrend.map((h) => h.count),
          backgroundColor: "rgba(239,68,68,0.6)",
          borderRadius: 6,
          maxBarThickness: 60
        },
      ],
    }}
    options={{
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
}}
  />
  </div>
)}

<div className="border-t border-white/10 my-16"></div>
<h2 className="text-xl font-semibold mb-6">
  👥 User Risk Summary
</h2>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-12">
        <KpiCard title="👤 Total Users" value={kpis.totalUsers} />
        <KpiCard title="🚨 High Risk Users" value={kpis.highRiskUsers} />
        <KpiCard title="🌍 Impossible Travel" value={kpis.impossibleTravel} />
        <KpiCard title="🤖 Bot Indicators" value={kpis.botIndicators} />
        <KpiCard title="🔒 Blocked Users" value={kpis.blockedUsers} />
      </div>

      {/* RISK GRAPH */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-12 h-80">
        <h2 className="text-xl font-semibold mb-6">
          📊 Risk Distribution Overview
        </h2>

        <Bar data={riskChart} />
      </div>

      {/* ================= RISK PROFILES ================= */}

<h2 id="risk-profiles" className="text-xl font-semibold mb-4 mt-12">
  Risk Profiles
</h2>

<div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto mb-12">
  <table className="w-full text-sm">
    <thead className="bg-white/10">
      <tr>
        <th className="p-3 text-left">User ID</th>
        <th className="p-3 text-left">Risk Score</th>
        <th className="p-3 text-left">Risk Level</th>
        <th className="p-3 text-left">Status</th>
        <th className="p-3 text-left">Signals</th>
        <th className="p-3 text-left">MITRE</th>
        <th className="p-3 text-left">Last Updated</th>
      </tr>
    </thead>

    <tbody>
      {riskProfiles.map((p) => (
        <tr
          key={p._id}
          className="border-b border-white/10 hover:bg-white/5 transition"
        >
          <td
            className="p-3 font-mono text-blue-400 cursor-pointer hover:underline"
            onClick={() => navigate(`/user/${p.entityId}/map`)}
          >
            {p.entityId}
          </td>
          <td className="p-3">{p.riskScore}</td>
          <td className="p-3">
            <RiskBadge level={p.riskLevel} />
          </td>
          <td className="p-3 capitalize">{p.status}</td>
          <td className="p-3 text-gray-300">
            {p.signals?.length ? p.signals.join(", ") : "—"}
          </td>
          <td className="p-3">
            {Array.isArray(p.mitre) && p.mitre.length > 0
              ? p.mitre.map((m) => m.techniqueId).join(", ")
              : "—"}
          </td>
          <td className="p-3">
            {p.updatedAt
              ? new Date(p.updatedAt).toLocaleString()
              : "—"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* ================= IMPOSSIBLE TRAVEL PANEL ================= */}

<h2 id="travel" className="text-xl font-semibold mb-4">
  🌍 Impossible Travel Detections
</h2>

<div className="bg-white/5 border border-white/10 rounded-xl mb-12">
  {impossibleTravelProfiles.length > 0 ? (
    impossibleTravelProfiles.map((p) => (
      <div
        key={p._id}
        className="border-b border-white/10 p-4 flex justify-between items-center hover:bg-white/5 transition"
      >
        <div>
          <div className="font-semibold text-white">
            {p.entityId}
          </div>
          <div className="text-sm text-gray-400">
            Geo-velocity anomaly detected
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <RiskBadge level={p.riskLevel} />
          <span className="text-sm capitalize text-gray-300">
            {p.status}
          </span>
        </div>
      </div>
    ))
  ) : (
    <div className="p-4 text-gray-400">
      No impossible travel detections
    </div>
  )}
</div>

      {/* ================= SYSTEM LOGS ================= */}

      <div className="flex justify-between items-center mb-4">
        <h2 id="logs" className="text-xl font-semibold">
          📜 System Logs
        </h2>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search email..."
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded"
          />

          <input
            type="date"
            value={logFilterDate}
            onChange={(e) => setLogFilterDate(e.target.value)}
            className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Level</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log._id}
                className="border-b border-white/10 hover:bg-white/5 transition"
              >
                <td className="p-3 text-gray-200">{log.message}</td>
                <td className="p-3 text-gray-300">
  {log.email || "—"}
</td>
                <td className="p-3 capitalize">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.level === "High"
                        ? "bg-red-500/20 text-red-400"
                        : log.level === "Info"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {log.level}
                  </span>
                </td>
                <td className="p-3 text-gray-300">{log.source}</td>
                <td className="p-3 text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;