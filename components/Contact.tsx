"use client";

import { Button } from "@nextui-org/button";
import { IoMdSend } from "react-icons/io";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
} from "react-icons/fa";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import Link from "next/link";

// Contact form data structure
export interface ContactFormData {
  firstName: string;
  lastName?: string;
  email: string;
  query: string;
  mobileNumber: string;
}

// Validation rules for the contact form
const formValidation = {
  firstName: {
    required: "First name is required",
    pattern: {
      value: /^[A-Za-z]+$/,
      message: "First name must contain only letters",
    },
  },
  lastName: {},
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  mobileNumber: {
    required: "Mobile number is required",
    pattern: {
      value: /^(\+91[\s-]?|91[\s-]?)?\d{5}[\s-]?\d{5}$/,
      message: "Please enter a valid mobile number",
    },
  },
  query: {
    required: "Please enter your message",
    maxLength: {
      value: 500,
      message: "Message must not exceed 500 characters",
    },
  },
};

// Contact info and social links
const contactInfo = [
  {
    icon: FaEnvelope,
    title: "Email",
    value: "contact@developerchoudhary.com",
    link: "mailto:contact@developerchoudhary.com",
  },
  {
    icon: FaPhone,
    title: "Phone",
    value: "+91 95303 63236",
    link: "tel:+919530363236",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Location",
    value: "Sri Ganganagar, Rajasthan",
    link: null,
  },
];

const socialLinks = [
  {
    icon: FaGithub,
    name: "GitHub",
    url: "https://github.com/developerchoudhary",
    color:
      "text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white",
  },
  {
    icon: FaInstagram,
    name: "Instagram",
    url: "https://www.instagram.com/developer_choudhary/",
    color: "text-rose-400 hover:text-rose-500",
  },
  {
    icon: FaFacebook,
    name: "Facebook",
    url: "https://www.facebook.com/DeveloperChoudhary",
    color: "text-blue-400 hover:text-blue-500",
  },
  {
    icon: FaWhatsapp,
    name: "WhatsApp",
    url: "https://wa.me/919530363236",
    color: "text-green-500 hover:text-green-600",
  },
];

// Contact Section: Info cards, social links, and contact form
export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ContactFormData>();

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const queryLength = watch("query")?.length || 0;

  // Remove messages after a delay
  const removeMessages = () => {
    setTimeout(() => {
      setSuccessMessage(null);
      setServerError(null);
    }, 5000);
  };

  // Handle form submission
  const handleOnSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      await axios.post("/api/contact", data);
      setSuccessMessage(
        "Thank you for your message! I will get back to you soon.",
      );
      removeMessages();
      reset();
    } catch (error) {
      setServerError("Oops! Something went wrong. Please try again later.");
      removeMessages();
      console.error("Error while sending email:", error);
    }
  };

  // Custom input component for form fields
  const FormInput = ({
    name,
    label,
    type = "text",
    placeholder,
    register: registerField,
    error,
    className = "",
  }: {
    name: keyof ContactFormData;
    label: string;
    type?: string;
    placeholder?: string;
    register: any;
    error?: string;
    className?: string;
  }) => (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...registerField(name, formValidation[name])}
        className={`w-full px-4 py-3 rounded-lg border glass ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
        } focus:outline-none focus:ring-2 dark:bg-gray-800/50 dark:text-white transition-all duration-300`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );

  return (
    <section className="py-10 px-4 md:px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">Let&apos;s</span>
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Connect
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ready to start a project or just want to chat? I&apos;d love to hear
            from you!
          </p>
        </motion.div>

        {/* Main Grid: Info and Form, responsive for all screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information: Info cards, social links, and availability */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <info.icon className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                    </div>
                    <div className="overflow-auto max-w-full">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {info.title}
                      </h3>
                      {info.link ? (
                        <div className="overflow-auto whitespace-nowrap max-w-full">
                          <Link
                            href={info.link}
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                          >
                            {info.value}
                          </Link>
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Follow Me
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className={`p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Availability Card */}
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Availability
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>✅ Available for new projects</p>
                <p>✅ Open to freelance opportunities</p>
                <p>✅ Quick response time (within 24 hours)</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form: Responsive and accessible */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="glass p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send Me a Message
              </h3>

              <form
                onSubmit={handleSubmit(handleOnSubmit)}
                className="space-y-6"
              >
                {/* Name Fields: Responsive grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name="firstName"
                    label="First Name"
                    placeholder="Aman"
                    register={register}
                    error={errors.firstName?.message}
                  />
                  <FormInput
                    name="lastName"
                    label="Last Name (Optional)"
                    placeholder="Choudhary"
                    register={register}
                  />
                </div>

                {/* Email and Mobile Fields */}
                <FormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="contact@developerchoudhary.com"
                  register={register}
                  error={errors.email?.message}
                />

                <FormInput
                  name="mobileNumber"
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91 95303 63236"
                  register={register}
                  error={errors.mobileNumber?.message}
                />

                {/* Message Field: Responsive textarea */}
                <div className="w-full">
                  <label
                    htmlFor="query"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Your Message
                  </label>
                  <textarea
                    placeholder="Tell me about your project or what you'd like to discuss..."
                    {...register("query", formValidation.query)}
                    className={`w-full px-4 py-3 rounded-lg border glass min-h-[150px] resize-y ${
                      errors.query
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 dark:bg-gray-800/50 dark:text-white transition-all duration-300`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.query && (
                      <p className="text-sm text-red-500">
                        {errors.query.message}
                      </p>
                    )}
                    <span className="text-sm text-gray-500">
                      {queryLength}/500
                    </span>
                  </div>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg"
                  >
                    {successMessage}
                  </motion.div>
                )}

                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg"
                  >
                    {serverError}
                  </motion.div>
                )}

                {/* Submit Button: Responsive and accessible */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <IoMdSend className="w-5 h-5" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
