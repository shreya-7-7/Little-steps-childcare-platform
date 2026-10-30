import {
  Users,
  Building2,
  House,
  CalendarDays,
  IndianRupee,
  CreditCard,
} from "lucide-react";

const OverviewCards = ({ data }) => {
  if (!data) return null;

  const cards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: Users,
    },
    {
      title: "Providers",
      value: data.totalProviders,
      icon: Building2,
    },
    {
      title: "Centers",
      value: data.totalCenters,
      icon: House,
    },
    {
      title: "Bookings",
      value: data.totalBookings,
      icon: CalendarDays,
    },
    {
      title: "Revenue",
      value: `₹${data.totalRevenue}`,
      icon: IndianRupee,
    },
    {
      title: "Payments",
      value: data.totalPayments,
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>

                <h2 className="mt-2 text-3xl font-bold">{card.value}</h2>
              </div>

              <div className="rounded-full bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewCards;
