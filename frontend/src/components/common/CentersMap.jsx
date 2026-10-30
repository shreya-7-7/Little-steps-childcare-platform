import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCenterCoordinates } from "../../utils/mapHelper";

export { getCenterCoordinates };

// Fix Leaflet default icon paths in bundler environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CentersMap = ({ centers = [], userLocation = null, className = "" }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Initialize and update map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const userIcon = L.divIcon({
      className: "custom-user-pin",
      html: `<div style="background-color: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.7);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Cleanup stale container reference if needed
    if (mapContainerRef.current._leaflet_id && !mapInstanceRef.current) {
      delete mapContainerRef.current._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      try {
        const defaultCenter = [22.5, 79.5]; // India geographical center
        const defaultZoom = userLocation ? 12 : 5;
        const initialCenter =
          userLocation && !isNaN(Number(userLocation.lat))
            ? [Number(userLocation.lat), Number(userLocation.lng)]
            : defaultCenter;

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: defaultZoom,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn("Leaflet map initialization notice:", err.message);
        return;
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    if (map._markerLayerGroup) {
      map.removeLayer(map._markerLayerGroup);
    }

    const markerGroup = L.featureGroup();
    map._markerLayerGroup = markerGroup;

    // 1. Add user location pin if active
    if (
      userLocation &&
      !isNaN(Number(userLocation.lat)) &&
      !isNaN(Number(userLocation.lng))
    ) {
      const userMarker = L.marker(
        [Number(userLocation.lat), Number(userLocation.lng)],
        { icon: userIcon },
      ).bindPopup(
        `<div style="font-family: inherit; font-size: 13px; font-weight: 600; color: #1e40af; padding: 2px;">
          📍 Your Current Location
        </div>`,
      );
      markerGroup.addLayer(userMarker);
    }

    // 2. Add center markers
    centers.forEach((center) => {
      const coords = getCenterCoordinates(center);
      if (!coords) return;

      const [lat, lng] = coords;
      const marker = L.marker([lat, lng]);

      const centerUrl = `/centers/${center.slug || center._id}`;
      const centerName = center.centerName || center.name || "Childcare Center";
      const city = center.city
        ? `${center.city}${center.state ? `, ${center.state}` : ""}`
        : "";
      const fee = center.monthlyFee ? `₹${center.monthlyFee}/month` : "";
      const rating =
        center.rating && center.rating > 0 ? `★ ${center.rating}` : "★ New";
      const distanceBadge =
        center.distanceKm !== null && center.distanceKm !== undefined
          ? `<span style="display: inline-block; background-color: #ffedd5; color: #9a3412; font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 9999px; margin-bottom: 4px;">${center.distanceKm} km away</span>`
          : "";

      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; max-width: 230px; line-height: 1.4;">
          ${distanceBadge}
          <h4 style="margin: 0 0 4px 0; font-weight: 700; color: #1e293b; font-size: 14px;">${centerName}</h4>
          ${city ? `<p style="margin: 0 0 3px 0; color: #64748b; font-size: 12px;">📍 ${city}</p>` : ""}
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 4px 0 8px 0;">
            <span style="color: #d97706; font-weight: 600; font-size: 12px;">${rating}</span>
            ${fee ? `<span style="color: #0f766e; font-weight: 700; font-size: 12px;">${fee}</span>` : ""}
          </div>
          <a href="${centerUrl}" id="center-map-btn-${center._id}" style="display: block; text-align: center; background: linear-gradient(to right, #ff9500, #ffc300); color: #241c0f; padding: 6px 12px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            View Details & Book
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`center-map-btn-${center._id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            navigate(centerUrl);
          };
        }
      });

      markerGroup.addLayer(marker);
    });

    markerGroup.addTo(map);

    // Adjust view bounds to fit markers
    const layers = markerGroup.getLayers();
    if (layers.length > 1) {
      map.fitBounds(markerGroup.getBounds().pad(0.18));
    } else if (layers.length === 1) {
      const singleLayer = layers[0];
      if (singleLayer.getLatLng) {
        map.setView(singleLayer.getLatLng(), 13);
      }
    } else if (userLocation) {
      map.setView([Number(userLocation.lat), Number(userLocation.lng)], 12);
    }

    // Leaflet tile resize recalculation
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [centers, userLocation, navigate]);

  // Clean unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        delete mapContainerRef.current._leaflet_id;
      }
    };
  }, []);

  const validMarkersCount = centers.filter(getCenterCoordinates).length;

  return (
    <div
      className={`relative flex flex-col rounded-2xl overflow-hidden border border-[#F0E1BE] bg-white shadow-xs dark:border-[#3A2E17] dark:bg-[#1C160C] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#FFFDF9] border-b border-[#F0E1BE] text-xs text-[#6B5D45] dark:bg-[#211B10] dark:border-[#3A2E17] dark:text-[#C9B896]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#FF9500]" />
          <span className="font-semibold text-[#241C0F] dark:text-[#FFF6E2]">
            Childcare Center Map (OpenStreetMap)
          </span>
          <span className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
            {validMarkersCount} center{validMarkersCount === 1 ? "" : "s"} plotted
          </span>
        </div>

        {userLocation && (
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium text-[11px]">
            <Navigation className="w-3.5 h-3.5 animate-pulse" />
            <span>GPS Proximity Centered</span>
          </div>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-[380px] sm:h-[420px] z-0"
        style={{ minHeight: "360px" }}
      />
    </div>
  );
};

export default CentersMap;
