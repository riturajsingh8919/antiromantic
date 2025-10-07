import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/UserModel";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connectDB();

    // Check authentication
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const currentUser = await User.findById(decodedToken.id);
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get date ranges for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Fetch real data from database
    const [
      products,
      categories,
      users,
      orders,
      thisMonthOrders,
      lastMonthOrders,
    ] = await Promise.all([
      Product.find({}),
      Category.find({}),
      User.find({ role: "user" }),
      Order.find({}),
      Order.find({ createdAt: { $gte: startOfMonth } }),
      Order.find({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
    ]);

    // Calculate product stats
    const activeProducts = products.filter((p) => p.status === "active").length;
    const lowStockProducts = products.filter((p) => {
      const totalStock =
        p.sizeStock?.reduce((sum, size) => sum + size.stock, 0) || 0;
      return totalStock > 0 && totalStock <= (p.lowStockThreshold || 5);
    }).length;
    const outOfStockProducts = products.filter((p) => {
      const totalStock =
        p.sizeStock?.reduce((sum, size) => sum + size.stock, 0) || 0;
      return totalStock === 0;
    }).length;

    // Calculate order stats
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const thisWeekOrders = orders.filter(
      (order) => order.createdAt >= startOfWeek
    ).length;

    // Calculate revenue (only from confirmed, processing, shipped, delivered orders)
    const confirmedStatuses = [
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const confirmedThisMonthOrders = thisMonthOrders.filter((order) =>
      confirmedStatuses.includes(order.status)
    );
    const confirmedLastMonthOrders = lastMonthOrders.filter((order) =>
      confirmedStatuses.includes(order.status)
    );
    const confirmedOrders = orders.filter((order) =>
      confirmedStatuses.includes(order.status)
    );

    const thisMonthRevenue = confirmedThisMonthOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const lastMonthRevenue = confirmedLastMonthOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;
    const orderGrowth =
      confirmedLastMonthOrders.length > 0
        ? ((confirmedThisMonthOrders.length - confirmedLastMonthOrders.length) /
            confirmedLastMonthOrders.length) *
          100
        : 0;
    const averageOrderValue =
      confirmedOrders.length > 0
        ? confirmedOrders.reduce((sum, order) => sum + (order.total || 0), 0) /
          confirmedOrders.length
        : 0;

    // Get recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.customer
            ? `${order.customer.firstName || ""} ${
                order.customer.lastName || ""
              }`.trim() ||
              order.customer.username ||
              "Guest"
            : "Guest",
          email: order.customer?.email || "N/A",
        },
        total: order.total || 0,
        status: order.status,
        createdAt: order.createdAt,
      }));

    // Calculate top products based on actual order data
    const productSales = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!productSales[item.product]) {
          productSales[item.product] = {
            count: 0,
            revenue: 0,
          };
        }
        productSales[item.product].count += item.quantity;
        productSales[item.product].revenue += item.totalPrice;
      });
    });

    const topProducts = products
      .map((product) => ({
        _id: product._id,
        name: product.name,
        images: product.images,
        basePrice: product.price,
        salesCount: productSales[product._id]?.count || 0,
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    const stats = {
      overview: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalCategories: categories.length,
        thisMonthRevenue,
        averageOrderValue,
        orderGrowth,
        revenueGrowth,
      },
      products: {
        total: products.length,
        active: activeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      orders: {
        total: orders.length,
        pending: pendingOrders,
        thisMonth: thisMonthOrders.length,
        thisWeek: thisWeekOrders,
        recent: recentOrders,
      },
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: revenueGrowth,
        averageOrderValue,
      },
      charts: {
        salesByDay: [], // Can be implemented later for detailed charts
      },
      topProducts: topProducts,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
