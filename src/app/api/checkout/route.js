import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/UserModel";
import Coupon from "@/models/Coupon";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    console.log("User from token:", user); // Debug log

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Ensure user has required fields
    if (!user._id && !user.id) {
      console.error("User missing ID field:", user);
      return NextResponse.json(
        { success: false, error: "Invalid user session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      coupon,
      paymentMethod = "cod",
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Validate and fetch product details
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.name}` },
          { status: 400 }
        );
      }

      // Check stock availability
      const sizeStock = product.sizeStock?.find((s) => s.size === item.size);
      if (!sizeStock || sizeStock.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.name} in size ${item.size}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images?.[0]?.url || "",
        variant: {
          size: item.size,
          color: product.colorName,
          sku: product.sku,
        },
        quantity: item.quantity,
        price: product.price,
        totalPrice: itemTotal,
      });
    }

    // Apply coupon if provided (use pre-validated coupon from cart)
    let discount = 0;
    let appliedCoupon = null;

    if (coupon && coupon.code && coupon.discountAmount) {
      // Use the already validated coupon data from cart context
      discount = coupon.discountAmount;
      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      };

      // Update coupon used count in database
      try {
        await Coupon.findOneAndUpdate(
          { code: coupon.code.toUpperCase() },
          { $inc: { usedCount: 1 } }
        );
      } catch (error) {
        console.error("Error updating coupon usage:", error);
        // Don't fail the order if coupon update fails
      }
    }

    // Calculate totals
    const tax = 0; // No tax for now
    const shipping = 0; // Free shipping for now
    const total = subtotal - discount + tax + shipping;

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1)
      .toString()
      .padStart(4, "0")}`;

    // Create order
    const order = new Order({
      orderNumber,
      customer: user._id || user.id,
      customerEmail: user.email,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      appliedCoupon,
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            "sizeStock.$[elem].stock": -item.quantity,
            totalStock: -item.quantity,
          },
        },
        {
          arrayFilters: [{ "elem.size": item.size }],
        }
      );
    }

    // Update coupon usage if applied
    if (appliedCoupon) {
      await Coupon.findOneAndUpdate(
        { code: appliedCoupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderId: order._id,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
