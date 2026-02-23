/**
 * Geo-IP Service
 * Production + Demo safe version
 */

async function getGeoFromIP(ip) {
  try {
    /* ---------------- LOCALHOST HANDLING ---------------- */

    if (ip === "::1" || ip === "127.0.0.1") {
      console.log("🌍 Localhost detected — using demo geo (Mumbai)");

      return {
        ip,
        city: "Mumbai",
        country: "India",
        latitude: 19.0760,
        longitude: 72.8777
      };
    }

    /* ---------------- DEMO STATIC IP MAP ---------------- */

    const demoMap = {
      "8.8.8.8": {
        city: "Mountain View",
        country: "USA",
        latitude: 37.386,
        longitude: -122.0838,
      },
      "1.1.1.1": {
        city: "Sydney",
        country: "Australia",
        latitude: -33.8688,
        longitude: 151.2093,
      },
      "81.2.69.142": {
        city: "Berlin",
        country: "Germany",
        latitude: 52.5200,
        longitude: 13.4050,
      },
      "133.242.0.0": {
        city: "Tokyo",
        country: "Japan",
        latitude: 35.6762,
        longitude: 139.6503,
      }
    };

    if (demoMap[ip]) {
      console.log(`🌍 Demo IP detected: ${ip}`);
      return { ip, ...demoMap[ip] };
    }

    /* ---------------- REAL GEO LOOKUP ---------------- */

    const res = await fetch(`https://ipapi.co/${ip}/json/`);

    if (!res.ok) {
      throw new Error("Geo API response not OK");
    }

    const data = await res.json();

    if (!data || data.error || !data.latitude || !data.longitude) {
      throw new Error("Invalid geo response");
    }

    return {
      ip,
      city: data.city || "Unknown",
      country: data.country_name || "Unknown",
      latitude: data.latitude,
      longitude: data.longitude,
    };

  } catch (err) {
    console.warn("⚠️ Geo-IP failed, fallback used for:", ip);

    // ❗ IMPORTANT: return NULL coords so impossible travel doesn't falsely trigger
    return {
      ip,
      city: "Unknown",
      country: "Unknown",
      latitude: null,
      longitude: null,
    };
  }
}

module.exports = { getGeoFromIP };
