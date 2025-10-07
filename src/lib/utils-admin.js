export function formatPrice(price) {
  if (typeof price !== "number" || isNaN(price)) {
    return "inr0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function getStatusColor(status) {
  const statusColors = {
    active: "text-[#736c5f]",
    inactive: "text-[#827C71]",
    draft: "text-[#827C71]",
    out_of_stock: "text-red-600",
    pending: "text-[#827C71]",
    confirmed: "text-[#91B3C7]",
    processing: "text-[#736c5f]",
    shipped: "text-[#91B3C7]",
    delivered: "text-[#736c5f]",
    cancelled: "text-red-600",
    refunded: "text-[#827C71]",
    paid: "text-[#736c5f]",
    failed: "text-red-600",
  };

  return statusColors[status] || "text-[#827C71]";
}

export function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateDiscountPercentage(originalPrice, discountPrice) {
  if (!originalPrice || !discountPrice || discountPrice >= originalPrice)
    return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}
