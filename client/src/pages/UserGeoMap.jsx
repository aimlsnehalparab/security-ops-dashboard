import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function FitBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
}

function UserGeoMap() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [impossibleTravel, setImpossibleTravel] = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token || token.split(".").length !== 3) {
      localStorage.removeItem("accessToken");
      navigate("/login");
      return;
    }

    // Login history
    fetch(`http://localhost:5000/api/admin/user-logins/${entityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          const sorted = data.events.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setLocations(sorted);
        } else {
          setLocations([]);
        }

        if (data.impossibleTravel) {
          setImpossibleTravel(data.impossibleTravel);
        }
      })
      .catch((err) => console.error(err));

    // Risk profile
    fetch(`http://localhost:5000/api/admin/risk-profiles`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const profile = data.profiles.find(
            (p) => p.entityId === entityId
          );
          setRiskProfile(profile || null);
        }
      })
      .catch((err) => console.error(err));

  }, [entityId, navigate]);

  const polylinePoints = locations.map((loc) => [
    loc.latitude,
    loc.longitude,
  ]);

  const failedCount = locations.filter((l) => l.success === false).length;
  const successCount = locations.filter((l) => l.success === true).length;

  const chartData = locations.map((loc) => ({
    time: new Date(loc.timestamp).toLocaleTimeString(),
    value: loc.success ? 0 : 1,
  }));

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6">
        🔎 User Security Analysis — {entityId}
      </h2>

      {/* MAP + ANALYSIS PANEL */}
      <div className="grid grid-cols-4 gap-6 mb-8">

        {/* MAP */}
        <div className="col-span-3 bg-[#1e293b] p-4 rounded-xl">
          {locations.length > 0 ? (
            <MapContainer zoom={3} style={{ height: "500px", width: "100%" }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <FitBounds locations={locations} />

              {locations.map((loc, index) => (
                <CircleMarker
                  key={index}
                  center={[loc.latitude, loc.longitude]}
                  radius={8}
                  pathOptions={{
                    color: loc.success ? "#00ff99" : "#ff8800",
                    fillColor: loc.success ? "#00ff99" : "#ff8800",
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup>
                    <strong>{loc.city}, {loc.country}</strong><br/>
                    {new Date(loc.timestamp).toLocaleString()}
                  </Popup>
                </CircleMarker>
              ))}

              <Polyline
                positions={polylinePoints}
                pathOptions={{ color: "yellow", weight: 3 }}
              />
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-gray-400">
              No geo data available for this user
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            🛡 Security Analysis
          </h3>

          <p className="mb-2">
            <strong>Total Logins:</strong> {locations.length}
          </p>

          <p className="mb-2">
            <strong>Failed Attempts:</strong>{" "}
            <span className="text-red-400 font-bold">{failedCount}</span>
          </p>

          <p className="mb-2">
            <strong>Successful Logins:</strong>{" "}
            <span className="text-green-400 font-bold">{successCount}</span>
          </p>

          {impossibleTravel?.detected && (
            <>
              <hr className="my-4 border-gray-600" />
              <p><strong>From:</strong> {impossibleTravel.from}</p>
              <p><strong>To:</strong> {impossibleTravel.to}</p>
              <p><strong>Distance:</strong> {impossibleTravel.distanceKm} km</p>
              <p><strong>Speed:</strong> {impossibleTravel.speedKmph} km/h</p>
              <p className="mt-4 text-red-400 font-semibold">
                🚨 Impossible Travel Detected
              </p>
            </>
          )}
        </div>
      </div>
{/* BOT ANALYSIS PANEL */}
{riskProfile && (
  <div className="bg-[#1e293b] p-6 rounded-xl mb-8 border border-gray-700">
    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
      🤖 Bot Intelligence Engine
    </h3>

    {/* STATUS + LEVEL */}
    <div className="grid grid-cols-3 gap-6 mb-6">

      <div>
        <p className="text-sm text-gray-400">Status</p>
        {riskProfile.status === "locked" ? (
          <p className="text-red-500 font-bold text-lg">
            LOCKED (BOT DETECTED)
          </p>
        ) : (
          <p className="text-green-400 font-bold text-lg">
            Active
          </p>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-400">Risk Level</p>
        <p className={`font-bold text-lg ${
          riskProfile.riskLevel === "High"
            ? "text-red-500"
            : riskProfile.riskLevel === "Medium"
            ? "text-yellow-400"
            : "text-green-400"
        }`}>
          {riskProfile.riskLevel}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-400">Bot Indicators</p>
        <p className="text-purple-400 font-bold text-lg">
          {riskProfile.botIndicators || 0}
        </p>
      </div>
    </div>

    {/* RISK METER */}
    <div className="mb-6">
      <p className="text-sm text-gray-400 mb-2">Risk Score</p>
      <div className="w-full bg-gray-800 rounded-full h-5 overflow-hidden">
        <div
          className={`h-5 ${
            riskProfile.riskScore >= 40
              ? "bg-red-600"
              : riskProfile.riskScore >= 25
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{ width: `${Math.min(riskProfile.riskScore, 100)}%` }}
        />
      </div>
      <p className="text-right text-sm mt-1 text-gray-400">
        {riskProfile.riskScore} / 100
      </p>
    </div>

    {/* SIGNALS */}
    <div>
      <p className="text-sm text-gray-400 mb-3">
        Triggered Behavioral Signals
      </p>

      {riskProfile.signals && riskProfile.signals.length > 0 ? (
        <div className="space-y-2">
          {riskProfile.signals.map((signal, i) => (
            <div
              key={i}
              className="bg-[#0f172a] border border-gray-700 p-3 rounded-lg text-sm"
            >
              ⚠ {signal}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          No suspicious signals detected.
        </p>
      )}
    </div>

    {/* LOCK TIMER */}
    {riskProfile.status === "locked" && riskProfile.lockUntil && (
      <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
        <p className="text-sm text-red-300">
          User locked until:
        </p>
        <p className="font-bold text-red-400">
          {new Date(riskProfile.lockUntil).toLocaleString()}
        </p>
      </div>
    )}
  </div>
)}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-red-900 p-6 rounded-xl text-center">
          <h3>Failed Attempts</h3>
          <p className="text-3xl font-bold">{failedCount}</p>
        </div>

        <div className="bg-green-900 p-6 rounded-xl text-center">
          <h3>Successful Logins</h3>
          <p className="text-3xl font-bold">{successCount}</p>
        </div>

        <div className="bg-purple-900 p-6 rounded-xl text-center">
          <h3>Total Attempts</h3>
          <p className="text-3xl font-bold">{locations.length}</p>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-[#1e293b] p-6 rounded-xl">
        <h3 className="mb-4 text-lg font-semibold">
          📊 Failed Login Timeline
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="time" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ff0000"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserGeoMap;