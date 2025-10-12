"use client";
import { useAuth, withAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import {
  User,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Edit,
  Save,
  X,
} from "lucide-react";

function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (result.success) {
          setOrders(result.data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN");
  };

  const getLatestAddress = () => {
    return orders.length > 0 ? orders[0].shippingAddress : null;
  };

  const getFullName = () => {
    const addr = getLatestAddress();
    return addr
      ? `${addr.firstName || ""} ${addr.lastName || ""}`.trim()
      : user?.username || "User";
  };

  const getFullAddress = () => {
    const addr = getLatestAddress();
    return addr
      ? `${addr.address1 || ""} ${addr.address2 || ""}`.trim()
      : "Not provided";
  };

  const startEditing = () => {
    setEditForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      address2: user?.address2 || "",
      city: user?.city || "",
      state: user?.state || "",
      pincode: user?.pincode || "",
    });
    setIsEditing(true);
  };

  const saveProfile = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();
      if (result.success) {
        setIsEditing(false);
        alert("Profile updated successfully!");
        // Refresh user data
        await refreshUser();
      } else {
        alert("Failed to update profile: " + result.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f4f2] to-[#e8e6e3] ">
      <Header />

      {/* Hero Section */}
      <div className="bg-[url('/store/store-sec-bg.png')] bg-no-repeat bg-cover bg-center text-text px-4 md:px-10 pt-[64px]">
        <div className="container py-12">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div>
              <h1 className="text-4xl font-medium mb-2">Welcome Back!</h1>
              <p className="text-text text-lg">{getFullName()}</p>
              <p className="text-text text-base">{user?.email}</p>
            </div>
            <div className="lg:text-right space-y-2">
              <div className="flex gap-2 items-center">
                <p className="text-[#736c5f] text-base">Total Orders</p>
                <p className="text-[#736c5f] text-2xl font-medium">
                  {orders.length}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-[#736c5f] hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[url('/store/store-sec-bg.png')] bg-no-repeat bg-cover bg-center shadow-2xl border-t-2 px-4 md:px-10">
        <div className="container">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-2 border-b-2 font-medium text-base transition-colors ${
                activeTab === "orders"
                  ? "border-[#91B3C7] text-[#736c5f]"
                  : "border-transparent text-[#827C71] hover:text-[#736c5f]"
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              My Orders
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-2 border-b-2 font-medium text-base transition-colors ${
                activeTab === "profile"
                  ? "border-[#91B3C7] text-[#736c5f]"
                  : "border-transparent text-[#827C71] hover:text-[#736c5f]"
              }`}
            >
              <User className="w-5 h-5 inline mr-2" />
              Profile
            </button>
          </div>
        </div>
      </div>

      <div className="py-8 px-4 md:px-10 bg-[url('/store/store-sec-bg.png')] bg-no-repeat bg-cover bg-center">
        <div className="container">
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="bg-[url('/store/store-sec-bg.png')] bg-no-repeat bg-cover bg-center shadow-lg overflow-hidden">
                <div className="p-6 border-[1px] border-gray-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl text-[#736C5F] font-medium flex items-center">
                        <Package className="w-6 h-6 mr-3" />
                        Order History
                      </h2>
                      <p className="text-[#827C71] mt-1">
                        Track all your orders in one place
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setLoading(true);
                        const fetchOrders = async () => {
                          try {
                            const response = await fetch("/api/orders");
                            const result = await response.json();
                            if (result.success) {
                              setOrders(result.data);
                            }
                          } catch (error) {
                            console.error("Error:", error);
                          } finally {
                            setLoading(false);
                          }
                        };
                        fetchOrders();
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:underline transition-colors"
                      disabled={loading}
                    >
                      <svg
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#736c5f] mx-auto"></div>
                      <p className="mt-4 text-[#827C71]">
                        Loading your orders...
                      </p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-[#827C71] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[#736c5f] mb-2">
                        No orders yet
                      </h3>
                      <p className="text-[#827C71]">
                        Your orders will appear here once you make a purchase
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {orders.map((order) => (
                        <div key={order._id} className="transition-shadow">
                          <div className="flex flex-col md:flex-row gap-10 md:gap-4 justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-[#736c5f] mb-1">
                                Order #{order.orderNumber}
                              </h3>
                              <div className="flex items-center space-x-4 text-base text-[#827C71]">
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="flex items-center">
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  {order.paymentMethod?.toUpperCase() || "COD"}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 md:text-right">
                              <div className="text-2xl font-medium text-[#736c5f] mb-1">
                                {formatPrice(order.total)}
                              </div>
                              <div className="space-y-2">
                                <div
                                  className={`text-lg font-normal text-[#736C5F]`}
                                >
                                  order status:{" "}
                                  <span className="font-medium">
                                    {order.status?.charAt(0).toUpperCase() +
                                      order.status?.slice(1) || "pending"}
                                  </span>
                                </div>
                                {order.paymentStatus && (
                                  <div
                                    className={`text-base px-2 py-1 text-[#736C5F]`}
                                  >
                                    Payment:{" "}
                                    <span className="font-medium">
                                      {order.paymentStatus
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        order.paymentStatus?.slice(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {order.items && order.items.length > 0 && (
                              <div className="space-y-2 border border-gray-300 p-3">
                                <h4 className="font-medium text-[#736c5f] mb-5 flex items-center">
                                  <Package className="w-4 h-4 mr-1" />
                                  Items Ordered ({order.items.length})
                                </h4>
                                {order.items.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center"
                                  >
                                    <div className="flex items-center space-x-3">
                                      {item.productImage && (
                                        <img
                                          src={item.productImage}
                                          alt={item.productName}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                      )}
                                      <div>
                                        <p className="font-medium text-[#736c5f]">
                                          {item.productName}
                                        </p>
                                        {item.variant && (
                                          <p className="text-base text-[#827C71] flex items-center gap-3">
                                            {item.variant.size && (
                                              <span>
                                                Size:
                                                <span className="!uppercase">
                                                  {" "}
                                                  {item.variant.size}
                                                </span>
                                              </span>
                                            )}
                                            {item.variant.color && (
                                              <span>
                                                Color: {item.variant.color}
                                              </span>
                                            )}
                                          </p>
                                        )}
                                        <p className="text-base text-[#827C71]">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-[#736c5f]">
                                        {formatPrice(item.totalPrice)}
                                      </p>
                                      <p className="text-base text-[#827C71]">
                                        {formatPrice(item.price)} each
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {order.shippingAddress && (
                              <div className="border border-gray-300 p-4">
                                <h4 className="font-medium text-[#736C5F] mb-2 flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  Shipping Address
                                </h4>
                                <div className="text-base text-[#736C5F] space-y-1">
                                  <p>
                                    {order.shippingAddress.firstName}{" "}
                                    {order.shippingAddress.lastName}
                                  </p>
                                  <p>
                                    {order.shippingAddress.address1}{" "}
                                    {order.shippingAddress.address2}
                                  </p>
                                  <p>
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state} -{" "}
                                    {order.shippingAddress.zipCode}
                                  </p>
                                  <p className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {order.shippingAddress.phone}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="shadow-lg overflow-hidden">
                <div className="p-6 border-[1px] border-b-gray-300">
                  <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div>
                      <h2 className="text-2xl font-medium flex items-center text-[#736C5F]">
                        <User className="w-6 h-6 mr-3" />
                        Profile Information
                      </h2>
                      <p className="text-[#827C71] mt-1">
                        {isEditing
                          ? "Edit your personal details"
                          : "View your personal details"}
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={startEditing}
                        className="text-[#736c5f] hover:underline flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <div className="relative border border-gray-300 p-3">
                        <h3 className="text-lg font-semibold text-[#736c5f] mb-4">
                          Personal Details
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-base font-medium text-[#736c5f] mb-1">
                                First Name
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.firstName}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      firstName: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-[#827C71] rounded-lg focus:ring-2 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                                />
                              ) : (
                                <p className="text-[#736c5f] py-2">
                                  {user?.firstName || "Not provided"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-base font-medium text-[#736C5F] mb-1">
                                Last Name
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.lastName}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      lastName: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="text-gray-900 py-2">
                                  {user?.lastName || "Not provided"}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-base font-medium text-[#736C5F] mb-1">
                              Email
                            </label>
                            <p className="text-[#736C5F] py-2 flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {user?.email}
                            </p>
                            {isEditing && (
                              <p className="text-base text-gray-500 mt-1">
                                Email cannot be changed
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-6">
                      <div className="p-3 border border-gray-300">
                        <h3 className="text-lg font-semibold text-[#736C5F] mb-4">
                          Address Details
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-base font-medium text-[#736C5F] mb-1">
                                Address Line 1
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.address}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      address: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="text-gray-900 py-2">
                                  {user?.address || "Not provided"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-base font-medium text-[#736C5F] mb-1">
                                Address Line 2
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.address2}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      address2: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="text-gray-900 py-2">
                                  {user?.address2 || "Not provided"}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-base font-medium text-[#736C5F] mb-1">
                                City
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.city}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      city: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="text-gray-900 py-2">
                                  {user?.city || "Not provided"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-base font-medium text-[#736C5F] mb-1">
                                State
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.state}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      state: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="text-gray-900 py-2">
                                  {user?.state || "Not provided"}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-base font-medium text-[#736C5F] mb-1">
                                ZIP Code
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.pincode}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      pincode: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="text-gray-900 py-2">
                                  {user?.pincode || "Not provided"}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-base font-medium text-[#736C5F] mb-1">
                                Phone
                              </label>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.phone}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      phone: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                />
                              ) : (
                                <p className="text-gray-900 py-2 flex items-center">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {user?.phone || "Not provided"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Action Buttons */}
                  {isEditing && (
                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-2 border border-[#736C5F] text-[#736C5F] rounded-lg hover:bg-[#736c5f] hover:text-[#E4DFD3] transition-colors flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={saveProfile}
                        disabled={updating}
                        className="bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-medium tracking-wider hover:bg-[#736C5F] hover:text-[#E4DFD3] transition-colors flex items-center justify-center gap-2 border-b-1 border-[#736C5F] cursor-pointer"
                      >
                        {updating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E4DFD3] mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default withAuth(Dashboard);
