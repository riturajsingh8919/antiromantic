// Migration script to update existing products with new customer assistance structure
// Run this script once to migrate existing products from old format to new structured format

import connectDB from "@/lib/connectDB";
import Product from "@/models/Product";

async function migrateCustomerAssistanceData() {
  await connectDB();

  console.log("Starting migration of customer assistance data...");

  try {
    // Find all products with the old string-based customer assistance fields
    const products = await Product.find({
      $or: [
        { sizeGuide: { $type: "string" } },
        { faqSection: { $type: "string" } },
        { customerSupportNotes: { $type: "string" } },
      ],
    });

    console.log(`Found ${products.length} products to migrate`);

    for (const product of products) {
      const updates = {};

      // Migrate sizeGuide from string to structured format
      if (typeof product.sizeGuide === "string" && product.sizeGuide.trim()) {
        // Convert string to bullet points by splitting on common separators
        const bulletPoints = product.sizeGuide
          .split(/[\n\r•\-\*]/)
          .map((point) => point.trim())
          .filter((point) => point.length > 0);

        updates.sizeGuide = {
          bulletPoints: bulletPoints,
          image: "",
        };
      } else {
        updates.sizeGuide = {
          bulletPoints: [],
          image: "",
        };
      }

      // Migrate faqSection from string to structured format
      if (typeof product.faqSection === "string" && product.faqSection.trim()) {
        // Try to parse Q&A pairs from the string
        const faqText = product.faqSection;
        const faqs = [];

        // Look for Q: and A: patterns
        const qaPairs = faqText.split(/Q:|Question:/i).slice(1);

        for (const pair of qaPairs) {
          const answerMatch = pair.match(/(.*?)(?:A:|Answer:)(.*)/i);
          if (answerMatch) {
            const question = answerMatch[1].trim();
            const answer = answerMatch[2].trim();
            if (question && answer) {
              faqs.push({ question, answer });
            }
          } else {
            // If no clear Q&A pattern, create a generic FAQ
            const trimmed = pair.trim();
            if (trimmed) {
              faqs.push({
                question: "General Information",
                answer: trimmed,
              });
            }
          }
        }

        updates.faqSection = faqs;
      } else {
        updates.faqSection = [];
      }

      // Migrate customerSupportNotes from string to array
      if (
        typeof product.customerSupportNotes === "string" &&
        product.customerSupportNotes.trim()
      ) {
        // Convert string to array by splitting on common separators
        const notes = product.customerSupportNotes
          .split(/[\n\r•\-\*]/)
          .map((note) => note.trim())
          .filter((note) => note.length > 0);

        updates.customerSupportNotes = notes;
      } else {
        updates.customerSupportNotes = [];
      }

      // Update the product
      await Product.findByIdAndUpdate(product._id, updates);
      console.log(`✓ Migrated product: ${product.name}`);
    }

    console.log(`Successfully migrated ${products.length} products`);

    // Verify migration
    const migratedProducts = await Product.find({
      $and: [
        { "sizeGuide.bulletPoints": { $exists: true } },
        { faqSection: { $type: "array" } },
        { customerSupportNotes: { $type: "array" } },
      ],
    }).countDocuments();

    console.log(
      `Verification: ${migratedProducts} products now have the new structure`
    );
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Uncomment the line below to run the migration
// migrateCustomerAssistanceData();

export default migrateCustomerAssistanceData;
