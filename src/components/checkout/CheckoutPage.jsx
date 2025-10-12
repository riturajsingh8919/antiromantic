"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Truck, Shield, Check } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cartItems,
    getCartTotal,
    clearCart,
    appliedCoupon,
    getShippingCost,
    getFinalTotal,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",

    // Payment Information
    paymentMethod: "cod", // Only COD allowed

    // Billing Address
    sameAsShipping: true,
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingPincode: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Check authentication and pre-fill user data
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      toast.error("Please login to continue checkout");
      router.push("/login?redirect=/checkout");
      return;
    }

    // Pre-fill form with user data
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.username?.split(" ")[0] || "",
        lastName: user.username?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
  }, [user, router]);

  // State for checkout process
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Redirect if cart is empty (but not during order completion)
  useEffect(() => {
    if (cartItems.length === 0 && !orderCompleted) {
      toast.error("Your cart is empty");
      router.push("/cart");
    }
  }, [cartItems.length, router, orderCompleted]);

  // Calculate totals using cart context
  const orderValue = getCartTotal();
  const shipping = getShippingCost();
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = getFinalTotal();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.pincode) newErrors.pincode = "Pincode is required";
    }

    // Step 2 is review, no validation needed for COD

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    const result = await applyCoupon(couponCode.trim());
    if (result) {
      setCouponCode("");
    }
    setValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(1)) return;

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address,
          address2: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.pincode,
          country: formData.country,
          phone: formData.phone,
        },
        billingAddress: formData.sameAsShipping
          ? {
              firstName: formData.firstName,
              lastName: formData.lastName,
              address1: formData.address,
              address2: formData.apartment,
              city: formData.city,
              state: formData.state,
              zipCode: formData.pincode,
              country: formData.country,
              phone: formData.phone,
            }
          : {
              firstName: formData.billingFirstName,
              lastName: formData.billingLastName,
              address1: formData.billingAddress,
              city: formData.billingCity,
              state: formData.billingState,
              zipCode: formData.billingPincode,
              country: formData.country,
            },
        coupon: appliedCoupon,
        paymentMethod: "cod",
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Set order completed flag to prevent cart empty redirect
        setOrderCompleted(true);

        // Show success message
        toast.success("Order placed successfully!");

        // Clear cart and coupon
        await clearCart();
        removeCoupon();

        // Use replace instead of push to prevent back navigation
        router.replace(`/thank-you?order=${result.data.orderNumber}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] px-4 md:px-10 py-16 pt-[100px]">
        <div className="container">
          {/* Back to Cart */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-[#28251F] hover:text-[#736C5F] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-base">back to cart</span>
            </Link>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-light text-[#656056] tracking-wide">
              checkout
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-8">
              <div
                className={`flex items-center space-x-2 ${
                  currentStep >= 1 ? "text-[#736C5F]" : "text-[#E4DFD3]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 1
                      ? "border-[#736C5F] bg-[#736C5F] text-[#E4DFD3]"
                      : "border-[#E4DFD3]"
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <span className="text-base font-normal">shipping</span>
              </div>

              <div
                className={`w-16 h-0.5 ${
                  currentStep >= 2 ? "bg-[#736C5F]" : "bg-[#E4DFD3]"
                }`}
              ></div>

              <div
                className={`flex items-center space-x-2 ${
                  currentStep >= 2 ? "text-[#736C5F]" : "text-[#E4DFD3]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 2
                      ? "border-[#736C5F] bg-[#736C5F] text-[#E4DFD3]"
                      : "border-[#E4DFD3]"
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
                </div>
                <span className="text-base font-normal">payment</span>
              </div>

              <div
                className={`w-16 h-0.5 ${
                  currentStep >= 3 ? "bg-[#736C5F]" : "bg-[#E4DFD3]"
                }`}
              ></div>

              <div
                className={`flex items-center space-x-2 ${
                  currentStep >= 3 ? "text-[#736C5F]" : "text-[#E4DFD3]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= 3
                      ? "border-[#736C5F] bg-[#736C5F] text-[#E4DFD3]"
                      : "border-[#E4DFD3]"
                  }`}
                >
                  {currentStep > 3 ? <Check className="w-4 h-4" /> : "3"}
                </div>
                <span className="text-base font-normal">review</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="flex-1">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-normal text-[#28251F] mb-6">
                        shipping information
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-base font-normal text-[#28251F]"
                          >
                            first name *
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`${
                              errors.firstName
                                ? "border-red-500 focus-visible:border-red-500"
                                : ""
                            }`}
                            placeholder="enter first name"
                          />
                          {errors.firstName && (
                            <p className="text-gray-500 text-base mt-1">
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-base font-normal text-[#28251F]"
                          >
                            last name *
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`${
                              errors.lastName
                                ? "border-red-500 focus-visible:border-red-500"
                                : ""
                            }`}
                            placeholder="enter last name"
                          />
                          {errors.lastName && (
                            <p className="text-gray-500 text-base mt-1">
                              {errors.lastName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-base font-normal text-[#28251F]"
                          >
                            email address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`${
                              errors.email
                                ? "border-red-500 focus-visible:border-red-500"
                                : ""
                            }`}
                            placeholder="enter email address"
                          />
                          {errors.email && (
                            <p className="text-gray-500 text-base mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-base font-normal text-[#28251F]"
                          >
                            phone number *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`${
                              errors.phone
                                ? "border-red-500 focus-visible:border-red-500"
                                : ""
                            }`}
                            placeholder="enter phone number"
                          />
                          {errors.phone && (
                            <p className="text-gray-500 text-base mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="address"
                            className="text-base font-normal text-[#28251F]"
                          >
                            address *
                          </Label>
                          <Input
                            id="address"
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={`${
                              errors.address
                                ? "border-red-500 focus-visible:border-red-500"
                                : ""
                            }`}
                            placeholder="enter street address"
                          />
                          {errors.address && (
                            <p className="text-gray-500 text-base mt-1">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="apartment"
                            className="text-base font-normal text-[#28251F]"
                          >
                            apartment, suite, etc.
                          </Label>
                          <Input
                            id="apartment"
                            type="text"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleInputChange}
                            placeholder="apartment, suite, etc. (optional)"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="city"
                              className="text-base font-normal text-[#28251F]"
                            >
                              city *
                            </Label>
                            <Input
                              id="city"
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className={`${
                                errors.city
                                  ? "border-red-500 focus-visible:border-red-500"
                                  : ""
                              }`}
                              placeholder="enter city"
                            />
                            {errors.city && (
                              <p className="text-gray-500 text-base mt-1">
                                {errors.city}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="state"
                              className="text-base font-normal text-[#28251F]"
                            >
                              state *
                            </Label>
                            <Input
                              id="state"
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className={`${
                                errors.state
                                  ? "border-red-500 focus-visible:border-red-500"
                                  : ""
                              }`}
                              placeholder="enter state"
                            />
                            {errors.state && (
                              <p className="text-gray-500 text-base mt-1">
                                {errors.state}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="pincode"
                              className="text-base font-normal text-[#28251F]"
                            >
                              pincode *
                            </Label>
                            <Input
                              id="pincode"
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              className={`${
                                errors.pincode
                                  ? "border-red-500 focus-visible:border-red-500"
                                  : ""
                              }`}
                              placeholder="enter pincode"
                            />
                            {errors.pincode && (
                              <p className="text-gray-500 text-base mt-1">
                                {errors.pincode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-medium tracking-wider hover:bg-[#736C5F] hover:text-[#E4DFD3] transition-colors border-b-1 border-[#736C5F] cursor-pointer"
                      >
                        continue to payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Information */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-normal text-[#28251F] mb-6">
                        payment method
                      </h2>

                      {/* Payment Method Selection */}
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center space-x-3 ">
                          <input
                            type="radio"
                            id="card"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === "card"}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[#28251F] cursor-pointer"
                          />
                          <label
                            htmlFor="card"
                            className="flex items-center space-x-2 text-[#28251F] cursor-pointer"
                          >
                            <CreditCard className="w-5 h-5" />
                            <span>credit / debit card</span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="upi"
                            name="paymentMethod"
                            value="upi"
                            checked={formData.paymentMethod === "upi"}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[#28251F] cursor-pointer"
                          />
                          <label
                            htmlFor="upi"
                            className="text-[#28251F] cursor-pointer"
                          >
                            UPI payment
                          </label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === "cod"}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-[#28251F] cursor-pointer"
                          />
                          <label
                            htmlFor="cod"
                            className="text-[#28251F] cursor-pointer"
                          >
                            cash on delivery
                          </label>
                        </div>
                      </div>

                      {/* Card Details */}
                      {formData.paymentMethod === "card" && (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="cardName"
                              className="text-base font-normal text-[#28251F]"
                            >
                              cardholder name *
                            </Label>
                            <Input
                              id="cardName"
                              type="text"
                              name="cardName"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              className={`${
                                errors.cardName
                                  ? "border-red-500 focus-visible:border-red-500"
                                  : ""
                              }`}
                              placeholder="name on card"
                            />
                            {errors.cardName && (
                              <p className="text-gray-500 text-base mt-1">
                                {errors.cardName}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="cardNumber"
                              className="text-base font-normal text-[#28251F]"
                            >
                              card number *
                            </Label>
                            <Input
                              id="cardNumber"
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              className={`${
                                errors.cardNumber
                                  ? "border-red-500 focus-visible:border-red-500"
                                  : ""
                              }`}
                              placeholder="1234 5678 9012 3456"
                            />
                            {errors.cardNumber && (
                              <p className="text-gray-500 text-base mt-1">
                                {errors.cardNumber}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="expiryDate"
                                className="text-base font-normal text-[#28251F]"
                              >
                                expiry date *
                              </Label>
                              <Input
                                id="expiryDate"
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                className={`${
                                  errors.expiryDate
                                    ? "border-red-500 focus-visible:border-red-500"
                                    : ""
                                }`}
                                placeholder="MM/YY"
                              />
                              {errors.expiryDate && (
                                <p className="text-gray-500 text-base mt-1">
                                  {errors.expiryDate}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="cvv"
                                className="text-base font-normal text-[#28251F]"
                              >
                                cvv *
                              </Label>
                              <Input
                                id="cvv"
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className={`${
                                  errors.cvv
                                    ? "border-red-500 focus-visible:border-red-500"
                                    : ""
                                }`}
                                placeholder="123"
                              />
                              {errors.cvv && (
                                <p className="text-gray-500 text-base mt-1">
                                  {errors.cvv}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="bg-[#D0C9BE] text-[#28251F] py-2 px-6 text-lg font-medium tracking-wider hover:bg-[#736C5F] hover:text-[#E4DFD3] transition-colors border-b-1 border-[#736C5F] cursor-pointer"
                      >
                        back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="bg-[#E4DFD3] text-[#28251F] py-2 px-6 text-lg font-medium tracking-wider hover:bg-[#736C5F] hover:text-[white] transition-colors border-b-1 border-[#736C5F] cursor-pointer"
                      >
                        review order
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Order Review */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-normal text-[#28251F] mb-6">
                        review your order
                      </h2>

                      {/* Order Items */}
                      <div className="space-y-4 mb-8">
                        {cartItems.map((item) => (
                          <div
                            key={`${item.id}-${item.size}`}
                            className="flex items-center gap-4 p-4 bg-white/50"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-20 object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="text-base font-normal text-[#28251F]">
                                {item.name}
                              </h3>
                              <p className="text-base text-[#736C5F]">
                                size{" "}
                                <span className="!uppercase">{item.size}</span>{" "}
                                • qty {item.quantity}
                              </p>
                            </div>
                            <p className="text-base font-normal text-[#28251F]">
                              inr{" "}
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping & Payment Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-base font-normal text-[#28251F] mb-4">
                            shipping address
                          </h3>
                          <div className="text-base text-[#736C5F] space-y-1">
                            <p>
                              {formData.firstName} {formData.lastName}
                            </p>
                            <p>{formData.address}</p>
                            {formData.apartment && <p>{formData.apartment}</p>}
                            <p>
                              {formData.city}, {formData.state}{" "}
                              {formData.pincode}
                            </p>
                            <p>{formData.phone}</p>
                            <p>{formData.email}</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-normal text-[#28251F] mb-4">
                            payment method
                          </h3>
                          <div className="text-base text-[#736C5F]">
                            {formData.paymentMethod === "card" && (
                              <p>
                                card ending in ****{" "}
                                {formData.cardNumber.slice(-4)}
                              </p>
                            )}
                            {formData.paymentMethod === "upi" && (
                              <p>UPI payment</p>
                            )}
                            {formData.paymentMethod === "cod" && (
                              <p>cash on delivery</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="bg-[#D0C9BE] text-[#28251F] py-3 px-6 text-lg font-medium tracking-wider hover:bg-[#28251F] hover:text-white transition-colors border-b-2 border-[#28251F] cursor-pointer"
                      >
                        back
                      </button>
                      <button
                        type="submit"
                        className="bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-medium tracking-wider hover:bg-[#28251F] hover:text-white transition-colors border-b-2 border-[#736C5F] flex items-center gap-2 cursor-pointer"
                      >
                        place order
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-[35%]">
              <div className="bg-white/30 p-6 space-y-6">
                <h3 className="text-lg font-normal text-[#28251F]">
                  order summary
                </h3>

                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${item.size}`}
                      className="flex justify-between text-base"
                    >
                      <span className="text-[#28251F]">
                        {item.name} ({item.size}) × {item.quantity}
                      </span>
                      <span className="text-[#736C5F] font-normal">
                        inr {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="border-[#D0C9BE]" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-[#28251F]">subtotal</span>
                    <span className="text-[#736C5F] font-normal">
                      inr {orderValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-[#28251F]">shipping</span>
                    <span className="text-[#736C5F] font-normal">
                      {shipping === 0 ? "FREE" : `inr ${shipping}`}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-base">
                      <span className="text-[#28251F]">
                        discount ({appliedCoupon.code})
                        {appliedCoupon.discountType === "percentage" && (
                          <span className="text-base text-[#656056] ml-1">
                            {appliedCoupon.discountValue}% off
                          </span>
                        )}
                      </span>
                      <span className="text-gray-700 font-normal">
                        -inr{discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="border-[#D0C9BE]" />

                <div className="flex justify-between">
                  <span className="text-base font-normal text-[#28251F]">
                    total
                  </span>
                  <span className="text-lg font-bold text-[#28251F]">
                    inr {total.toLocaleString()}
                  </span>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-3 p-3 bg-[#D0C9BE]/30 rounded">
                  <Shield className="w-5 h-5 text-[#28251F] mt-0.5" />
                  <div className="text-base text-[#28251F]">
                    <p className="font-medium text-lg">secure checkout</p>
                    <p>your payment information is encrypted and secure</p>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="flex items-center gap-3 p-3 bg-[#D0C9BE]/30 rounded">
                  <Truck className="w-5 h-5 text-[#28251F] mt-0.5" />
                  <div className="text-base text-[#28251F]">
                    <p className="font-medium text-lg">free shipping</p>
                    <p>on orders above inr2,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPage;
