"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  UserPlus,
  Calendar,
  Search,
  Trash2,
  Mail,
  Phone,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";

export default function AdminCustomersPage() {
  const router = useRouter();

  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, verified, unverified
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    todayUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
  });

  // Dialog states - Edit functionality removed

  // Error and success states
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Fetch users and statistics
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/customers");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setStatistics(data.data.statistics);
        setFilteredUsers(data.data.users);
      } else {
        setErrors({ fetch: data.error || "Failed to fetch users" });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrors({ fetch: "Network error while fetching users" });
    } finally {
      setLoading(false);
    }
  };

  // Filter and search users
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => {
        if (filterStatus === "verified") return user.isEmailVerified;
        if (filterStatus === "unverified") return !user.isEmailVerified;
        return true;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, filterStatus]);

  // Pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      setDeletingUserId(userId);
      const response = await fetch(`/api/admin/customers/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Customer deleted successfully!");
        fetchUsers(); // Refresh the list
      } else {
        setErrors({ delete: data.error || "Failed to delete customer" });
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      setErrors({ delete: "Network error while deleting customer" });
    } finally {
      setDeletingUserId(null);
    }
  };

  // Export customers to CSV
  const exportCustomers = () => {
    try {
      // Use filtered customers (all matching search/filter criteria, not just current page)
      let exportData = filteredUsers;

      // Create comprehensive CSV content with all user details
      const headers = [
        "Username",
        "Email",
        "Phone",
        "First Name",
        "Last Name",
        "Address",
        "Address 2",
        "City",
        "State",
        "Pincode",
        "Email Verified",
        "Role",
        "Avatar URL",
        "Wishlist Items",
        "Joined Date",
        "Joined Time",
        "Last Updated Date",
        "Last Updated Time",
        "Account Age (Days)",
      ];

      const csvContent = [
        headers.join(","),
        ...exportData.map((user) => {
          const createdDate = new Date(user.createdAt);
          const updatedDate = new Date(user.updatedAt);
          const accountAgeDays = Math.floor(
            (new Date() - createdDate) / (1000 * 60 * 60 * 24)
          );

          return [
            `"${user.username || "N/A"}"`,
            `"${user.email || "N/A"}"`,
            `"${user.phone || "N/A"}"`,
            `"${user.firstName || "N/A"}"`,
            `"${user.lastName || "N/A"}"`,
            `"${user.address || "N/A"}"`,
            `"${user.address2 || "N/A"}"`,
            `"${user.city || "N/A"}"`,
            `"${user.state || "N/A"}"`,
            `"${user.pincode || "N/A"}"`,
            `"${user.isEmailVerified ? "Yes" : "No"}"`,
            `"${user.role || "user"}"`,
            `"${user.avatar?.url || "N/A"}"`,
            `"${user.wishlist?.length || 0}"`,
            `"${createdDate.toLocaleDateString()}"`,
            `"${createdDate.toLocaleTimeString()}"`,
            `"${updatedDate.toLocaleDateString()}"`,
            `"${updatedDate.toLocaleTimeString()}"`,
            `"${accountAgeDays}"`,
          ].join(",");
        }),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `customers_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setSuccessMessage("Customer data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      setErrors({ export: "Failed to export customer data" });
    }
  };

  // Refresh customer data
  const refreshData = async () => {
    setSuccessMessage("Refreshing customer data...");
    await fetchUsers();
    setSuccessMessage("Customer data refreshed successfully!");
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#91B3C7]" />
            <p className="text-[#827C71]">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#736c5f]">
            Customer Management
          </h1>
          <p className="text-[#827C71] mt-2">
            Monitor and manage your customers
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => refreshData()}
            variant="outline"
            className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => exportCustomers()}
            variant="outline"
            className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {Object.values(errors).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#827C71] border-opacity-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-[#827C71]">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-[#91B3C7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#736c5f]">
              {statistics.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#827C71] border-opacity-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-[#827C71]">
              New Today
            </CardTitle>
            <UserPlus className="h-4 w-4 text-[#91B3C7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#736c5f]">
              {statistics.todayUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#827C71] border-opacity-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-[#827C71]">
              Verified
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#736c5f]">
              {statistics.verifiedUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#827C71] border-opacity-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-[#827C71]">
              Unverified
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#736c5f]">
              {statistics.unverifiedUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 border-[#827C71] border-opacity-20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#827C71] h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[#827C71] border-opacity-30 rounded-md focus:ring-[#91B3C7] focus:border-[#91B3C7] bg-white text-[#736c5f]"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table/Cards */}
      <Card className="border-[#827C71] border-opacity-20">
        <CardHeader>
          <CardTitle className="text-[#736c5f]">
            Customers ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-[#827C71]">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No customers found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 border border-[#827C71] border-opacity-20 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-[#736c5f]">
                          {user.username}
                        </h3>
                        {user.isEmailVerified ? (
                          <Badge className="bg-transparent border-transparent text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-transparent border-transparent text-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-[#827C71]">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>

                        {(user.firstName || user.lastName) && (
                          <div className="flex items-center gap-1 text-sm text-[#827C71]">
                            <Users className="h-3 w-3" />
                            <span>
                              {[user.firstName, user.lastName]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          </div>
                        )}

                        {(user.city || user.state) && (
                          <div className="flex items-center gap-1 text-sm text-[#827C71]">
                            <span className="text-xs">📍</span>
                            <span>
                              {[user.city, user.state]
                                .filter(Boolean)
                                .join(", ")}
                              {user.pincode && ` - ${user.pincode}`}
                            </span>
                          </div>
                        )}

                        {user.wishlist && user.wishlist.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-[#827C71]">
                            <span className="text-xs">❤️</span>
                            <span>
                              {user.wishlist.length} item
                              {user.wishlist.length !== 1 ? "s" : ""} in
                              wishlist
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-sm text-[#827C71]">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 lg:mt-0">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingUserId === user._id}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
                          >
                            {deletingUserId === user._id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-[#827C71] border-opacity-20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#736c5f]">
                              Delete Customer
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[#827C71]">
                              Are you sure you want to delete customer &quot;
                              {user.username}&quot;? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t border-[#827C71] border-opacity-20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                  >
                    Previous
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-[#736c5f] hover:bg-[#827C71] text-white"
                              : "border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                          }
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
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
