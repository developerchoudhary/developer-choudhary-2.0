"use client";
import { Button } from "@nextui-org/button";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

export interface ContactFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  query?: string;
  mobileNumber?: string;
}

export default function ContactPage() {
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
    <div className="w-full flex h-full items-center justify-center px-4">
      <div className="w-full bg-white max-w-4xl dark:bg-gray-500/[0.15] shadow-xl rounded-xl p-6 sm:p-10">
        <div className="mb-6">
          <h1 className="font-bold text-3xl text-gray-800 dark:text-white">
            Let&apos;s Connect
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Feel free to reach out for collaborations, inquiries, or just to say
            hi!
          </p>
        </div>
        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(handleOnSubmit)}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              className="w-full p-3 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 focus:outline-none"
              type="text"
              placeholder="First Name *"
              {...register("firstName", { required: true })}
            />
            <input
              className="w-full p-3 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 focus:outline-none"
              type="text"
              placeholder="Last Name"
              {...register("lastName")}
            />
          </div>
          <input
            className="w-full p-3 rounded-lg border bg-transparent border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-800 focus:outline-none"
            type="email"
            placeholder="Email *"
            {...register("email", { required: true })}
          />
          <input
            className="w-full p-3 rounded-lg border border-gray-300 bg-transparent dark:border-gray-700 focus:ring-2 focus:ring-gray-800 focus:outline-none"
            type="tel"
            placeholder="Mobile Number *"
            {...register("mobileNumber", { required: true })}
          />
          <textarea
            className="w-full p-3 h-32 rounded-lg border border-gray-300 bg-transparent dark:border-gray-700 focus:ring-2 focus:ring-gray-800 focus:outline-none resize-none"
            placeholder="Your Message *"
            {...register("query", { required: true })}
          ></textarea>
          <Button
            type="submit"
            className="w-full text-lg font-medium"
            color="danger"
            isLoading={sending}
            endContent={<IoMdSend />}
          >
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
