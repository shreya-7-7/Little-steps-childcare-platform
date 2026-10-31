const RouteLoadingBar = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-amber-100/40 dark:bg-amber-950/40"
  >
    <div className="h-full w-1/3 animate-[pulse_1s_ease-in-out_infinite] bg-gradient-to-r from-[#FF9500] to-[#FFC300]" />
  </div>
);

export default RouteLoadingBar;
