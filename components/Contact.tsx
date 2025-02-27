"use client";
import { Button } from "@nextui-org/button";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

export interface ContactFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  query?: string;
  mobileNumber?: string;
}

export default function Contact() {
  const { register, handleSubmit, reset } = useForm();
  const [sending, setSending] = useState(false);

  const handleOnSubmit = async (data: ContactFormData) => {
    setSending(true);
    try {
      await axios.post("/api/contact", data);
      reset();
    } catch (error) {
      console.log("Error while sending email", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.5 }}
      className="w-full flex h-full mx-auto items-center justify-center"
    >
      <div className="w-full">
        <div className="mb-6 max-md:text-center">
          <h1 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-600 dark:from-neutral-50 dark:to-neutral-300 text-4xl md:text-6xl font-bold tracking-wide leading-tight">
            Let&apos;s Connect
          </h1>
          <p className="text-neutral-700 dark:text-neutral-300 mt-2">
            Feel free to reach out for collaborations, inquiries, or just to say
            hi!
          </p>
        </div>
        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit(handleOnSubmit)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="w-full p-4 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
              type="text"
              placeholder="First Name *"
              {...register("firstName", { required: true })}
            />
            <input
              className="w-full p-4 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
              type="text"
              placeholder="Last Name"
              {...register("lastName")}
            />
          </div>
          <input
            className="w-full p-4 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
            type="email"
            placeholder="Email *"
            {...register("email", { required: true })}
          />
          <input
            className="w-full p-4 rounded-lg border border-gray-300 bg-transparent dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none"
            type="tel"
            placeholder="Mobile Number *"
            {...register("mobileNumber", { required: true })}
          />
          <textarea
            className="w-full p-4 h-36 rounded-lg border border-gray-300 bg-transparent dark:border-gray-700 focus:ring-2 dark:focus:ring-neutral-800 focus:ring-neutral-300 focus:outline-none resize-none"
            placeholder="Your Message *"
            {...register("query", { required: true })}
          ></textarea>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              type="submit"
              className="w-full text-lg font-medium dark:bg-neutral-800 bg-neutral-600 text-white py-3 rounded-lg shadow-lg dark:hover:bg-neutral-700 transition-all"
              isLoading={sending}
              endContent={<IoMdSend />}
            >
              Send Message
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
