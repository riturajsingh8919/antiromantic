import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import GoToTopButton from "@/components/ui/GoToTopButton";
import "./globals.css";

export const metadata = {
  title: "antiromantic",
  description: "A unique platform for personalized experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </AuthProvider>
        <GoToTopButton />
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
