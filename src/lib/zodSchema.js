import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Name can contain only letters and spaces",
    }),

  email: z.string().email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),

  phone: z.string().regex(/^[6-9]\d{9}$/, {
    message:
      "Phone number must be a valid 10-digit Indian mobile number starting with 6-9",
  }),
});
