import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/UserModel";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch user's wishlist
export async function GET(request) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find user first
    const user_doc = await UserModel.findById(user.id);
    if (!user_doc) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Initialize wishlist if it doesn't exist (for existing users)
    if (!user_doc.wishlist) {
      user_doc.wishlist = [];
      await user_doc.save();
    }

    // Get product IDs from wishlist
    const productIds = user_doc.wishlist.map((item) => item.productId);

    // If wishlist is empty, return empty array
    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        wishlist: [],
      });
    }

    // Fetch products separately
    const products = await Product.find({
      _id: { $in: productIds },
    }).select(
      "name price comparePrice images slug category colorName sizeStock totalStock isFeatured"
    );

    // Create a map for easy lookup
    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // Build wishlist items with product details
    const validWishlistItems = user_doc.wishlist
      .filter((item) => productMap[item.productId.toString()])
      .map((item) => {
        const product = productMap[item.productId.toString()];
        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          comparePrice: product.comparePrice,
          images: product.images,
          slug: product.slug,
          category: product.category,
          colorName: product.colorName,
          sizeStock: product.sizeStock,
          totalStock: product.totalStock,
          isFeatured: product.isFeatured,
          addedAt: item.addedAt,
        };
      });

    return NextResponse.json({
      success: true,
      wishlist: validWishlistItems,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(request) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Find user and check if item is already in wishlist
    const userDoc = await UserModel.findById(user.id);
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Initialize wishlist if it doesn't exist (for existing users)
    if (!userDoc.wishlist) {
      userDoc.wishlist = [];
    }

    const existingItem = userDoc.wishlist.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: "Item already in wishlist" },
        { status: 400 }
      );
    }

    // Add to wishlist
    userDoc.wishlist.push({
      productId: productId,
      addedAt: new Date(),
    });

    await userDoc.save();

    return NextResponse.json({
      success: true,
      message: "Item added to wishlist",
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        images: product.images,
        slug: product.slug,
        category: product.category,
        colorName: product.colorName,
        sizeStock: product.sizeStock,
        totalStock: product.totalStock,
        isFeatured: product.isFeatured,
        addedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request) {
  try {
    await connectDB();

    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find user and remove item from wishlist
    const userDoc = await UserModel.findById(user.id);
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Initialize wishlist if it doesn't exist (for existing users)
    if (!userDoc.wishlist) {
      userDoc.wishlist = [];
    }

    const initialLength = userDoc.wishlist.length;
    userDoc.wishlist = userDoc.wishlist.filter(
      (item) => item.productId.toString() !== productId
    );

    if (userDoc.wishlist.length === initialLength) {
      return NextResponse.json(
        { success: false, error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    await userDoc.save();

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
