import { NextResponse } from "next/server";
import { sendMail } from "@/lib/sendMail";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // User confirmation email template
    const userEmailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Antiromantic Newsletter</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #E4DFD3;
                color: #28251F;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #91B3C7 0%, #827C71 100%);
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                color: white;
                margin: 0;
                font-size: 28px;
                font-weight: bold;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            .content {
                padding: 40px 30px;
                background-color: #ffffff;
            }
            .welcome-text {
                font-size: 18px;
                line-height: 1.6;
                color: #28251F;
                margin-bottom: 30px;
            }
            .highlight {
                color: #736C5F;
                font-weight: bold;
            }
            .benefits {
                background-color: #E4DFD3;
                padding: 25px;
                border-radius: 8px;
                margin: 30px 0;
            }
            .benefits h3 {
                color: #28251F;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 20px;
            }
            .benefits ul {
                margin: 0;
                padding-left: 20px;
                color: #827C71;
            }
            .benefits li {
                margin-bottom: 8px;
                line-height: 1.5;
            }
            .cta-button {
                display: inline-block;
                background-color: #736C5F;
                color: white !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
                transition: background-color 0.3s ease;
            }
            .cta-button:hover {
                background-color: #28251F;
            }
            .footer {
                background-color: #28251F;
                color: white;
                padding: 30px;
                text-align: center;
                font-size: 14px;
            }
            .footer a {
                color: #91B3C7;
                text-decoration: none;
            }
            .divider {
                height: 2px;
                background: linear-gradient(90deg, #736C5F 0%, #91B3C7 50%, #827C71 100%);
                margin: 30px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Antiromantic</h1>
            </div>
            
            <div class="content">
                <p class="welcome-text">
                    Hello <span class="highlight">${email}</span>,
                </p>
                
                <p class="welcome-text">
                    Thank you for subscribing to the <strong>Antiromantic Newsletter</strong>! 
                    We're thrilled to have you join our community of fashion enthusiasts who appreciate 
                    timeless elegance and modern style.
                </p>
                
                <div class="divider"></div>
                
                <div class="benefits">
                    <h3>What to Expect:</h3>
                    <ul>
                        <li><strong>Exclusive Collections:</strong> Be the first to discover our latest designs</li>
                        <li><strong>Style Tips:</strong> Expert advice on creating effortless, elegant looks</li>
                        <li><strong>Special Offers:</strong> Subscriber-only discounts and early access to sales</li>
                        <li><strong>Behind the Scenes:</strong> Insights into our design process and inspiration</li>
                        <li><strong>Seasonal Lookbooks:</strong> Curated outfit ideas for every occasion</li>
                    </ul>
                </div>
                
                <p class="welcome-text">
                    Our thoughtfully crafted pieces embrace both ease and elegance, making self-care 
                    part of your everyday wear. We believe in creating clothes that make you feel 
                    confident and comfortable in your own skin.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${
                      process.env.NEXT_PUBLIC_BASE_URL ||
                      "https://antiromantic.com"
                    }/store" class="cta-button">
                        Explore Our Collection
                    </a>
                </div>
                
                <p style="color: #827C71; font-size: 14px; margin-top: 30px;">
                    Stay connected with us on social media for daily inspiration and style updates.
                </p>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing Antiromantic</p>
                <p>
                    <a href="${
                      process.env.NEXT_PUBLIC_BASE_URL ||
                      "https://antiromantic.com"
                    }/privacy-policy">Privacy Policy</a> | 
                    <a href="${
                      process.env.NEXT_PUBLIC_BASE_URL ||
                      "https://antiromantic.com"
                    }/terms-and-condition">Terms & Conditions</a>
                </p>
                <p style="margin-top: 20px; color: #827C71;">
                    © 2025 Antiromantic. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Admin notification email template
    const adminEmailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Newsletter Subscription</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #E4DFD3;
                color: #28251F;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #736C5F;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                color: white;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }
            .content {
                padding: 30px;
                background-color: #ffffff;
            }
            .info-box {
                background-color: #E4DFD3;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #91B3C7;
            }
            .email-highlight {
                color: #736C5F;
                font-weight: bold;
                font-size: 18px;
            }
            .timestamp {
                color: #827C71;
                font-size: 14px;
                margin-top: 10px;
            }
            .footer {
                background-color: #28251F;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 New Newsletter Subscription</h1>
            </div>
            
            <div class="content">
                <p style="font-size: 16px; color: #28251F;">
                    Great news! A new user has subscribed to the Antiromantic newsletter.
                </p>
                
                <div class="info-box">
                    <p style="margin: 0; font-size: 14px; color: #827C71; margin-bottom: 5px;">
                        <strong>New Subscriber Email:</strong>
                    </p>
                    <p class="email-highlight" style="margin: 0;">
                        ${email}
                    </p>
                    <p class="timestamp">
                        Subscribed on: ${new Date().toLocaleString("en-US", {
                          timeZone: "Asia/Kolkata",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })} IST
                    </p>
                </div>
                
                <p style="color: #827C71; font-size: 14px; margin-top: 25px;">
                    The subscriber has been automatically sent a welcome email with information about what to expect from our newsletter.
                </p>
                
                <p style="color: #827C71; font-size: 14px;">
                    You can manage your subscriber list and send newsletters through your admin dashboard.
                </p>
            </div>
            
            <div class="footer">
                <p>Antiromantic Admin Notification System</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send welcome email to user
    const userEmailResult = await sendMail({
      subject: "Welcome to Antiromantic Newsletter! 🌟",
      receiver: email,
      body: userEmailTemplate,
    });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NODEMAILER_EMAIL;
    const adminEmailResult = await sendMail({
      subject: `New Newsletter Subscription - ${email}`,
      receiver: adminEmail,
      body: adminEmailTemplate,
    });

    if (userEmailResult.success) {
      return NextResponse.json({
        success: true,
        message:
          "Successfully subscribed to newsletter! Check your email for confirmation.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send confirmation email. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
