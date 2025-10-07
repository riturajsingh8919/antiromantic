"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { ButtonLoading } from "@/components/application/ButtonLoading";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters long" })
    .max(50, { message: "Full name must be at most 50 characters long" })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Full name can contain only letters and spaces",
    }),

  phone: z.string().regex(/^[6-9]\d{9}$/, {
    message:
      "Phone number must be a valid 10-digit Indian mobile number starting with 6-9",
  }),

  email: z.string().email({ message: "Invalid email address" }),

  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters long" })
    .max(500, { message: "Message must be at most 500 characters long" }),
});

function ContactPopup({ children }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  async function contactHandler(data) {
    try {
      setLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          result.message ||
            "Message sent successfully! We'll get back to you soon."
        );
        form.reset();
        setIsOpen(false);
      } else {
        toast.error(
          result.error || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white/85 border-[#827C71] border-2">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-[#28251F] text-center mb-2">
            Get In Touch
          </DialogTitle>
          <p className="text-text text-center text-base">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </DialogHeader>

        <div className="mt-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(contactHandler)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#28251F] font-medium">
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white border-[#827C71] focus:border-[#736C5F] focus:ring-[#736C5F] text-[#28251F] placeholder:text-[#827C71]"
                        type="text"
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#28251F] font-medium">
                      Phone Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white border-[#827C71] focus:border-[#736C5F] focus:ring-[#736C5F] text-[#28251F] placeholder:text-[#827C71]"
                        type="tel"
                        placeholder="Enter your phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#28251F] font-medium">
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-white border-[#827C71] focus:border-[#736C5F] focus:ring-[#736C5F] text-[#28251F] placeholder:text-[#827C71]"
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#28251F] font-medium">
                      Message / Reason for Contact *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className="bg-white border-[#827C71] focus:border-[#736C5F] focus:ring-[#736C5F] text-[#28251F] placeholder:text-[#827C71] min-h-[120px] resize-none"
                        placeholder="Tell us how we can help you..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Send Message"
                  className="bg-[#E4DFD3] text-[#736C5F] py-3 px-6 text-lg font-bold tracking-wider hover:bg-[#28251F] hover:text-white transition-colors flex items-center justify-center gap-2 border-b-2 border-[#736C5F] cursor-pointer"
                />
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContactPopup;
