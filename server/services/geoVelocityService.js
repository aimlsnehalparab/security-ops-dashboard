const LoginEvent = require("../models/LoginEvent");
const { calculateDistanceKm } = require("../utils/geoUtils");

const IMPOSSIBLE_SPEED_KMPH = 900; // realistic aircraft speed

async function checkImpossibleTravel(userId) {
  const logins = await LoginEvent.find({ userId })
    .sort({ timestamp: -1 })
    .limit(2);

  if (logins.length < 2) {
    return { detected: false };
  }

  const current = logins[0];
  const previous = logins[1];

  const timeDiffMs =
    new Date(current.timestamp) - new Date(previous.timestamp);

  if (timeDiffMs <= 0) {
    return { detected: false };
  }

  const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
  const timeDiffMinutes = timeDiffMs / (1000 * 60);

  const distanceKm = calculateDistanceKm(
    previous.latitude,
    previous.longitude,
    current.latitude,
    current.longitude
  );

  const speedKmph = distanceKm / timeDiffHours;

  console.log("GEO DEBUG:", {
    from: previous.city,
    to: current.city,
    distanceKm,
    timeDiffHours,
    speedKmph
  });

  if (speedKmph > IMPOSSIBLE_SPEED_KMPH) {
    return {
      detected: true,
      fromCountry: previous.country,
      toCountry: current.country,
      fromLocation: `${previous.city}, ${previous.country}`,
      toLocation: `${current.city}, ${current.country}`,
      distanceKm: Math.round(distanceKm),
      speedKmph: Math.round(speedKmph),
      timeDiffMinutes: Math.round(timeDiffMinutes),
    };
  }

  return { detected: false };
}

module.exports = { checkImpossibleTravel };