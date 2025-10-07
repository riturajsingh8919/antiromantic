import { NextResponse } from "next/server";
import { sendMail } from "@/lib/sendMail";

export async function POST(request) {
  try {
    const { fullName, phone, email, message } = await request.json();

    // Validate required fields
    if (!fullName || !phone || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
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

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
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
        <title>Thank You for Contacting Antiromantic</title>
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
                background: linear-gradient(135deg, #736C5F 0%, #91B3C7 100%);
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
            .message-text {
                font-size: 16px;
                line-height: 1.6;
                color: #28251F;
                margin-bottom: 25px;
            }
            .highlight {
                color: #736C5F;
                font-weight: bold;
            }
            .info-box {
                background-color: #E4DFD3;
                padding: 25px;
                border-radius: 8px;
                margin: 30px 0;
                border-left: 4px solid #91B3C7;
            }
            .info-box h3 {
                color: #28251F;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .info-box p {
                margin: 8px 0;
                color: #827C71;
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
                <h1>Thank You for Reaching Out!</h1>
            </div>
            
            <div class="content">
                <p class="message-text">
                    Hello <span class="highlight">${fullName}</span>,
                </p>
                
                <p class="message-text">
                    Thank you for contacting <strong>Antiromantic</strong>! We've received your message and 
                    our team will get back to you within 24-48 hours.
                </p>
                
                <div class="divider"></div>
                
                <div class="info-box">
                    <h3>Your Message Summary:</h3>
                    <p><strong>Name:</strong> ${fullName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px; color: #28251F; font-style: italic;">
                        "${message}"
                    </p>
                </div>
                
                <p class="message-text">
                    In the meantime, feel free to explore our latest collections and discover pieces that 
                    embrace both ease and elegance, making self-care part of your everyday wear.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${
                      process.env.NEXT_PUBLIC_BASE_URL ||
                      "https://antiromantic.com"
                    }/store" class="cta-button">
                        Browse Our Collection
                    </a>
                </div>
                
                <p style="color: #827C71; font-size: 14px; margin-top: 30px;">
                    For urgent inquiries, you can also reach us directly at the contact information on our website.
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
        <title>New Contact Form Submission</title>
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
                background-color: #827C71;
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
            .contact-info {
                background-color: #E4DFD3;
                padding: 25px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #736C5F;
            }
            .contact-info h3 {
                color: #28251F;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .contact-info p {
                margin: 10px 0;
                color: #28251F;
                line-height: 1.5;
            }
            .highlight {
                color: #736C5F;
                font-weight: bold;
            }
            .message-box {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border: 1px solid #827C71;
            }
            .message-box h4 {
                color: #28251F;
                margin-top: 0;
                margin-bottom: 10px;
            }
            .message-content {
                color: #28251F;
                font-style: italic;
                line-height: 1.6;
            }
            .timestamp {
                color: #827C71;
                font-size: 14px;
                margin-top: 15px;
            }
            .footer {
                background-color: #28251F;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 12px;
            }
            .priority {
                background-color: #91B3C7;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📩 New Contact Form Submission</h1>
            </div>
            
            <div class="content">
                <div class="priority">NEW INQUIRY</div>
                
                <p style="font-size: 16px; color: #28251F; margin-bottom: 25px;">
                    A new contact form has been submitted through the website. Please respond within 24-48 hours.
                </p>
                
                <div class="contact-info">
                    <h3>Contact Information:</h3>
                    <p><strong>Full Name:</strong> <span class="highlight">${fullName}</span></p>
                    <p><strong>Email:</strong> <span class="highlight">${email}</span></p>
                    <p><strong>Phone:</strong> <span class="highlight">${phone}</span></p>
                    <p class="timestamp">
                        Submitted on: ${new Date().toLocaleString("en-US", {
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
                
                <div class="message-box">
                    <h4>Message / Reason for Contact:</h4>
                    <div class="message-content">
                        "${message}"
                    </div>
                </div>
                
                <p style="color: #827C71; font-size: 14px; margin-top: 25px;">
                    The customer has been automatically sent a confirmation email letting them know we'll respond soon.
                </p>
                
                <p style="color: #827C71; font-size: 14px;">
                    <strong>Recommended Actions:</strong><br>
                    • Reply to the customer within 24-48 hours<br>
                    • Use the provided contact information to reach out<br>
                    • Keep the conversation professional and helpful
                </p>
            </div>
            
            <div class="footer">
                <p>Antiromantic Admin Notification System</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send confirmation email to user
    const userEmailResult = await sendMail({
      subject: "Thank you for contacting Antiromantic! 💌",
      receiver: email,
      body: userEmailTemplate,
    });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NODEMAILER_EMAIL;
    const adminEmailResult = await sendMail({
      subject: `New Contact Form Submission - ${fullName}`,
      receiver: adminEmail,
      body: adminEmailTemplate,
    });

    if (userEmailResult.success) {
      return NextResponse.json({
        success: true,
        message:
          "Message sent successfully! We'll get back to you within 24-48 hours.",
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
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
