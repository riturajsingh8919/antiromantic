"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils-admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();

    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchStats(false); // Don't show loading for background updates
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (showLoading = true, isManualRefresh = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      if (isManualRefresh) {
        setRefreshing(true);
      }

      const response = await fetch("/api/admin/dashboard/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      if (showLoading) {
        setError("Failed to fetch dashboard statistics");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchStats(false, true);
  };

  if (loading) {
    return (
      <div
        className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden"
        style={{ backgroundColor: "#efece3", minHeight: "100vh" }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome to your AntiRomantic admin dashboard
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden"
        style={{ backgroundColor: "#efece3", minHeight: "100vh" }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
        </div>
        <Card
          className="border border-gray-200"
          style={{ backgroundColor: "#efece3" }}
        >
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertTriangle
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: "#736c5f" }}
              />
              <h3 className="text-lg font-medium mb-2 text-gray-900">
                Error loading dashboard
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden"
      style={{ backgroundColor: "#efece3", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="w-full">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Welcome to your AntiRomantic admin dashboard
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="whitespace-nowrap">Live Data</span>
            </div>
            {lastUpdated && (
              <span className="text-xs whitespace-nowrap">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="h-7 sm:h-8 px-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <RefreshCw
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(stats.overview.thisMonthRevenue)}
          description="This month"
          icon={DollarSign}
          trendValue={stats.overview.revenueGrowth}
        />
        <StatsCard
          title="Orders"
          value={stats.overview.totalOrders.toLocaleString()}
          description={`${stats.orders.thisMonth} this month`}
          icon={ShoppingCart}
          trendValue={stats.overview.orderGrowth}
        />
        <StatsCard
          title="Products"
          value={stats.overview.totalProducts.toLocaleString()}
          description={`${stats.products.active} active`}
          icon={Package}
        />
        <StatsCard
          title="Customers"
          value={stats.overview.totalUsers.toLocaleString()}
          description="Total registered"
          icon={Users}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 w-full">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base text-muted-foreground truncate">
                Pending Orders
              </span>
              <Badge variant="secondary" className="flex-shrink-0">
                {stats.orders.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base text-muted-foreground truncate">
                Low Stock Products
              </span>
              <Badge variant="destructive" className="flex-shrink-0">
                {stats.products.lowStock}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base text-muted-foreground truncate">
                Out of Stock
              </span>
              <Badge variant="destructive" className="flex-shrink-0">
                {stats.products.outOfStock}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base text-muted-foreground truncate">
                Average Order Value
              </span>
              <span className="font-medium text-sm sm:text-base flex-shrink-0">
                {formatPrice(stats.overview.averageOrderValue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-muted rounded-md" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {product.salesCount} sold •{" "}
                      {formatPrice(product.basePrice)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">
                No sales data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <RecentOrders orders={stats.orders.recent} />
    </div>
  );
}
