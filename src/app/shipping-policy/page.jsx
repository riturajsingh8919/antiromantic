"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

function page() {
  // Heading animation
  const headingVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Section animation
  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(5px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <>
      <Header textcolor="#28251F" />
      <section className="relative px-4 pt-[140px] md:px-10 bg-[url('/bg-img.png')] bg-no-repeat bg-cover pb-16 border-b border-[#D0C9BE]">
        <div className="container">
          {/* Page heading */}
          <motion.h1
            className="text-[#28251F] text-2xl font-light mb-8 pb-4 border-b border-[#D0C9BE]"
            initial="hidden"
            animate="visible"
            variants={headingVariants}
          >
            Shipping Policy
          </motion.h1>

          {/* Body copy */}
          <article className="text-[#28251F] text-base leading-relaxed space-y-6">
            {/* Introduction */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <p>
                All ANTIROMANTIC orders are packed and shipped from our studio
                in Bangalore. We operate in small batches — quality takes time,
                and we appreciate your patience.
              </p>
            </motion.div>

            {/* Section 1 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                1. How long will it take to receive my order?
              </h2>
              <p>
                Orders are typically processed within 7–12 working days from the
                date of purchase. This does not include weekends or public
                holidays.
              </p>
              <p>Once shipped, delivery timelines are:</p>
              <ul className="list-disc pl-5">
                <li>Metros: 2–5 working days</li>
                <li>Non-metros & remote areas: 5–10 working days</li>
              </ul>
              <p>
                Please note: The shipping timeline is in addition to the
                processing time.
              </p>
            </motion.div>

            {/* Section 2 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                2. Is Cash on Delivery (COD) available?
              </h2>
              <p>
                No. We do not offer Cash on Delivery. All orders must be prepaid
                via the available payment methods at checkout.
              </p>
            </motion.div>

            {/* Section 3 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                3. How will I know when my order ships?
              </h2>
              <p>
                You'll receive an email (or SMS) with a tracking link once your
                order has been dispatched. Tracking information may take up to
                24 hours to update.
              </p>
            </motion.div>

            {/* Section 4 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                4. What are the shipping charges?
              </h2>
              <p>
                Shipping is free on all orders above inrX. For orders below this
                threshold, a standard shipping fee will be calculated at
                checkout and shown before payment.
              </p>
            </motion.div>

            {/* Section 5 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                5. Do you ship internationally?
              </h2>
              <p>
                We currently do not offer standard international shipping
                through the website. However, if you're located outside India
                and are keen on placing an order, please email us at&nbsp;
                <Link
                  href="mailto:x@shopantiromantic.com"
                  className="underline text-[#28251F]"
                >
                  [x@shopantiromantic.com](mailto:x@shopantiromantic.com)
                </Link>
                &nbsp;with your full address and the item(s) you're interested
                in. We'll do our best to accommodate your request wherever
                possible.
              </p>
            </motion.div>

            {/* Section 6 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                6. What if my order is delayed?
              </h2>
              <p>
                We do our best to ship on time, but delays can occasionally
                happen due to production, courier issues, or unforeseen events.
                While we'll assist wherever possible, ANTIROMANTIC is not liable
                for delays once an order has been handed over to our logistics
                partner.
              </p>
            </motion.div>

            {/* Section 7 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                7. What if my delivery fails or is returned to you?
              </h2>
              <p>
                If an order is returned to us due to incorrect address details
                or repeated failed delivery attempts, we will contact you to
                reship it. In such cases, you will be required to pay for the
                re-shipping. No refunds will be issued for undelivered or
                unclaimed orders.
              </p>
            </motion.div>

            {/* Section 8 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                8. What if my package is lost or damaged in transit?
              </h2>
              <p>
                If your parcel arrives visibly tampered with or damaged, please
                do not accept it and inform the delivery partner immediately.
                Contact us at&nbsp;
                <Link
                  href="mailto:x@shopantiromantic.com"
                  className="underline text-[#28251F]"
                >
                  [x@shopantiromantic.com](mailto:x@shopantiromantic.com)
                </Link>
                &nbsp;within 24 hours with your order number and photos of the
                package. We will assist in raising a claim with the courier.
                However, ANTIROMANTIC is not responsible for loss or damage once
                a package has been dispatched.
              </p>
            </motion.div>

            {/* Section 9 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                9. Need more help?
              </h2>
              <p>
                For any shipping-related questions, reach us at&nbsp;
                <Link
                  href="mailto:x@shopantiromantic.com"
                  className="underline text-[#28251F]"
                >
                  [x@shopantiromantic.com](mailto:x@shopantiromantic.com)
                </Link>
                &nbsp;and we'll be happy to assist.
              </p>
            </motion.div>
          </article>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default page;
