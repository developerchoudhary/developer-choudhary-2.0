"use client";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export interface ContactFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  query?: string;
  mobileNumber?: string;
}

export default function ContactPage() {
  const { register, setValue, handleSubmit } = useForm();
  const [sending, setSending]: any = useState(false);

  const handleOnSubmit = async (data: ContactFormData) => {
    setSending(true);
    const contactData = data;
    try {
      await axios.post("/api/contact", contactData);
    } catch (error) {
      throw new Error(`Error sending email - ${error}`);
    } finally {
      setSending(false);
    }
  };
  useEffect(() => {
    return () => {
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("email", "");
      setValue("mobileNumber", "");
      setValue("query", "");
    };
  }, [sending, setValue]);

  return (
    <div className="w-11/12 h-full mx-auto">
      <div className="flex w-full items-center justify-center h-full">
        <div
          id="contact-form"
          className="border w-full border-stone-700 rounded-xl p-7 sm:p-16"
        >
          <div className="flex flex-col gap-3 mb-4">
            <h1 className="font-bold text-2xl">Let&apos;s Connect</h1>
            <p className="dark:text-white/60 text-stone-500">
              Feel free to reach out for collaborations, inquiries, or just to
              say hi!
            </p>
          </div>
          <form
            className="flex flex-col sm:gap-8 gap-4"
            onSubmit={handleSubmit(handleOnSubmit)}
          >
            <div className="flex gap-4 sm:gap-y-8 max-sm:flex-col">
              <Input
                label="First Name"
                className="z-10"
                type="text"
                placeholder="Enter your first name"
                {...register("firstName", { required: true })}
              />
              <Input
                label="Last Name"
                className="z-10"
                type="text"
                placeholder="Enter your last name"
                {...register("lastName")}
              />
            </div>
            <div className="z-10">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
              />
            </div>
            <div className="z-10">
              <Input
                label="Mobile Number"
                type="phone"
                placeholder="Enter your contact number"
                {...register("mobileNumber", { required: true })}
              />
            </div>
            <div className="z-10">
              <Textarea
                label="Query"
                placeholder="Enter your query"
                minRows={20}
                {...register("query")}
              />
            </div>
            <Button
              type="submit"
              className="z-10"
              color="danger"
              isLoading={sending}
              endContent={<IoMdSend />}
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
