"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDateTime, getStatusColor } from "@/lib/utils-admin";
import { ExternalLink } from "lucide-react";

export function RecentOrders({ orders = [] }) {
  console.log("Recent Orders:", orders);
  if (!orders.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base text-muted-foreground text-center py-4">
            No recent orders found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
          asChild
        >
          <Link href="/admin/orders">
            <span className="text-xs sm:text-sm">View All</span>
            <ExternalLink className="ml-1 sm:ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 border rounded-lg space-y-2 sm:space-y-0 w-full"
          >
            <div className="flex-1 min-w-0 space-y-1 sm:space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-medium text-sm sm:text-base truncate">
                  {order.orderNumber}
                </span>
                <Badge className="bg-transparent text-xs sm:text-sm border-gray-300 text-gray-600 self-start sm:self-auto">
                  {order.status}
                </Badge>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {formatDateTime(order.createdAt)}
              </div>
            </div>
            <div className="flex-shrink-0 text-left sm:text-right">
              <div className="font-medium text-sm sm:text-base">
                {formatPrice(order.total)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
