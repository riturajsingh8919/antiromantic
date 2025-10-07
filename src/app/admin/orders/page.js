"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPrice, formatDateTime, getStatusColor } from "@/lib/utils-admin";
import {
  Package,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: "",
    paymentStatus: "",
    fulfillmentStatus: "",
    trackingNumber: "",
    notes: "",
    shippingMethod: "",
  });

  // Fetch orders
  const fetchOrders = useCallback(
    async (page = 1, status = statusFilter, search = searchTerm) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });

        if (status !== "all") params.append("status", status);
        if (search) params.append("search", search);

        const response = await fetch(`/api/admin/orders?${params}`);
        const result = await response.json();

        if (result.success) {
          setOrders(result.data);
          setStats(result.stats);
          setPagination(result.pagination);
        } else {
          toast.error(result.error || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
        toast.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, searchTerm]
  );

  // Update order
  const updateOrder = async (orderId, updateData) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Order updated successfully");
        fetchOrders(currentPage);
        setShowEditDialog(false);
        setEditingOrder(null);
      } else {
        toast.error(result.error || "Failed to update order");
      }
    } catch (error) {
      console.error("Update order error:", error);
      toast.error("Failed to update order");
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Order deleted successfully");
        fetchOrders(currentPage);
      } else {
        toast.error(result.error || "Failed to delete order");
      }
    } catch (error) {
      console.error("Delete order error:", error);
      toast.error("Failed to delete order");
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrder(orderId, { status: newStatus });
  };

  // Open edit dialog
  const openEditDialog = (order) => {
    setEditingOrder(order);
    setEditForm({
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      trackingNumber: order.trackingNumber || "",
      notes: order.notes || "",
      shippingMethod: order.shippingMethod,
    });
    setShowEditDialog(true);
  };

  // Handle edit form submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingOrder) {
      updateOrder(editingOrder._id, editForm);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1, statusFilter, searchTerm);
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrders(1, status, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrders(page);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
    { value: "partially_refunded", label: "Partially Refunded" },
  ];

  const fulfillmentStatusOptions = [
    { value: "unfulfilled", label: "Unfulfilled" },
    { value: "partial", label: "Partial" },
    { value: "fulfilled", label: "Fulfilled" },
  ];

  const shippingMethodOptions = [
    { value: "standard", label: "Standard" },
    { value: "express", label: "Express" },
    { value: "overnight", label: "Overnight" },
    { value: "pickup", label: "Pickup" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f4f2] to-[#e8e6e3] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-[#827C71] border-opacity-20">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#736c5f] mb-2">
              Orders Management
            </h1>
            <p className="text-[#827C71] text-base sm:text-base">
              Manage customer orders and fulfillment
            </p>
          </div>
          <div className="flex items-center gap-2 text-base text-[#827C71]">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Orders Summary Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-[#827C71] border-opacity-20 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base sm:text-base font-medium text-[#736c5f]">
                Total Orders
              </CardTitle>
              <div className="p-2 bg-[#91B3C7] bg-opacity-20 rounded-full">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[#736c5f]">
                {stats.total || 0}
              </div>
              <p className="text-base sm:text-base text-[#827C71] mt-1">
                {stats.today || 0} today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#827C71] border-opacity-20 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base sm:text-base font-medium text-[#736c5f]">
                Pending
              </CardTitle>
              <div className="p-2 bg-[#827C71] bg-opacity-20 rounded-full">
                <Package className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[#736c5f]">
                {stats.byStatus?.pending || 0}
              </div>
              <p className="text-base sm:text-base text-[#827C71] mt-1">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#827C71] border-opacity-20 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base sm:text-base font-medium text-[#736c5f]">
                This Month
              </CardTitle>
              <div className="p-2 bg-[#91B3C7] bg-opacity-15 rounded-full">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-[#736c5f]">
                {stats.monthly || 0}
              </div>
              <p className="text-base sm:text-base text-[#827C71] mt-1">
                Monthly orders
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#827C71] border-opacity-20 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base sm:text-base font-medium text-[#736c5f]">
                Revenue
              </CardTitle>
              <div className="p-2 bg-[#91B3C7] bg-opacity-25 rounded-full">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-[#736c5f]">
                {formatPrice(stats.revenue || 0)}
              </div>
              <p className="text-base sm:text-base text-[#827C71] mt-1">
                Total revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border-[#827C71] border-opacity-20 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search orders by number, email, or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 border-[#827C71] border-opacity-30 focus:border-[#91B3C7] focus:ring-[#91B3C7] text-[#736c5f] placeholder:text-[#827C71]"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10 hover:border-[#91B3C7]"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-48 border-[#827C71] border-opacity-30 focus:border-[#91B3C7] focus:ring-[#91B3C7] text-[#736c5f]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="bg-white border-[#827C71] border-opacity-20 shadow-lg">
          <CardHeader className="border-b border-[#827C71] border-opacity-10">
            <CardTitle className="text-lg sm:text-xl font-semibold text-[#736c5f] flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 px-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#91B3C7] mx-auto"></div>
                <p className="text-[#827C71] mt-4 text-base sm:text-base">
                  Loading orders...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="p-4 bg-[#91B3C7] bg-opacity-10 rounded-2xl w-fit mx-auto mb-4">
                  <ShoppingCart className="h-12 w-12 text-[#827C71] mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-[#736c5f]">
                  No orders found
                </h3>
                <p className="text-[#827C71] text-base sm:text-base max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters to see more results"
                    : "Orders will appear here once customers start purchasing from your store"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Orders List */}
                <div className="block lg:hidden">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white border border-[#827C71] border-opacity-20 rounded-xl p-4 m-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-[#736c5f] text-base">
                              {order.orderNumber}
                            </h3>
                            <p className="text-base text-[#827C71]">
                              {order.items.length} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#736c5f] text-base">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-base">
                          <div>
                            <p className="text-[#827C71] font-medium">
                              Customer
                            </p>
                            <p className="text-[#736c5f] truncate">
                              {order.customer?.username ||
                                `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#827C71] font-medium">Date</p>
                            <p className="text-[#736c5f]">
                              {formatDateTime(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={`bg-transparent border-transparent ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </Badge>
                          <Badge
                            className={`bg-transparent border-transparent ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="flex-1 text-base border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(order)}
                            className="flex-1 text-base border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="text-base"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}{" "}
                </div>

                {/* Desktop Orders Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="relative">
                      <tr className="border-b border-gray-300 border-opacity-20">
                        <th className="text-left p-4 text-[#736c5f] font-semibold text-base">
                          Order
                        </th>
                        <th className="text-left p-4 text-[#736c5f] font-semibold text-base">
                          Customer
                        </th>
                        <th className="text-left p-4 text-[#736c5f] font-semibold text-base">
                          Date
                        </th>
                        <th className="text-left p-4 text-[#736c5f] font-semibold text-base">
                          Status
                        </th>
                        <th className="text-left p-4 text-[#736c5f] font-semibold text-base">
                          Payment
                        </th>
                        <th className="text-left p-4 text-[#736c5f] font-semibold text-base">
                          Total
                        </th>
                        <th className="text-left p-4 text-[#736c5f] font-semibold text-base">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b border-gray-300 border-opacity-10 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-base text-[#736c5f]">
                                {order.orderNumber}
                              </div>
                              <div className="text-base text-[#827C71]">
                                {order.items.length} item(s)
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-base text-[#736c5f]">
                                {order.customer?.username ||
                                  `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                              </div>
                              <div className="text-base text-[#827C71]">
                                {order.customerEmail}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-base text-[#736c5f]">
                              {formatDateTime(order.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                handleStatusChange(order._id, value)
                              }
                            >
                              <SelectTrigger className="w-32 border-[#827C71]">
                                <SelectValue>
                                  <Badge
                                    className={`bg-transparent border-transparent ${getStatusColor(
                                      order.status
                                    )}`}
                                  >
                                    {order.status}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-white border-[#827C71] border-opacity-20">
                                {statusOptions.map((status) => (
                                  <SelectItem
                                    key={status.value}
                                    value={status.value}
                                    className="hover:bg-[#91B3C7] hover:bg-opacity-10 text-[#736c5f]"
                                  >
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={`bg-transparent border-transparent ${getStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-base text-[#736c5f]">
                              {formatPrice(order.total)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                    className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Order Details</DialogTitle>
                                    <DialogDescription>
                                      Order #{selectedOrder?.orderNumber}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-6">
                                      {/* Customer Info */}
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium mb-2">
                                            Customer Information
                                          </h4>
                                          <div className="space-y-1 text-base">
                                            <p>
                                              <strong>Name:</strong>{" "}
                                              {selectedOrder.customer
                                                ?.username ||
                                                `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName}`}
                                            </p>
                                            <p>
                                              <strong>Email:</strong>{" "}
                                              {selectedOrder.customerEmail}
                                            </p>
                                            <p>
                                              <strong>Phone:</strong>{" "}
                                              {selectedOrder.shippingAddress
                                                .phone || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">
                                            Order Summary
                                          </h4>
                                          <div className="space-y-1 text-base">
                                            <p>
                                              <strong>Order Date:</strong>{" "}
                                              {formatDateTime(
                                                selectedOrder.createdAt
                                              )}
                                            </p>
                                            <p>
                                              <strong>Status:</strong>{" "}
                                              <Badge
                                                className={`bg-transparent border-transparent ${getStatusColor(
                                                  selectedOrder.status
                                                )}`}
                                              >
                                                {selectedOrder.status}
                                              </Badge>
                                            </p>
                                            <p>
                                              <strong>Payment:</strong>{" "}
                                              <Badge
                                                className={`bg-transparent border-transparent ${getStatusColor(
                                                  selectedOrder.paymentStatus
                                                )}`}
                                              >
                                                {selectedOrder.paymentStatus}
                                              </Badge>
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Shipping Address */}
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Shipping Address
                                        </h4>
                                        <div className="text-base">
                                          <p>
                                            {
                                              selectedOrder.shippingAddress
                                                .firstName
                                            }{" "}
                                            {
                                              selectedOrder.shippingAddress
                                                .lastName
                                            }
                                          </p>
                                          <p>
                                            {
                                              selectedOrder.shippingAddress
                                                .address1
                                            }
                                          </p>
                                          {selectedOrder.shippingAddress
                                            .address2 && (
                                            <p>
                                              {
                                                selectedOrder.shippingAddress
                                                  .address2
                                              }
                                            </p>
                                          )}
                                          <p>
                                            {selectedOrder.shippingAddress.city}
                                            ,{" "}
                                            {
                                              selectedOrder.shippingAddress
                                                .state
                                            }{" "}
                                            {
                                              selectedOrder.shippingAddress
                                                .zipCode
                                            }
                                          </p>
                                          <p>
                                            {
                                              selectedOrder.shippingAddress
                                                .country
                                            }
                                          </p>
                                        </div>
                                      </div>

                                      {/* Order Items */}
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Order Items
                                        </h4>
                                        <div className="space-y-2">
                                          {selectedOrder.items.map(
                                            (item, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center gap-4 p-3 border rounded"
                                              >
                                                {item.product?.images?.[0] && (
                                                  <Image
                                                    src={
                                                      item.product.images[0].url
                                                    }
                                                    alt={item.productName}
                                                    width={64}
                                                    height={64}
                                                    className="w-16 h-16 object-cover rounded"
                                                  />
                                                )}
                                                <div className="flex-1">
                                                  <p className="font-medium">
                                                    {item.productName}
                                                  </p>
                                                  {item.variant?.size && (
                                                    <p className="text-base text-muted-foreground">
                                                      Size: {item.variant.size}
                                                    </p>
                                                  )}
                                                  <p className="text-base text-muted-foreground">
                                                    Qty: {item.quantity}
                                                  </p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="font-medium">
                                                    {formatPrice(
                                                      item.totalPrice
                                                    )}
                                                  </p>
                                                  <p className="text-base text-muted-foreground">
                                                    {formatPrice(item.price)}{" "}
                                                    each
                                                  </p>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>

                                      {/* Order Totals */}
                                      <div className="border-t pt-4">
                                        <div className="space-y-1 text-right">
                                          <p>
                                            Subtotal:{" "}
                                            {formatPrice(
                                              selectedOrder.subtotal
                                            )}
                                          </p>
                                          {selectedOrder.shipping > 0 && (
                                            <p>
                                              Shipping:{" "}
                                              {formatPrice(
                                                selectedOrder.shipping
                                              )}
                                            </p>
                                          )}
                                          {selectedOrder.tax > 0 && (
                                            <p>
                                              Tax:{" "}
                                              {formatPrice(selectedOrder.tax)}
                                            </p>
                                          )}
                                          {selectedOrder.discount > 0 && (
                                            <p>
                                              Discount: -
                                              {formatPrice(
                                                selectedOrder.discount
                                              )}
                                            </p>
                                          )}
                                          <p className="text-lg font-bold">
                                            Total:{" "}
                                            {formatPrice(selectedOrder.total)}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Tracking & Notes */}
                                      {(selectedOrder.trackingNumber ||
                                        selectedOrder.notes) && (
                                        <div className="border-t pt-4">
                                          {selectedOrder.trackingNumber && (
                                            <p>
                                              <strong>Tracking Number:</strong>{" "}
                                              {selectedOrder.trackingNumber}
                                            </p>
                                          )}
                                          {selectedOrder.notes && (
                                            <p>
                                              <strong>Notes:</strong>{" "}
                                              {selectedOrder.notes}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(order)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Order
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete order #
                                      {order.orderNumber}? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteOrder(order._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-base text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}(
                      {pagination.total} total orders)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Order Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-white border-[#827C71] border-opacity-20 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3 pb-4">
              <DialogTitle className="text-xl font-semibold text-[#736c5f]">
                Update Order
              </DialogTitle>
              <DialogDescription className="text-[#827C71]">
                Update order #{editingOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-base font-medium text-[#736c5f]"
                  >
                    Order Status
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, status: value })
                    }
                  >
                    <SelectTrigger className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#827C71] border-opacity-20">
                      {statusOptions.map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                          className="hover:bg-[#91B3C7] hover:bg-opacity-10 text-[#736c5f]"
                        >
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="paymentStatus"
                    className="text-base font-medium text-[#736c5f]"
                  >
                    Payment Status
                  </Label>
                  <Select
                    value={editForm.paymentStatus}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, paymentStatus: value })
                    }
                  >
                    <SelectTrigger className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#827C71] border-opacity-20">
                      {paymentStatusOptions.map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                          className="hover:bg-[#91B3C7] hover:bg-opacity-10 text-[#736c5f]"
                        >
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fulfillmentStatus"
                    className="text-base font-medium text-[#736c5f]"
                  >
                    Fulfillment Status
                  </Label>
                  <Select
                    value={editForm.fulfillmentStatus}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, fulfillmentStatus: value })
                    }
                  >
                    <SelectTrigger className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#827C71] border-opacity-20">
                      {fulfillmentStatusOptions.map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                          className="hover:bg-[#91B3C7] hover:bg-opacity-10 text-[#736c5f]"
                        >
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="shippingMethod"
                    className="text-base font-medium text-[#736c5f]"
                  >
                    Shipping Method
                  </Label>
                  <Select
                    value={editForm.shippingMethod}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, shippingMethod: value })
                    }
                  >
                    <SelectTrigger className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#827C71] border-opacity-20">
                      {shippingMethodOptions.map((method) => (
                        <SelectItem
                          key={method.value}
                          value={method.value}
                          className="hover:bg-[#91B3C7] hover:bg-opacity-10 text-[#736c5f]"
                        >
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="trackingNumber"
                  className="text-base font-medium text-[#736c5f]"
                >
                  Tracking Number
                </Label>
                <Input
                  id="trackingNumber"
                  value={editForm.trackingNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, trackingNumber: e.target.value })
                  }
                  placeholder="Enter tracking number"
                  className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7] placeholder:text-[#827C71] placeholder:text-opacity-60"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-base font-medium text-[#736c5f]"
                >
                  Admin Notes
                </Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="Add notes about this order"
                  rows={3}
                  className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7] placeholder:text-[#827C71] placeholder:text-opacity-60 resize-none"
                />
              </div>

              <DialogFooter className="gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#736c5f] hover:bg-[#827C71] text-white"
                >
                  Update Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
