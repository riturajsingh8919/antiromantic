"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  UserPlus,
  Edit3,
  Lock,
  LogOut,
  Mail,
  Phone,
  User,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Trash2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("admins");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Edit admin states
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
  });

  // Add admin states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Change password states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [targetAdminForPassword, setTargetAdminForPassword] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  // OTP verification states
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otpForm, setOtpForm] = useState({
    email: "",
    otp: "",
  });
  const [otpPurpose, setOtpPurpose] = useState(""); // "add" or "edit"
  const [pendingAdminData, setPendingAdminData] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOTP, setCanResendOTP] = useState(true);

  // Load admin users
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users?role=admin");
      const data = await response.json();

      if (data.success) {
        setAdmins(data.data || []);
      } else {
        setErrors({ fetch: data.error || "Failed to fetch admins" });
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      setErrors({ fetch: "Network error while fetching admins" });
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => setErrors({}), 8000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // Edit admin functions
  const openEditDialog = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      username: admin.username,
      email: admin.email,
      phone: admin.phone,
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    // Check if email has changed
    const emailChanged = editForm.email !== editingAdmin.email;

    if (emailChanged) {
      // Email changed - require OTP verification
      setPendingAdminData({
        username: editForm.username,
        email: editForm.email,
        phone: editForm.phone,
      });

      setOtpForm({ email: editForm.email, otp: "" });
      setOtpPurpose("edit");
      setShowEditDialog(false);
      setShowOTPDialog(true);

      // Send OTP to new email
      await sendOTP(editForm.email, "edit");
    } else {
      // Email not changed - proceed with direct update
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${editingAdmin._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        });

        const data = await response.json();

        if (data.success) {
          setSuccessMessage("Admin details updated successfully!");
          setShowEditDialog(false);
          setEditingAdmin(null);
          fetchAdmins();
        } else {
          setErrors({ edit: data.error || "Failed to update admin" });
        }
      } catch (error) {
        console.error("Error updating admin:", error);
        setErrors({ edit: "Network error while updating admin" });
      } finally {
        setLoading(false);
      }
    }
  };

  // Add admin functions
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (addForm.password !== addForm.confirmPassword) {
      setErrors({ add: "Passwords do not match" });
      return;
    }

    // Store pending admin data and trigger OTP flow
    setPendingAdminData({
      username: addForm.username,
      email: addForm.email,
      phone: addForm.phone,
      password: addForm.password,
    });

    setOtpForm({ email: addForm.email, otp: "" });
    setOtpPurpose("add");
    setShowAddDialog(false);
    setShowOTPDialog(true);

    // Send OTP
    await sendOTP(addForm.email, "add");
  };

  // Change password functions
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!targetAdminForPassword) {
      setErrors({ password: "No admin selected for password change" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ password: "New passwords do not match" });
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setErrors({ password: "Password must be at least 6 characters long" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/users/${targetAdminForPassword._id}/change-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          `Password changed successfully for ${targetAdminForPassword.username}!`
        );
        setShowPasswordDialog(false);
        setTargetAdminForPassword(null);
        setPasswordForm({
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setErrors({ password: data.error || "Failed to change password" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrors({ password: "Network error while changing password" });
    } finally {
      setLoading(false);
    }
  };

  // Check if delete is allowed (only if 2 or more admins exist)
  const canDeleteAdmin = () => {
    return admins.length >= 2;
  };

  // Delete admin function
  const handleDeleteAdmin = async (adminId) => {
    // Check if deletion is allowed
    if (!canDeleteAdmin()) {
      setErrors({
        delete: "Cannot delete the last admin. At least one admin must remain.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Admin deleted successfully!");
        fetchAdmins();
      } else {
        setErrors({ delete: data.error || "Failed to delete admin" });
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      setErrors({ delete: "Network error while deleting admin" });
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  // OTP verification functions
  const sendOTP = async (email, purpose) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/send-admin-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setOtpTimer(60); // 60 seconds countdown
        setCanResendOTP(false);
        setSuccessMessage(`Verification code sent to ${email}`);

        // Start countdown timer
        const timer = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResendOTP(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors({
          otp: data.error || data.message || "Failed to send verification code",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrors({ otp: "Network error while sending verification code" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp, purpose) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/verify-admin-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
      });

      const data = await response.json();

      if (data.success) {
        return true;
      } else {
        setErrors({
          otp: data.error || data.message || "Invalid verification code",
        });
        return false;
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrors({ otp: "Network error while verifying code" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    const isValid = await verifyOTP(otpForm.email, otpForm.otp, otpPurpose);

    if (isValid) {
      if (otpPurpose === "add") {
        // Proceed with admin creation
        await createAdminAfterVerification();
      } else if (otpPurpose === "edit") {
        // Proceed with admin email update
        await updateAdminAfterVerification();
      }

      // Reset OTP dialog
      setShowOTPDialog(false);
      setOtpForm({ email: "", otp: "" });
      setOtpSent(false);
      setOtpTimer(0);
      setPendingAdminData(null);
    }
  };

  const createAdminAfterVerification = async () => {
    if (!pendingAdminData) return;

    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "Application/json" },
        body: JSON.stringify({
          ...pendingAdminData,
          role: "admin",
          isEmailVerified: true, // Mark as verified since OTP was confirmed
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("New admin created successfully!");
        setShowAddDialog(false);
        setAddForm({
          username: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        fetchAdmins();
      } else {
        setErrors({ add: data.error || "Failed to create admin" });
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      setErrors({ add: "Network error while creating admin" });
    } finally {
      setLoading(false);
    }
  };

  const updateAdminAfterVerification = async () => {
    if (!pendingAdminData || !editingAdmin) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${editingAdmin._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pendingAdminData,
          isEmailVerified: true, // Mark email as verified since OTP was confirmed
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Admin details updated successfully!");
        setShowEditDialog(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        setErrors({ edit: data.error || "Failed to update admin" });
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      setErrors({ edit: "Network error while updating admin" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#736c5f]">Admin Settings</h1>
          <p className="text-[#827C71] mt-2">Manage admin users and settings</p>
        </div>

        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-500 hover:bg-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border-[#827C71] border-opacity-20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#736c5f]">
                  Confirm Logout
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#827C71]">
                  Are you sure you want to logout? You will be redirected to the
                  login page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {Object.keys(errors).length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {Object.values(errors)[0]}
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-1 bg-[#827C71] bg-opacity-10">
          <TabsTrigger
            value="admins"
            className="data-[state=active]:bg-[#736c5f] data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-6">
          <Card className="bg-white border-[#827C71] border-opacity-20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl text-[#736c5f]">
                  Admin Users
                </CardTitle>
                <p className="text-base text-[#827C71] mt-1">
                  Manage administrator accounts
                </p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#736c5f] hover:bg-[#827C71] text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#736c5f]"></div>
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8 text-[#827C71]">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No admin users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div
                      key={admin._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-[#827C71] border-opacity-20 rounded-lg transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-[#736c5f]">
                            {admin.username}
                          </h3>
                          <Badge className="bg-transparent border-transparent text-[#91B3C7]">
                            Admin
                          </Badge>
                          {admin.isEmailVerified ? (
                            <Badge className="bg-transparent border-transparent text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-transparent border-transparent text-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending Verification
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-base text-[#827C71]">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {admin.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {admin.phone}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(admin)}
                          className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTargetAdminForPassword(admin);
                            setShowPasswordDialog(true);
                          }}
                          className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Password
                        </Button>

                        {canDeleteAdmin() ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="bg-red-500 hover:bg-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-[#827C71] border-opacity-20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#736c5f]">
                                  Delete Admin
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#827C71]">
                                  Are you sure you want to delete admin &quot;
                                  {admin.username}&quot;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAdmin(admin._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled
                            className="bg-gray-400 cursor-not-allowed"
                            title="Cannot delete the last admin"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Admin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white border-[#827C71] border-opacity-20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#736c5f]">Edit Admin</DialogTitle>
            <DialogDescription className="text-[#827C71]">
              Update admin information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-[#736c5f]">
                Username
              </Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-[#736c5f]">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-[#736c5f]">
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <DialogFooter className="gap-2">
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
                disabled={loading}
                className="bg-[#736c5f] hover:bg-[#827C71] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-white border-[#827C71] border-opacity-20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#736c5f]">Add New Admin</DialogTitle>
            <DialogDescription className="text-[#827C71]">
              Create a new administrator account. A verification email will be
              sent and the admin must verify their email before they can log in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-username" className="text-[#736c5f]">
                Username
              </Label>
              <Input
                id="add-username"
                value={addForm.username}
                onChange={(e) =>
                  setAddForm({ ...addForm, username: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-email" className="text-[#736c5f]">
                Email
              </Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-phone" className="text-[#736c5f]">
                Phone
              </Label>
              <Input
                id="add-phone"
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm({ ...addForm, phone: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password" className="text-[#736c5f]">
                Password
              </Label>
              <Input
                id="add-password"
                type="password"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-confirm-password" className="text-[#736c5f]">
                Confirm Password
              </Label>
              <Input
                id="add-confirm-password"
                type="password"
                value={addForm.confirmPassword}
                onChange={(e) =>
                  setAddForm({ ...addForm, confirmPassword: e.target.value })
                }
                className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7]"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#736c5f] hover:bg-[#827C71] text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-[#736c5f]">
              Verify Email Address
            </DialogTitle>
            <DialogDescription className="text-[#827C71]">
              Please enter the OTP sent to <strong>{otpForm.email}</strong> to
              verify your email address.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="otp"
                className="text-base font-medium text-[#736c5f]"
              >
                Enter OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpForm.otp}
                onChange={(e) =>
                  setOtpForm((prev) => ({ ...prev, otp: e.target.value }))
                }
                className="mt-1 border-[#91B3C7] focus:border-[#736c5f] focus:ring-[#736c5f]"
                maxLength={6}
                required
              />
              {errors.otp && (
                <p className="text-red-500 text-base mt-1">{errors.otp}</p>
              )}
            </div>

            <div className="flex justify-between items-center text-base">
              <div className="text-[#827C71]">
                {otpTimer > 0 ? (
                  <span>Resend OTP in {otpTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendOTP(otpForm.email, otpPurpose)}
                    disabled={!canResendOTP}
                    className="text-[#91B3C7] hover:text-[#736c5f] underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {otpSent && (
                <div className="text-green-600 text-base">
                  ✓ OTP sent successfully
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowOTPDialog(false);
                  setOtpForm({ email: "", otp: "" });
                  setOtpPurpose("");
                  setPendingAdminData(null);
                  setOtpSent(false);
                  setOtpTimer(0);
                  setCanResendOTP(true);
                  setErrors({});

                  // Reopen the appropriate dialog
                  if (otpPurpose === "add") {
                    setShowAddDialog(true);
                  } else if (otpPurpose === "edit") {
                    setShowEditDialog(true);
                  }
                }}
                className="border-[#91B3C7] text-[#736c5f] hover:bg-[#91B3C7] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || otpForm.otp.length !== 6}
                className="bg-[#736c5f] hover:bg-[#827C71] text-white disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            setTargetAdminForPassword(null);
            setPasswordForm({
              newPassword: "",
              confirmPassword: "",
            });
          }
        }}
      >
        <DialogContent className="bg-white border-[#827C71] border-opacity-20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#736c5f]">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-[#827C71]">
              {targetAdminForPassword
                ? `Change password for admin: ${targetAdminForPassword.username}`
                : "Change admin password"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[#736c5f]">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7] pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      new: !showPasswords.new,
                    })
                  }
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-[#827C71]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#827C71]" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" className="text-[#736c5f]">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="border-[#827C71] border-opacity-30 focus:ring-[#91B3C7] focus:border-[#91B3C7] pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-[#827C71]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#827C71]" />
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="border-[#827C71] text-[#736c5f] hover:bg-[#91B3C7] hover:bg-opacity-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#736c5f] hover:bg-[#827C71] text-white"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
