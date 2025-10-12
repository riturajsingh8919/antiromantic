"use client";

import Image from "next/image";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/lib/zodSchema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ButtonLoading } from "@/components/application/ButtonLoading";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function LogInPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  const formSchema = userSchema.pick({
    email: true,
    password: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function loginHandler(data) {
    try {
      setLoading(true);
      const loginResponse = await axios.post("/api/auth/login", data);

      if (loginResponse.data.success) {
        toast.success("Login successful!");
        form.reset();
        await checkAuth();
        router.push("/");
      } else {
        toast.error(loginResponse.data.message || "Login failed");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;

        if (errorMessage === "Please verify your email before logging in") {
          toast.error(
            "Email not verified. Redirecting to verification page..."
          );
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        } else {
          toast.error(errorMessage || "Login failed");
        }
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  // Image animation - slide from left
  const imageVariants = {
    hidden: {
      opacity: 0,
      x: -80,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Form content stagger
  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  // Individual form item animation
  const formItemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative min-h-[100vh] z-0 py-14 bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat px-4">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left side - Image */}
          <motion.div
            className="flex items-start justify-start"
            initial="hidden"
            animate="visible"
            variants={imageVariants}
          >
            <Image
              src="/sign-in.png"
              alt="signin-image"
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            className="flex flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={formContainerVariants}
          >
            {/* Icon */}
            <motion.div className="flex" variants={formItemVariants}>
              <Image
                src="/favicon.svg"
                alt="sign-in-icon"
                width={60}
                height={95}
                className="h-14 w-auto object-cover"
              />
            </motion.div>

            {/* Headings */}
            <motion.div variants={formItemVariants}>
              <h2 className="text-text text-2xl lg:text-3xl">
                Tailored Access, Just for You
              </h2>
              <p className="text-text text-base">
                Please login to your account
              </p>
            </motion.div>

            {/* Form */}
            <motion.div variants={formItemVariants}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(loginHandler)}
                  className="flex flex-col gap-8"
                >
                  {/* Email Field */}
                  <motion.div variants={formItemVariants}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="mb-3 text-base text-text font-normal">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="!bg-transparent focus:!outline-none border-l-0 border-t-0 border-r-0 !border-b !border-[#817C73] !rounded-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent placeholder:text-[#A19888] pb-4"
                              type="email"
                              placeholder="example@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Password Field */}
                  <motion.div variants={formItemVariants}>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="mb-3 text-base text-text font-normal">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={
                                "!bg-transparent focus:!outline-none border-l-0 border-t-0 border-r-0 !border-b !border-[#817C73] !rounded-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent placeholder:text-[#A19888] pb-4"
                              }
                              type="password"
                              placeholder="enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Create Account Link */}
                  <motion.p className="text-base" variants={formItemVariants}>
                    <span className="text-[#A19888]">New on our platform?</span>{" "}
                    <Link href="/signin" className="text-text underline">
                      Create an account
                    </Link>
                  </motion.p>

                  {/* Reset Password Link */}
                  <motion.p
                    className="text-base -mt-4"
                    variants={formItemVariants}
                  >
                    <span className="text-[#A19888]">Forgot Password?</span>{" "}
                    <Link
                      href="/reset-password"
                      className="text-text underline"
                    >
                      Reset here
                    </Link>
                  </motion.p>

                  {/* Submit Button */}
                  <motion.div variants={formItemVariants}>
                    <ButtonLoading
                      loading={loading}
                      type="submit"
                      text="log in"
                      className="bg-transparent w-fit lumin text-text text-3xl shadow-none border-0 hover:bg-transparent hover:shadow-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent p-0 leading-0 h-0 cursor-pointer mt-2 hover:text-black hover:scale-110 transition-all duration-300 ease-in-out"
                    />
                  </motion.div>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default LogInPage;
