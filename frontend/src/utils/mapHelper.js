/**
 * Extracts [latitude, longitude] from center document safely.
 * Checks:
 * 1. center.location.latitude & center.location.longitude (Primary Mongoose schema structure)
 * 2. center.latitude & center.longitude (flat fallback)
 * 3. center.location.coordinates [lng, lat] (GeoJSON format)
 */
export const getCenterCoordinates = (center) => {
  if (!center) return null;

  // 1. Primary Mongoose schema: center.location.latitude & center.location.longitude
  const locLat = center.location?.latitude ?? center.latitude;
  const locLng = center.location?.longitude ?? center.longitude;

  if (
    locLat !== undefined &&
    locLat !== null &&
    locLng !== undefined &&
    locLng !== null &&
    !isNaN(Number(locLat)) &&
    !isNaN(Number(locLng)) &&
    (Number(locLat) !== 0 || Number(locLng) !== 0)
  ) {
    return [Number(locLat), Number(locLng)];
  }

  // 2. GeoJSON coordinates [longitude, latitude]
  if (
    center.location?.coordinates &&
    Array.isArray(center.location.coordinates) &&
    center.location.coordinates.length >= 2
  ) {
    const lng = Number(center.location.coordinates[0]);
    const lat = Number(center.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return [lat, lng];
    }
  }

  return null;
};
