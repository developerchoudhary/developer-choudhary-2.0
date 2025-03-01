"use client";

import { Button } from "@nextui-org/button";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

// Define the contact form data structure
export interface ContactFormData {
  firstName: string;
  lastName?: string;
  email: string;
  query: string;
  mobileNumber: string;
}

export default function Contact() {
  // Form handling with validation using react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const removeSuccessMessagehandler = () => {
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Handle form submission
  const handleOnSubmit = async (data: ContactFormData) => {
    try {
      await axios.post("/api/contact", data);
      setSuccessMessage("Your message has been sent successfully!");
      removeSuccessMessagehandler();
      reset();
    } catch (error) {
      setServerError("Failed to send your message. Please try again.");
      console.error("Error while sending email:", error);
    }
  };

  // Define animation variants for reuse
  const fadeInUp = (delay: number = 0.2) => ({
    initial: { opacity: 0, y: 100 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut", delay },
    viewport: { once: true, amount: 0.5 },
  });

  return (
    <motion.div className="w-full flex h-full mx-auto items-center justify-center">
      <div className="w-full">
        {/* Heading Section */}
        <div className="mb-6 text-center">
          <motion.h1
            {...fadeInUp(0.2)}
            className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl font-bold tracking-wide leading-tight"
          >
            Let&apos;s Connect
          </motion.h1>
          <motion.p
            {...fadeInUp(0.4)}
            className="text-neutral-700 dark:text-neutral-300 mt-2"
          >
            Feel free to reach out for collaborations, inquiries, or just to say
            hi!
          </motion.p>
        </div>

        {/* Contact Form */}
        <motion.form
          {...fadeInUp(0.5)}
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(handleOnSubmit)}
        >
          {/* Name Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                className="w-full p-4 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2  dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
                type="text"
                placeholder="First Name *"
                {...register("firstName", {
                  required: "First Name is required",
                })}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <input
              className="w-full p-4 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
              type="text"
              placeholder="Last Name"
              {...register("lastName")}
            />
          </div>

          {/* Email Input */}
          <div>
            <input
              className="w-full p-4 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
              type="email"
              placeholder="Email *"
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Mobile Number Input */}
          <div>
            <input
              className="w-full p-4 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
              type="tel"
              placeholder="Mobile Number *"
              {...register("mobileNumber", {
                required: "Mobile number is required",
              })}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-sm">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>

          {/* Query Textarea */}
          <div>
            <textarea
              className="w-full p-4 h-36 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none resize-none"
              placeholder="Your Message *"
              {...register("query", { required: "Message cannot be empty" })}
            ></textarea>
            {errors.query && (
              <p className="text-red-500 text-sm">{errors.query.message}</p>
            )}
          </div>

          {/* Success/Error Message */}
          {serverError && (
            <p className="text-red-500 text-sm text-center">{serverError}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm text-center">
              {successMessage}
            </p>
          )}

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              type="submit"
              className="w-full text-lg font-medium dark:bg-neutral-800 bg-neutral-600 text-white py-3 rounded-lg shadow-lg dark:hover:bg-neutral-700 transition-all"
              isLoading={isSubmitting}
              endContent={<IoMdSend />}
            >
              Send Message
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
}
