import React, { useEffect, useState } from "react";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data.reverse());
        else console.warn("Unexpected logs response:", data);
      })
      .catch((err) => console.error("Error fetching logs:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading logs...</p>;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-3">📜 System Logs</h3>
      {logs.length === 0 ? (
        <p className="text-gray-500">No logs found.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log._id || Math.random()} className="bg-gray-100 p-3 rounded">
              <span className="font-semibold text-blue-600">
                {log.level?.toUpperCase() || "INFO"}
              </span>{" "}
              — {log.message || "No message"}{" "}
              <em className="text-gray-500">
                (
                {log.createdAt
                  ? new Date(log.createdAt).toLocaleString()
                  : log.timestamp
                  ? new Date(log.timestamp).toLocaleString()
                  : "—"}
                )
              </em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Logs;
