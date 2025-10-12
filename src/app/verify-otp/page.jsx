"use client";

import Image from "next/image";
import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { ButtonLoading } from "@/components/application/ButtonLoading";

function VerifyOTPContent() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email in URL, redirect back to signin
      router.push("/signin");
    }
  }, [searchParams, router]);

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      setIsBlocked(true);
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsBlocked(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsVerifying(true);
      const response = await axios.post("/api/verify-otp", {
        email,
        otp,
      });

      if (response.data.success) {
        toast.success("Email verified successfully! Please login to continue.");
        // Redirect to login page after successful verification
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "OTP verification failed");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (isBlocked) {
      toast.error("Please wait before requesting another OTP");
      return;
    }

    try {
      setIsResending(true);
      const response = await axios.post("/api/resend-otp", {
        email,
      });

      if (response.data.success) {
        toast.success("New OTP sent to your email!");
        setOtp(""); // Clear current OTP
        // Set 10-minute cooldown
        setTimeLeft(600); // 10 minutes = 600 seconds
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (error.response.status === 429 && errorData.timeLeft) {
          // Rate limited - set the remaining time
          setTimeLeft(errorData.timeLeft);
          toast.error(errorData.message);
        } else {
          toast.error(errorData.message || "Failed to resend OTP");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="relative z-0 py-14 bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex items-start justify-start">
            <Image
              src="/sign-in.png"
              alt="signin-image"
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex">
              <Image
                src="/favicon.svg"
                alt="sign-in-icon"
                width={60}
                height={95}
                className="h-14 w-auto object-cover"
              />
            </div>
            <div>
              <h2 className="text-text text-2xl lg:text-3xl">
                Verify Your Email
              </h2>
              <p className="text-text text-base">
                We've sent a 6-digit verification code to{" "}
                <span className="font-normal underline">{email}</span>
              </p>
            </div>

            {/* OTP Verification Form */}
            <div className="flex flex-col gap-6 mt-6">
              <div className="flex flex-col items-start space-y-4">
                <label className="text-base font-normal text-text">
                  Enter verification code
                </label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="w-12 h-12 text-lg border-[#817C73] text-text"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-12 h-12 text-lg border-[#817C73] text-text"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-12 h-12 text-lg border-[#817C73] text-text"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-12 h-12 text-lg border-[#817C73] text-text"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-12 h-12 text-lg border-[#817C73] text-text"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-12 h-12 text-lg border-[#817C73] text-text"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex flex-col space-y-3 w-full">
                <ButtonLoading
                  onClick={handleVerifyOTP}
                  loading={isVerifying}
                  disabled={otp.length !== 6}
                  text="Verify Email"
                  className="bg-transparent w-fit lumin text-text text-3xl shadow-none border-0 hover:bg-transparent hover:shadow-none focus-visible:outline-ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent p-0 leading-0 h-0 cursor-pointer mt-2 hover:text-black hover:scale-110 transition-all duration-300 ease-in-out"
                />

                <div className="text-left mt-10">
                  <span className="text-base text-[#A19888]">
                    Didn't receive the code?{" "}
                  </span>
                  <Button
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isResending || isBlocked}
                    className={`p-0 h-auto text-base font-normal underline ${
                      isBlocked
                        ? "text-[#A19888] cursor-not-allowed"
                        : "text-text cursor-pointer"
                    }`}
                  >
                    {isResending
                      ? "Sending..."
                      : isBlocked
                      ? `Resend OTP (${formatTime(timeLeft)})`
                      : "Resend OTP"}
                  </Button>
                </div>
                <div className="text-base text-text text-left">
                  The verification code will expire in 10 minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <section className="relative z-0 py-14 bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#736c5f]"></div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
                  <p className="text-gray-600">
                    Please wait while we load the verification page
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}

export default VerifyOTPPage;
