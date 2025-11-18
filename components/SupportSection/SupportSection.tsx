import React, { useState } from "react";
import { Button } from "../ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import loadingSpinner from "@/public/tube-spinner.svg"
import Image from "next/image";
import { Send, MapPin, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";


interface Inputs {
    name: string;
    email: string;
    message: string;
}

export default function SupportSection() {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true);

        toast.loading("Sending your message...", { toastId: "send-contact" });
        await axios
            .post("/api/contact", data)
            .then(() => {
                toast.update("send-contact", {
                    render: "Message sent! We'll get back to you ASAP ⚡",
                    type: "success",
                    isLoading: false,
                    autoClose: 6000,
                });
                reset();
            })
            .catch((error) => {
                if (error.response?.status === 400) {
                    toast.update("send-contact", {
                        render: error.response.data,
                        type: "error",
                        isLoading: false,
                        autoClose: 6000,
                    });
                } else {
                    toast.update("send-contact", {
                        render: "Oops! Something went wrong! You can always reach us via our social channels.",
                        type: "error",
                        isLoading: false,
                        autoClose: 10000,
                    });
                }
            }).finally(() => setLoading(false));
    };



    return (
        <div className="px-6 md:px-10 mb-32 bg-black" id="support">
                <div className="max-w-7xl mx-auto py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-primary font-medium mb-4 tracking-wider uppercase text-sm"
                    >
                        Contact us
                    </motion.p>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl lg:text-6xl font-bold text-white mb-6"
                    >
                        Get in touch with our team
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-gray-300 max-w-2xl mx-auto"
                    >
                        We have the team and know-how to help you scale your EV charging network faster.
                    </motion.p>
                </div>



                {/* Contact Form and Info */}
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Let&apos;s start a conversation</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Ready to revolutionize EV charging in India? Our team is here to help you build the future of sustainable transportation.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Email us</h4>
                                    <p className="text-gray-300">hello@dewatt.xyz</p>
                                    <p className="text-sm text-gray-400">We&apos;ll respond within 24 hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Call us</h4>
                                    <p className="text-gray-300">+91 98765 43210</p>
                                    <p className="text-sm text-gray-400">Mon-Fri 9AM-6PM IST</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Visit us</h4>
                                    <p className="text-gray-300">Electronic City, Bangalore</p>
                                    <p className="text-sm text-gray-400">India&apos;s Silicon Valley</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="bg-black border border-gray-800 rounded-2xl p-8 shadow-2xl"
                    >
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full p-4 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                                        {...register("name", { required: "Name is required" })}
                                        disabled={loading}
                                    />
                                    {errors.name && (
                                        <span className="text-red-400 text-sm mt-1 block">
                                            {errors.name.message}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full p-4 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                                        {...register("email", { 
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: "Invalid email address"
                                            }
                                        })}
                                        disabled={loading}
                                    />
                                    {errors.email && (
                                        <span className="text-red-400 text-sm mt-1 block">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    placeholder="Tell us about your project or how we can help..."
                                    rows={6}
                                    className="w-full p-4 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none placeholder-gray-500"
                                    {...register("message", { required: "Message is required" })}
                                    disabled={loading}
                                />
                                {errors.message && (
                                    <span className="text-red-400 text-sm mt-1 block">
                                        {errors.message.message}
                                    </span>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Image src={loadingSpinner} alt="loading" width={20} height={20} />
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Send size={20} />
                                        Send Message
                                    </span>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
