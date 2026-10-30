/**
 * Resolves safe, role-appropriate post-login redirect path while preserving query parameters
 * and preventing open redirects or cross-role access.
 */
export const resolveSafeRedirect = (from, userRole) => {
  if (!from) {
    if (userRole === "parent") return "/parent/dashboard";
    if (userRole === "provider") return "/provider/dashboard";
    if (userRole === "admin") return "/admin/dashboard";
    return "/";
  }

  // Handle both string and location object { pathname, search, hash }
  const targetPath =
    typeof from === "string"
      ? from
      : `${from.pathname || ""}${from.search || ""}${from.hash || ""}`;

  // Security: Prevent open redirects (must start with single "/" and not "//" or external protocol)
  if (
    !targetPath.startsWith("/") ||
    targetPath.startsWith("//") ||
    targetPath.includes("://")
  ) {
    return userRole === "parent"
      ? "/parent/dashboard"
      : userRole === "provider"
        ? "/provider/dashboard"
        : "/admin/dashboard";
  }

  const pathnameOnly = targetPath.split("?")[0].split("#")[0];

  // Prevent redirect loops back to auth pages
  if (
    ["/login", "/register", "/forgot-password", "/reset-password"].some(
      (authRoute) => pathnameOnly.startsWith(authRoute),
    )
  ) {
    return userRole === "parent"
      ? "/parent/dashboard"
      : userRole === "provider"
        ? "/provider/dashboard"
        : "/admin/dashboard";
  }

  // Prevent cross-role destination intrusion
  const isParentServiceRoute = (path) =>
    path.startsWith("/parent") ||
    path === "/centers" ||
    path.startsWith("/centers/") ||
    path === "/caregivers" ||
    path.startsWith("/caregivers/") ||
    path.startsWith("/book") ||
    path === "/matching";

  if (userRole === "parent") {
    if (
      pathnameOnly.startsWith("/provider") ||
      pathnameOnly.startsWith("/admin")
    ) {
      return "/parent/dashboard";
    }
    return targetPath;
  }

  if (userRole === "provider") {
    if (
      isParentServiceRoute(pathnameOnly) ||
      pathnameOnly.startsWith("/admin")
    ) {
      return "/provider/dashboard";
    }
    return targetPath;
  }

  if (userRole === "admin") {
    if (
      isParentServiceRoute(pathnameOnly) ||
      pathnameOnly.startsWith("/provider")
    ) {
      return "/admin/dashboard";
    }
    return targetPath;
  }

  return targetPath;
};
