"use client";

import React, { useState, useEffect } from "react";
import { Check, Package, Clock, CreditCard } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";

const ThankYouPage = ({ orderNumber }) => {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderNumber) {
      router.push("/");
      return;
    }

    fetchOrderDetails();
  }, [orderNumber, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderNumber}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || "Order not found");
        toast.error("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#28251F] mx-auto mb-4"></div>
            <p className="text-[#736C5F]">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">{error}</p>
            <Link href="/" className="text-[#28251F] hover:underline">
              Go to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-[url('/store/store-sec-bg.png')] px-4 md:px-10 pt-16">
        <div className="container max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <Image
              src="/thankyou.png"
              alt="Thank You"
              width={1920}
              height={1080}
              className="mx-auto mb-6 w-full lg:w-[80%] h-auto object-contain"
            />
            <p className="text-lg text-[#736C5F] mb-2">
              Your order has been placed successfully
            </p>
            <p className="text-base text-[#736C5F]">
              Order Number:{" "}
              <span className="font-medium text-[#28251F]">
                #{order?.orderNumber}
              </span>
            </p>
          </div>

          {/* Order Summary */}
          <div className="shadow-sm border border-[#E0E0E0] p-6 mb-8">
            <h2 className="text-xl font-medium text-[#28251F] mb-6">
              Order Summary
            </h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {order?.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 pb-4 border-b border-[#F0F0F0]"
                >
                  <img
                    src={item.productImage || "/store/product1.png"}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-[#28251F] capitalize">
                      {item.productName}
                    </h3>
                    <p className="text-base text-[#736C5F]">
                      Size: {item.variant?.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#28251F]">
                      inr{item.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="space-y-2 pt-4 border-t border-[#E0E0E0]">
              <div className="flex justify-between text-[#736C5F]">
                <span>Subtotal</span>
                <span>inr{order?.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#736C5F]">
                <span>Shipping</span>
                <span>inr{order?.shipping?.toLocaleString()}</span>
              </div>
              {order?.discount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Discount</span>
                  <span>-inr{order?.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-medium text-[#28251F] pt-2 border-t border-[#E0E0E0]">
                <span>Total</span>
                <span>inr{order?.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Order Status & Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Shipping Address */}
            <div className="shadow-sm border border-[#E0E0E0] p-6">
              <h3 className="text-lg font-medium text-[#28251F] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="text-[#736C5F]">
                <p className="font-medium text-[#28251F]">
                  {order?.shippingAddress?.firstName}{" "}
                  {order?.shippingAddress?.lastName}
                </p>
                <p>{order?.shippingAddress?.address1}</p>
                {order?.shippingAddress?.address2 && (
                  <p>{order?.shippingAddress?.address2}</p>
                )}
                <p>
                  {order?.shippingAddress?.city},{" "}
                  {order?.shippingAddress?.state}{" "}
                  {order?.shippingAddress?.zipCode}
                </p>
                <p>{order?.shippingAddress?.country}</p>
                {order?.shippingAddress?.phone && (
                  <p>Phone: {order?.shippingAddress?.phone}</p>
                )}
              </div>
            </div>

            {/* Payment & Delivery Info */}
            <div className="shadow-sm border border-[#E0E0E0] p-6">
              <h3 className="text-lg font-medium text-[#28251F] mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment & Delivery
              </h3>
              <div className="space-y-3 text-[#736C5F]">
                <div>
                  <p className="font-medium text-[#28251F]">Payment Method</p>
                  <p>Cash on Delivery (COD)</p>
                </div>
                <div>
                  <p className="font-medium text-[#28251F]">Order Status</p>
                  <p className="capitalize">{order?.orderStatus}</p>
                </div>
                <div>
                  <p className="font-medium text-[#28251F]">
                    Estimated Delivery
                  </p>
                  <p>3-5 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/store"
                className="bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-bold tracking-wider hover:bg-[#28251F] hover:text-white transition-colors flex items-center justify-center gap-2 border-b-2 border-[#736C5F] cursor-pointer"
              >
                Continue Shopping
              </Link>
              <Link
                href="/user-profile"
                className="bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-bold tracking-wider hover:bg-[#28251F] hover:text-white transition-colors flex items-center justify-center gap-2 border-b-2 border-[#736C5F] cursor-pointer"
              >
                View Order History
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ThankYouPage;
