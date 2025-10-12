"use client";

import Image from "next/image";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const passwordSchema = z
    .object({
      newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      confirmPassword: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (step === "password") {
      setTimeout(() => {
        passwordForm.reset({
          newPassword: "",
          confirmPassword: "",
        });
        passwordForm.setValue("newPassword", "");
        passwordForm.setValue("confirmPassword", "");
      }, 50);
    }
  }, [step, passwordForm]);

  async function checkEmailHandler(data) {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/reset-password", {
        email: data.email,
        step: "check-email",
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setUserEmail(data.email);
        setStep("password");
      } else {
        toast.error(response.data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
        if (error.response.status === 404) {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resetPasswordHandler(data) {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/reset-password", {
        email: userEmail,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        step: "reset-password",
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Image animation
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

  // Step transition variants
  const stepVariants = {
    initial: {
      opacity: 0,
      x: 50,
      filter: "blur(10px)",
    },
    animate: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      filter: "blur(10px)",
      transition: {
        duration: 0.4,
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
              alt="reset-password-image"
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
                alt="reset-password-icon"
                width={60}
                height={95}
                className="h-14 w-auto object-cover"
              />
            </motion.div>

            {/* Headings with AnimatePresence for smooth transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={formItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-text text-2xl lg:text-3xl">
                  {step === "email"
                    ? "Reset Your Password"
                    : "Create New Password"}
                </h2>
                <p className="text-text text-base">
                  {step === "email"
                    ? "Enter your email to reset your password"
                    : "Enter your new password"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Forms with AnimatePresence */}
            <motion.div variants={formItemVariants}>
              <AnimatePresence mode="wait">
                {step === "email" ? (
                  <motion.div
                    key="email-form"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Form {...emailForm}>
                      <form
                        onSubmit={emailForm.handleSubmit(checkEmailHandler)}
                        className="flex flex-col gap-8"
                      >
                        <FormField
                          control={emailForm.control}
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
                        <p className="text-base">
                          <span className="text-[#A19888]">
                            Remember your password?
                          </span>{" "}
                          <Link href="/login" className="text-text underline">
                            Back to Login
                          </Link>
                        </p>
                        <ButtonLoading
                          loading={loading}
                          type="submit"
                          text="check email"
                          className="bg-transparent w-fit lumin text-text text-3xl shadow-none border-0 hover:bg-transparent hover:shadow-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent p-0 leading-0 h-0 cursor-pointer mt-2 hover:text-black hover:scale-110 transition-all duration-300 ease-in-out"
                        />
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="password-form"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Form {...passwordForm} key={`password-form-${step}`}>
                      <form
                        onSubmit={passwordForm.handleSubmit(
                          resetPasswordHandler
                        )}
                        className="flex flex-col gap-8"
                        autoComplete="off"
                      >
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="mb-3 text-base text-text font-normal">
                                New Password
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="!bg-transparent focus:!outline-none border-l-0 border-t-0 border-r-0 !border-b !border-[#817C73] !rounded-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent placeholder:text-[#A19888] pb-4"
                                  type="password"
                                  placeholder="Enter new password"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="mb-3 text-base text-text font-normal">
                                confirm Password
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="!bg-transparent focus:!outline-none border-l-0 border-t-0 border-r-0 !border-b !border-[#817C73] !rounded-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent placeholder:text-[#A19888] pb-4"
                                  type="password"
                                  placeholder="Confirm new password"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <p className="text-base text-[#A19888]">
                          resetting password for:{" "}
                          <span className="text-text">{userEmail}</span>
                        </p>
                        <p className="text-base">
                          <span className="text-[#A19888]">wrong email?</span>{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setStep("email");
                              setUserEmail("");
                              emailForm.reset();
                            }}
                            className="text-text underline bg-transparent border-none cursor-pointer"
                          >
                            go back
                          </button>
                        </p>
                        <ButtonLoading
                          loading={loading}
                          type="submit"
                          text="reset password"
                          className="bg-transparent w-fit lumin text-text text-3xl shadow-none border-0 hover:bg-transparent hover:shadow-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent p-0 leading-0 h-0 cursor-pointer mt-2 hover:text-black hover:scale-110 transition-all duration-300 ease-in-out"
                        />
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ResetPasswordPage;
