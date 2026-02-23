// server/utils/detectionEngine.js
// CommonJS

const attemptsByIP = new Map(); // { ip -> [timestamp, ...] }

const BRUTE_FORCE_WINDOW_MS = 60 * 1000; // 1 minute
const BRUTE_FORCE_THRESHOLD = 5; // >= 5 failed attempts in window => escalate

function pruneOldAttempts(ip, now) {
  const arr = attemptsByIP.get(ip) || [];
  const filtered = arr.filter(t => now - t <= BRUTE_FORCE_WINDOW_MS);
  if (filtered.length) attemptsByIP.set(ip, filtered);
  else attemptsByIP.delete(ip);
  return filtered;
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const arr = attemptsByIP.get(ip) || [];
  arr.push(now);
  attemptsByIP.set(ip, arr);
  return pruneOldAttempts(ip, now).length;
}

function detectAttack(log) {
  const message = (log.message || log.eventType || "").toLowerCase();
  const source = (log.sourceIP || log.source || "").toString().toLowerCase();
  const success = !!log.success;

  // Pattern rules
  const rules = [
    { type: "SQL Injection", patterns: ["union select", "drop table", "or 1=1", "' or '1'='1", "--", "/*"], severity: "High" },
    { type: "XSS", patterns: ["<script>", "onerror=", "alert(", "document.cookie"], severity: "High" },
    { type: "Directory Traversal", patterns: ["../", "..\\", "/etc/passwd"], severity: "Medium" },
    { type: "Malware", patterns: ["malware", "virus"], severity: "Critical" },
    { type: "Suspicious Firewall Event", patterns: ["port scan", "connection flood"], severity: "Medium" }
  ];

  // 1) Immediate pattern match
  for (const rule of rules) {
    for (const pat of rule.patterns) {
      if (message.includes(pat) || (log.extra && JSON.stringify(log.extra).toLowerCase().includes(pat))) {
        return { detected: true, attackType: rule.type, severity: rule.severity, reason: `pattern:${pat}` };
      }
    }
  }

  // 2) Failed login attempt → single alert
  if (log.eventType === "login_attempt" && success === false) {
    return { detected: true, attackType: "Failed Login", severity: "Medium", reason: "invalid credentials" };
  }

  // 3) Brute force detection
  if (!success && source) {
    const count = recordFailedAttempt(source);
    if (count >= BRUTE_FORCE_THRESHOLD) {
      return { detected: true, attackType: "Brute Force Attack", severity: "High", reason: `failed_attempts:${count}` };
    }
  }

  return { detected: false, attackType: "Normal Activity", severity: "Low" };
}

module.exports = detectAttack;
