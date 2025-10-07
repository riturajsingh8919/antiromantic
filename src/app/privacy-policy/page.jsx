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
            privacy policy
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
                This Privacy Policy explains how ANTIROMANTIC ("we," "our," or
                "us") collects, uses, shares, and safeguards your personal
                information when you use our website&nbsp;
                <Link
                  href="https://www.shopantiromantic.com"
                  className="underline text-[#28251F]"
                >
                  [www.shopantiromantic.com](https://www.shopantiromantic.com)
                </Link>
                &nbsp;(the "Site"). By accessing or using this website, you
                agree to the terms of this Privacy Policy and give your consent
                to the collection, storage, use, and disclosure of your
                information as outlined here.
              </p>
              <p>
                We are committed to complying with all applicable laws including
                the Information Technology Act, 2000 and its related rules.
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
                1. Information We Collect
              </h2>

              <h3 className="font-bold text-[#817C73]">
                A. Information You Provide:
              </h3>
              <p>
                When you interact with us—such as placing an order, creating an
                account, subscribing to emails, or contacting customer
                support—we collect details including your name, phone number,
                email ID, shipping and billing addresses, and payment
                information (which is processed securely via third-party
                gateways). We also retain records of your communication with us.
              </p>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h3 className="mt-4 font-bold text-[#817C73]">
                B. Information Collected Automatically:
              </h3>
              <p>
                When you use our Site, we automatically collect information such
                as your IP address, browser type, device identifiers, pages
                visited, time spent, and referring URLs. This data is collected
                via cookies, pixels, and similar technologies including Meta
                Pixel and Google Analytics.
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
                2. How We Use Your Information
              </h2>

              <p>
                We use your personal data to fulfill orders, process payments
                and returns, communicate with you about your purchases, and
                respond to your queries. We also use the information to improve
                site functionality, enhance user experience, detect fraud or
                misuse, and for internal analysis. With your explicit consent,
                we may send you newsletters, offers, or updates about our
                products and brand. Additionally, we may process your data to
                comply with legal obligations, protect our legal rights, or
                enforce our terms and conditions.
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
                3. Cookies and Tracking Technologies
              </h2>

              <p>
                We use cookies and tracking tools like Meta Pixel and Google
                Analytics to remember your preferences, personalize your
                experience, and understand site usage. These technologies also
                help us track the effectiveness of our marketing campaigns. You
                may choose to disable cookies via your browser settings, but
                this may impact site functionality.
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
                4. Marketing & Communication Preferences
              </h2>

              <p>
                You have the option to opt out of receiving marketing
                communications at any time by using the "unsubscribe" link in
                our emails or by contacting us directly at&nbsp;
                <span className="underline text-[#28251F]">
                  [x@shopantiromantic.com](mailto:x@shopantiromantic.com)
                </span>
                . Even if you opt out of promotional messages, we may still
                contact you with transactional or service-related messages (such
                as order confirmation or shipping updates).
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
                5. Sharing of Information
              </h2>

              <p>
                We do not sell or rent your personal data. However, we may share
                your information with trusted third parties such as delivery
                partners, secure payment processors, IT service providers, and
                marketing tools—only for the purposes outlined above. These
                third parties are contractually obligated to handle your data
                securely and confidentially. In the event of a business
                acquisition, merger, reorganization, or sale of assets, your
                information may be transferred as part of that transaction, in
                accordance with applicable laws. We may also disclose your
                personal data to comply with legal obligations, respond to
                lawful requests from authorities, or defend against legal
                claims.
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
                6. Data Storage and Security
              </h2>

              <p>
                Your information is stored on secure servers and may be
                processed using trusted third-party services located within or
                outside India. We implement appropriate physical, electronic,
                and organizational measures to protect your data from
                unauthorized access, misuse, loss, or destruction. This includes
                SSL encryption, secure servers, and restricted access protocols.
                While we strive to protect your information, no method of
                transmission over the Internet or electronic storage is 100%
                secure, and we cannot guarantee absolute security.
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
                7. Your Rights and Choices
              </h2>

              <p>
                You have the right to access, correct, or delete your personal
                information. You may also request that we stop processing your
                data or withdraw consent where applicable. Please note that
                certain data may need to be retained for legal or business
                reasons. To exercise any of your rights or raise concerns,
                contact us at&nbsp;
                <span className="underline text-[#28251F]">
                  [x@shopantiromantic.com](mailto:x@shopantiromantic.com)
                </span>
                .
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
                8. Third-Party Services and Links
              </h2>

              <p>
                Our Site may contain links to other websites and services not
                operated by us. We are not responsible for the privacy practices
                or content of those external sites. We recommend reviewing their
                privacy policies before submitting any personal information.
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
                9. Children's Privacy
              </h2>

              <p>
                We do not knowingly collect data from individuals under the age
                of 18. If we discover that we have collected personal
                information from a minor without verified parental consent, we
                will delete it immediately.
              </p>
            </motion.div>

            {/* Section 10 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                10. Retention of Data
              </h2>

              <p>
                We retain personal data only as long as necessary to fulfill the
                purposes outlined in this policy or as required by law,
                including for tax, accounting, or legal obligations.
              </p>
            </motion.div>

            {/* Section 11 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                11. Business Transfers
              </h2>

              <p>
                In the event of a merger, acquisition, sale, or reorganization,
                your personal information may be part of the transferred assets.
                You acknowledge that such transfers may occur and are permitted
                under this Privacy Policy.
              </p>
            </motion.div>

            {/* Section 12 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                12. Governing Law and Jurisdiction
              </h2>

              <p>
                This Privacy Policy is governed by the laws of India. All
                disputes arising under or in connection with this Policy shall
                be subject to the exclusive jurisdiction of the courts in
                Bangalore, Karnataka.
              </p>
            </motion.div>

            {/* Section 13 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                13. Policy Updates
              </h2>

              <p>
                We may update this Privacy Policy periodically to reflect
                changes in our practices, technology, or legal requirements. Any
                such changes will be posted on this page with a new "Effective
                Date." Continued use of the Site constitutes acceptance of the
                updated policy.
              </p>
            </motion.div>

            {/* Section 14 */}
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
            >
              <h2 className="mt-8 mb-2 text-[#28251F] text-2xl">
                14. Contact Us
              </h2>

              <p>
                If you have any questions or concerns regarding this Privacy
                Policy or how we handle your personal information, you can reach
                us at&nbsp;
                <Link
                  href="mailto:x@shopantiromantic.com"
                  className="underline text-[#28251F]"
                >
                  [x@shopantiromantic.com](mailto:x@shopantiromantic.com)
                </Link>
                .
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
