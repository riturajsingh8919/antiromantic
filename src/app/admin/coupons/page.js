"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    couponCode: "",
    discountType: "percentage",
    discountValue: "",
    status: true,
    startDate: "",
    endDate: "",
    usageLimit: "",
    perUserLimit: "",
    description: "",
  });

  // Fetch coupons
  const fetchCoupons = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "3",
        });

        if (searchTerm) params.append("search", searchTerm);
        if (statusFilter !== "all") params.append("status", statusFilter);

        const response = await fetch(`/api/admin/coupons?${params}`);
        const data = await response.json();

        if (data.success) {
          setCoupons(data.data.coupons);
          setTotalPages(data.data.pagination.totalPages);
          setCurrentPage(data.data.pagination.currentPage);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to fetch coupons");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, statusFilter]
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCoupons(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCoupons]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit
          ? parseInt(formData.perUserLimit)
          : null,
      };

      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon._id}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingCoupon
            ? "Coupon updated successfully!"
            : "Coupon created successfully!"
        );
        setIsDialogOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to save coupon");
      }
    } catch (error) {
      console.error("Error submitting coupon:", error);
      toast.error("Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  // Toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Coupon status updated!");
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      couponCode: "",
      discountType: "percentage",
      discountValue: "",
      status: true,
      startDate: "",
      endDate: "",
      usageLimit: "",
      perUserLimit: "",
      description: "",
    });
    setEditingCoupon(null);
  };

  // Open edit dialog
  const openEditDialog = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      couponCode: coupon.couponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      status: coupon.status,
      startDate: new Date(coupon.startDate).toISOString().split("T")[0],
      endDate: new Date(coupon.endDate).toISOString().split("T")[0],
      usageLimit: coupon.usageLimit?.toString() || "",
      perUserLimit: coupon.perUserLimit?.toString() || "",
      description: coupon.description || "",
    });
    setIsDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if coupon is expired
  const isExpired = (endDate) => {
    return new Date() > new Date(endDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Coupon Management</h1>
          <p className="text-base sm:text-base text-muted-foreground">
            Create and manage discount coupons for your store
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
              <DialogDescription className="text-base sm:text-base">
                {editingCoupon
                  ? "Update the coupon details below."
                  : "Fill in the details to create a new discount coupon."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label
                    htmlFor="couponCode"
                    className="text-base sm:text-base font-semibold"
                  >
                    Coupon Code *
                  </Label>
                  <Input
                    id="couponCode"
                    value={formData.couponCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        couponCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., SAVE10"
                    required
                    className="text-base sm:text-base h-10 sm:h-12 mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="discountType"
                    className="text-base sm:text-base font-semibold"
                  >
                    Discount Type *
                  </Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger className="text-base sm:text-base h-10 sm:h-12 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="discountValue"
                  className="text-base sm:text-base font-semibold"
                >
                  Discount Value *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step={formData.discountType === "percentage" ? "1" : "0.01"}
                  min="0"
                  max={
                    formData.discountType === "percentage" ? "100" : undefined
                  }
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder={
                    formData.discountType === "percentage"
                      ? "e.g., 10"
                      : "e.g., 25.00"
                  }
                  required
                  className="text-base sm:text-base h-10 sm:h-12 mt-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label
                    htmlFor="startDate"
                    className="text-base sm:text-base font-semibold"
                  >
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="text-base sm:text-base h-10 sm:h-12 mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="endDate"
                    className="text-base sm:text-base font-semibold"
                  >
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                    className="text-base sm:text-base h-10 sm:h-12 mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label
                    htmlFor="usageLimit"
                    className="text-base sm:text-base font-semibold"
                  >
                    Usage Limit (Optional)
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                    min="1"
                    className="text-base sm:text-base h-10 sm:h-12 mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="perUserLimit"
                    className="text-base sm:text-base font-semibold"
                  >
                    Per User Limit (Optional)
                  </Label>
                  <Input
                    id="perUserLimit"
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, perUserLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                    min="1"
                    className="text-base sm:text-base h-10 sm:h-12 mt-2"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-base sm:text-base font-semibold"
                >
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description for the coupon"
                  maxLength={200}
                  className="text-base sm:text-base min-h-[80px] sm:min-h-[100px] mt-2 resize-none"
                />
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto text-base sm:text-base px-4 sm:px-6 h-10 sm:h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto text-base sm:text-base px-4 sm:px-6 h-10 sm:h-12"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCoupon ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingCoupon ? "Update" : "Create"} Coupon</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-11">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Coupons ({coupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No coupons found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-mono text-base">
                              {coupon.couponCode}
                            </p>
                            {coupon.description && (
                              <p className="text-base text-muted-foreground mt-1">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {coupon.discountType === "percentage" ? "%" : "$"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={coupon.status}
                              onCheckedChange={() =>
                                handleToggleStatus(coupon._id, coupon.status)
                              }
                              size="sm"
                            />
                            <Badge
                              variant={
                                !coupon.status
                                  ? "secondary"
                                  : isExpired(coupon.endDate)
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {!coupon.status
                                ? "Inactive"
                                : isExpired(coupon.endDate)
                                ? "Expired"
                                : "Active"}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-base">
                            <p>{formatDate(coupon.startDate)}</p>
                            <p className="text-muted-foreground">
                              to {formatDate(coupon.endDate)}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-base">
                            <p>Used: {coupon.usedCount}</p>
                            {coupon.usageLimit && (
                              <p className="text-muted-foreground">
                                Limit: {coupon.usageLimit}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(coupon._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="border rounded-lg p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-mono text-base font-semibold">
                            {coupon.couponCode}
                          </h3>
                          <Badge variant="secondary" className="text-base">
                            {coupon.discountType === "percentage" ? "%" : "$"}
                          </Badge>
                        </div>
                        <p className="text-lg font-medium text-primary">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}{" "}
                          OFF
                        </p>
                        {coupon.description && (
                          <p className="text-base text-muted-foreground mt-1 line-clamp-2">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(coupon._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={coupon.status}
                          onCheckedChange={() =>
                            handleToggleStatus(coupon._id, coupon.status)
                          }
                          size="sm"
                        />
                        <Badge
                          variant={
                            !coupon.status
                              ? "secondary"
                              : isExpired(coupon.endDate)
                              ? "destructive"
                              : "default"
                          }
                          className="text-base"
                        >
                          {!coupon.status
                            ? "Inactive"
                            : isExpired(coupon.endDate)
                            ? "Expired"
                            : "Active"}
                        </Badge>
                      </div>
                      <div className="text-base text-muted-foreground">
                        Used: {coupon.usedCount}
                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                      </div>
                    </div>

                    <div className="text-base text-muted-foreground border-t pt-2">
                      <div className="flex justify-between">
                        <span>Valid from {formatDate(coupon.startDate)}</span>
                        <span>to {formatDate(coupon.endDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => fetchCoupons(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-2 sm:px-4 text-base">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => fetchCoupons(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
