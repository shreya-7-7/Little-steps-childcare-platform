import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Navigation,
  MapPin,
  Map,
  X,
  Loader2,
  Search,
  Clock,
  Moon,
  HeartPulse,
  RotateCcw,
  Compass,
} from "lucide-react";

import { getCenters } from "../../services/centerService";

import CenterCard from "../../components/parent/CenterCard";
import CentersMap from "../../components/common/CentersMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AGE_GROUPS = [
  { label: "All Age Groups", value: "" },
  { label: "Infant (0-1 yrs)", value: "Infant" },
  { label: "Toddler (1-3 yrs)", value: "Toddler" },
  { label: "Preschool (3-5 yrs)", value: "Preschool" },
  { label: "School Age (5+ yrs)", value: "School Age" },
];

const PRICE_OPTIONS = [
  { label: "Any Budget", value: "" },
  { label: "Under ₹5,000 / mo", value: "5000" },
  { label: "Under ₹10,000 / mo", value: "10000" },
  { label: "Under ₹15,000 / mo", value: "15000" },
  { label: "Under ₹25,000 / mo", value: "25000" },
];

const CITY_PRESETS = [
  { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
];

const Centers = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [showManualCities, setShowManualCities] = useState(false);
  const [radiusKm, setRadiusKm] = useState(50);
  const [isNearby, setIsNearby] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Discovery Filter States initialized from URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(
    searchParams.get("ageGroup") || "",
  );
  const [is24HoursOnly, setIs24HoursOnly] = useState(
    searchParams.get("is24Hours") === "true",
  );
  const [isOvernightOnly, setIsOvernightOnly] = useState(
    searchParams.get("shift") === "overnight" || searchParams.get("isOvernight") === "true",
  );
  const [emergencyCareOnly, setEmergencyCareOnly] = useState(
    searchParams.get("emergencyCare") === "true",
  );
  const [maxMonthlyPrice, setMaxMonthlyPrice] = useState(
    searchParams.get("maxPrice") || "",
  );

  const buildParams = (overrides = {}) => {
    const params = {};

    const search =
      overrides.search !== undefined ? overrides.search : searchTerm;
    const age =
      overrides.ageGroup !== undefined ? overrides.ageGroup : selectedAgeGroup;
    const is24 =
      overrides.is24Hours !== undefined ? overrides.is24Hours : is24HoursOnly;
    const overnight =
      overrides.isOvernight !== undefined ? overrides.isOvernight : isOvernightOnly;
    const emergency =
      overrides.emergencyCare !== undefined
        ? overrides.emergencyCare
        : emergencyCareOnly;
    const price =
      overrides.maxPrice !== undefined ? overrides.maxPrice : maxMonthlyPrice;
    const loc =
      overrides.userLocation !== undefined ? overrides.userLocation : userLocation;
    const rad =
      overrides.radius !== undefined ? overrides.radius : radiusKm;

    if (search && search.trim()) params.search = search.trim();
    if (age) params.ageGroup = age;
    if (is24) params.is24Hours = true;
    if (overnight) params.shift = "overnight";
    if (emergency) params.emergencyCare = true;
    if (price) params.maxPrice = price;

    if (loc) {
      params.lat = loc.lat;
      params.lng = loc.lng;
      params.radius = rad;
    }

    return params;
  };

  const fetchCenters = async (params = {}) => {
    try {
      setLoading(true);
      const data = await getCenters(params);
      setCenters(data.centers || []);
      setIsNearby(Boolean(data.isNearbySearch));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load centers");
    } finally {
      setLoading(false);
    }
  };

  // Sync initial query params on mount
  useEffect(() => {
    const initialParams = {};
    if (searchTerm) initialParams.search = searchTerm;
    if (selectedAgeGroup) initialParams.ageGroup = selectedAgeGroup;
    if (is24HoursOnly) initialParams.is24Hours = true;
    if (isOvernightOnly) initialParams.shift = "overnight";
    if (emergencyCareOnly) initialParams.emergencyCare = true;
    if (maxMonthlyPrice) initialParams.maxPrice = maxMonthlyPrice;

    // Check if URL has coordinates
    const urlLat = searchParams.get("lat");
    const urlLng = searchParams.get("lng");
    const urlRad = searchParams.get("radius");
    if (urlLat && urlLng && !isNaN(Number(urlLat)) && !isNaN(Number(urlLng))) {
      const loc = { lat: Number(urlLat), lng: Number(urlLng) };
      setUserLocation(loc);
      setLocationLabel("Target Location");
      initialParams.lat = loc.lat;
      initialParams.lng = loc.lng;
      initialParams.radius = urlRad ? Number(urlRad) : 50;
    }

    fetchCenters(initialParams);
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. Please select a city below.");
      setShowManualCities(true);
      return;
    }

    setLocating(true);
    setShowManualCities(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);
        setLocationLabel("Current GPS Location");
        setLocating(false);

        fetchCenters(buildParams({ userLocation: location, radius: radiusKm }));
        toast.success(`Location acquired. Showing nearby centers within ${radiusKm} km.`);
      },
      (error) => {
        setLocating(false);
        setShowManualCities(true);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "GPS permission was denied. Select a city below for nearby discovery.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location unavailable. Choose a city below to discover centers.");
            break;
          case error.TIMEOUT:
            toast.error("GPS request timed out. Select your city below to continue.");
            break;
          default:
            toast.error("Could not obtain GPS. Select a city below.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const handleSelectCityPreset = (city) => {
    const loc = { lat: city.lat, lng: city.lng };
    setUserLocation(loc);
    setLocationLabel(city.name);
    setShowManualCities(false);
    fetchCenters(buildParams({ userLocation: loc, radius: radiusKm }));
    toast.success(`Centered on ${city.name} (within ${radiusKm} km).`);
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
    if (userLocation) {
      fetchCenters(buildParams({ radius: newRadius }));
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setLocationLabel("");
    setIsNearby(false);
    setShowManualCities(false);
    fetchCenters(buildParams({ userLocation: null }));
    toast.info("Cleared location filter. Showing all verified centers.");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();

    // Check if the query matches a recognized city preset (e.g. Kanpur, Lucknow)
    const matchedCity = CITY_PRESETS.find(
      (c) =>
        c.name.toLowerCase() === query ||
        query.includes(c.name.toLowerCase()),
    );

    if (matchedCity) {
      const loc = { lat: matchedCity.lat, lng: matchedCity.lng };
      setUserLocation(loc);
      setLocationLabel(matchedCity.name);
      fetchCenters(buildParams({ userLocation: loc, search: "", radius: radiusKm }));
      toast.success(
        `Centres around ${matchedCity.name} within ${radiusKm} km radius.`,
      );
    } else {
      fetchCenters(buildParams({ search: searchTerm }));
    }
  };

  const handleAgeGroupChange = (value) => {
    setSelectedAgeGroup(value);
    fetchCenters(buildParams({ ageGroup: value }));
  };

  const handlePriceChange = (value) => {
    setMaxMonthlyPrice(value);
    fetchCenters(buildParams({ maxPrice: value }));
  };

  const handle24HoursToggle = () => {
    const nextVal = !is24HoursOnly;
    setIs24HoursOnly(nextVal);
    fetchCenters(buildParams({ is24Hours: nextVal }));
  };

  const handleOvernightToggle = () => {
    const nextVal = !isOvernightOnly;
    setIsOvernightOnly(nextVal);
    fetchCenters(buildParams({ isOvernight: nextVal }));
  };

  const handleEmergencyToggle = () => {
    const nextVal = !emergencyCareOnly;
    setEmergencyCareOnly(nextVal);
    fetchCenters(buildParams({ emergencyCare: nextVal }));
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedAgeGroup("");
    setIs24HoursOnly(false);
    setIsOvernightOnly(false);
    setEmergencyCareOnly(false);
    setMaxMonthlyPrice("");

    const params = {};
    if (userLocation) {
      params.lat = userLocation.lat;
      params.lng = userLocation.lng;
      params.radius = radiusKm;
    }
    fetchCenters(params);
    toast.info("Filters reset to default.");
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedAgeGroup ||
      is24HoursOnly ||
      isOvernightOnly ||
      emergencyCareOnly ||
      maxMonthlyPrice,
  );

  return (
    <div className="space-y-6">
      {/* Top Banner and Location Control */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#F0E1BE] bg-[#FFFDF9] p-6 shadow-sm dark:border-[#3A2E17] dark:bg-[#1C160C] md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#241C0F] dark:text-[#FFF6E2] md:text-3xl"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Childcare Centers
          </h1>
          <p className="text-sm text-[#6B5D45] dark:text-[#C9B896] mt-1">
            {isNearby
              ? `Showing centers ordered by genuine proximity to ${locationLabel || "your location"} (within ${radiusKm} km).`
              : "Discover licensed, background-verified childcare centers across all regions."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Map View Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            className="rounded-xl border-[#F0E1BE] bg-white text-xs font-semibold text-[#241C0F] hover:bg-orange-50 dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2]"
          >
            <Map className="mr-1.5 h-3.5 w-3.5 text-orange-600" />
            {showMap ? "Hide Map" : "Show Map"}
          </Button>

          {userLocation ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                <MapPin className="h-3.5 w-3.5" />
                {locationLabel || "Location Active"}
              </span>

              <select
                aria-label="Proximity search radius"
                value={radiusKm}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="rounded-xl border border-[#F0E1BE] bg-white px-3 py-1.5 text-xs font-medium text-[#241C0F] dark:border-[#3A2E17] dark:bg-[#211B10] dark:text-[#FFF6E2]"
              >
                <option value={10}>10 km radius</option>
                <option value={25}>25 km radius</option>
                <option value={50}>50 km radius</option>
                <option value={100}>100 km radius</option>
                <option value={250}>250 km radius</option>
                <option value={500}>500 km radius</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLocation}
                className="rounded-xl border-[#F0E1BE] text-xs dark:border-[#3A2E17]"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleNearMe}
                disabled={locating}
                className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90 shadow-sm"
              >
                {locating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Acquiring GPS...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Find Centers Near Me
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualCities(!showManualCities)}
                className="rounded-xl border-[#F0E1BE] text-xs font-medium dark:border-[#3A2E17]"
              >
                <Compass className="mr-1.5 h-3.5 w-3.5 text-[#FF9500]" />
                Select City
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Manual City Selection Fallback (When GPS denied or requested) */}
      {showManualCities && !userLocation && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Quick City Selection (GPS Fallback)
            </p>
            <button
              onClick={() => setShowManualCities(false)}
              className="text-amber-700 hover:text-amber-900 text-xs font-medium"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CITY_PRESETS.map((city) => (
              <button
                key={city.name}
                onClick={() => handleSelectCityPreset(city)}
                className="rounded-xl bg-white dark:bg-[#211B10] border border-amber-300 dark:border-amber-800 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-2xs"
              >
                📍 {city.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Discovery Filters Bar */}
      <div className="rounded-2xl border border-[#F0E1BE] bg-white p-4 shadow-sm dark:border-[#3A2E17] dark:bg-[#211B10]">
        <div className="flex flex-col gap-3">
          {/* Search Row */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5D45] dark:text-[#C9B896]" />
              <Input
                placeholder="Search by center name, city, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-[#F0E1BE] focus-visible:ring-[#FF9500] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
              />
            </div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F] hover:opacity-90"
            >
              Search
            </Button>
          </form>

          {/* Filter Options Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Age Group Filter */}
            <select
              aria-label="Filter centers by age group"
              value={selectedAgeGroup}
              onChange={(e) => handleAgeGroupChange(e.target.value)}
              className="rounded-xl border border-[#F0E1BE] bg-white px-3 py-1.5 text-xs font-medium text-[#241C0F] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
            >
              {AGE_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>

            {/* Max Monthly Price Filter */}
            <select
              aria-label="Filter centers by monthly fee"
              value={maxMonthlyPrice}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="rounded-xl border border-[#F0E1BE] bg-white px-3 py-1.5 text-xs font-medium text-[#241C0F] dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
            >
              {PRICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* 24-Hour Care Toggle */}
            <button
              type="button"
              onClick={handle24HoursToggle}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                is24HoursOnly
                  ? "border-[#FF9500] bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                  : "border-[#F0E1BE] bg-white text-[#241C0F] hover:bg-orange-50 dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              24/7 Open Only
            </button>

            {/* Overnight Care Toggle */}
            <button
              type="button"
              onClick={handleOvernightToggle}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                isOvernightOnly
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-[#F0E1BE] bg-white text-[#241C0F] hover:bg-orange-50 dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
              Overnight / Night Care
            </button>

            {/* Emergency Care Toggle */}
            <button
              type="button"
              onClick={handleEmergencyToggle}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                emergencyCareOnly
                  ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  : "border-[#F0E1BE] bg-white text-[#241C0F] hover:bg-orange-50 dark:border-[#3A2E17] dark:bg-[#2A2210] dark:text-[#FFF6E2]"
              }`}
            >
              <HeartPulse className="h-3.5 w-3.5" />
              Emergency Care
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 rounded-xl px-2.5 text-xs text-[#6B5D45] hover:text-[#241C0F] dark:text-[#C9B896] dark:hover:text-[#FFF6E2]"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Map View — Kept reliably visible whenever showMap is enabled */}
      {showMap && (
        <CentersMap
          centers={centers}
          userLocation={userLocation}
          className="mb-2"
        />
      )}

      {/* Proximity Banner when nearby search is active, or Location Prompt when inactive */}
      {isNearby ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 text-sm text-orange-800 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-300">
          Showing verified childcare centers ordered by genuine geographic distance (Haversine formula). Registered coordinates are mapped above.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 shrink-0 text-[#FF9500]" />
            <span>
              <strong>Location filter inactive:</strong> Currently displaying national childcare facilities. Select your city (e.g. <strong>Kanpur</strong>, <strong>Lucknow</strong>) or use GPS to view genuine local recommendations.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setShowManualCities(true)}
              className="h-7 rounded-lg bg-[#FF9500] px-3 text-xs font-semibold text-[#241C0F] hover:bg-[#FFC300]"
            >
              Choose City
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNearMe}
              disabled={locating}
              className="h-7 rounded-lg border-amber-300 text-xs dark:border-amber-800"
            >
              Use GPS
            </Button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {loading ? (
        <div className="rounded-2xl border border-[#F0E1BE] bg-white/60 p-12 text-center flex flex-col items-center justify-center gap-3 dark:border-[#3A2E17] dark:bg-[#1C160C]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9500]" />
          <p className="text-sm font-medium text-[#6B5D45] dark:text-[#C9B896]">
            Searching childcare centers...
          </p>
        </div>
      ) : centers.length === 0 ? (
        <div className="rounded-2xl border border-[#F0E1BE] bg-white p-10 text-center dark:border-[#3A2E17] dark:bg-[#211B10]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/40">
            <MapPin className="h-6 w-6 text-[#FF9500]" />
          </div>
          <h2 className="text-xl font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            {isNearby
              ? `No childcare centres within ${radiusKm} km of ${locationLabel || "your location"}`
              : "No centres match your criteria"}
          </h2>
          <p className="mt-2 text-sm text-[#6B5D45] dark:text-[#C9B896] max-w-lg mx-auto">
            {hasActiveFilters
              ? "Try adjusting or resetting your search filters to view more centres."
              : isNearby
                ? `No registered childcare facilities were found within a ${radiusKm} km radius. ${
                    radiusKm < 100
                      ? "Try expanding your proximity radius to 100 km (e.g. to include centres between Kanpur and Lucknow)."
                      : "Try choosing a neighbouring city or browsing all national centres."
                  }`
                : "No childcare centres are available right now."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isNearby && radiusKm < 100 && (
              <Button
                onClick={() => handleRadiusChange(100)}
                className="rounded-xl bg-gradient-to-r from-[#FF9500] to-[#FFC300] font-semibold text-[#241C0F]"
              >
                Expand Radius to 100 km
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-xl border-[#F0E1BE]"
              >
                Clear Search Filters
              </Button>
            )}
            {isNearby && (
              <Button
                variant="outline"
                onClick={() => setShowManualCities(true)}
                className="rounded-xl border-[#F0E1BE]"
              >
                Select Neighbouring City
              </Button>
            )}
            {isNearby && (
              <Button
                variant="outline"
                onClick={handleClearLocation}
                className="rounded-xl border-[#F0E1BE]"
              >
                Browse All National Centres
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {centers.map((center) => (
            <CenterCard key={center._id} center={center} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Centers;
