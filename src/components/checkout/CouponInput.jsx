"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, X, Check } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CouponInput({
  orderTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon = null,
  userId = null,
}) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState("");

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    setCouponError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          orderTotal,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onCouponApplied(data.data);
        setCouponCode("");
        toast.success("Coupon applied successfully!");
      } else {
        setCouponError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Failed to validate coupon");
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    setCouponCode("");
    setCouponError("");
    toast.success("Coupon removed");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateCoupon();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Discount Coupon
        </CardTitle>
        <CardDescription>
          Have a coupon code? Enter it below to get a discount on your order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!appliedCoupon ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="coupon">Coupon Code</Label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1">
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter coupon code"
                    className={couponError ? "border-red-500" : ""}
                    disabled={isValidating}
                  />
                  {couponError && (
                    <p className="text-base text-gray-500 mt-1">
                      {couponError}
                    </p>
                  )}
                </div>
                <Button
                  onClick={validateCoupon}
                  disabled={isValidating || !couponCode.trim()}
                  className="px-6"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-800">
                    Coupon Applied: {appliedCoupon.coupon.code}
                  </p>
                  {appliedCoupon.coupon.description && (
                    <p className="text-base text-gray-700">
                      {appliedCoupon.coupon.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                className="text-green-700 hover:text-green-900 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-base">
                <span>Subtotal:</span>
                <span>${appliedCoupon.discount.originalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base text-gray-700">
                <span>
                  Discount (
                  {appliedCoupon.coupon.discountType === "percentage"
                    ? `${appliedCoupon.coupon.discountValue}%`
                    : `$${appliedCoupon.coupon.discountValue}`}
                  ):
                </span>
                <span>-${appliedCoupon.discount.amount.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${appliedCoupon.discount.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Order summary component that shows discount details
export function OrderSummary({
  items = [],
  appliedCoupon = null,
  shipping = 0,
  tax = 0,
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = appliedCoupon ? appliedCoupon.discount.amount : 0;
  const total = subtotal - discountAmount + shipping + tax;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Items */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-base">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <hr />

        {/* Pricing breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-base">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-base text-gray-700">
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3" />
                <span>Discount ({appliedCoupon.coupon.code}):</span>
              </div>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          {shipping > 0 && (
            <div className="flex justify-between text-base">
              <span>Shipping:</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between text-base">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          )}
        </div>

        <hr />

        <div className="flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
