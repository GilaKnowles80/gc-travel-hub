import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowLeft, Facebook, Instagram, X, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      await base44.integrations.Core.SendEmail({
        to: "info@gctraveltours.com",
        subject: `Contact Form: ${data.subject}`,
        body: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, '<br>')}</p>
        `,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessageMutation.mutate(formData);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+639154401150 (GLOBE)", "+639620595263 (SMART)"],
      color: "amber",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@gctravelandtours.com", "support@gctravelandtours.com"],
      color: "blue",
    },
    {
      icon: MapPin,
      title: "Office",
      details: ["Block 12, Lot 8, Kapatiran Village", "Pasong Buaya 2, Imus, Cavite 4103", "Philippines"],
      color: "green",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9 AM - 6 PM", "Saturday: 10 AM - 4 PM", "24/7 Online Transactions"],
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Get in Touch</h1>
          <p className="text-lg text-slate-600">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, idx) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 border-0 shadow-sm h-full">
                <div className={`w-12 h-12 rounded-xl bg-${info.color}-100 flex items-center justify-center mb-4`}>
                  <info.icon className={`w-6 h-6 text-${info.color}-600`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-slate-600 text-sm">
                      {detail}
                    </p>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-8 border-0 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+63 917 123 4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="booking">Booking Assistance</SelectItem>
                        <SelectItem value="cancellation">Cancellation/Refund</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    className="w-full bg-amber-500 hover:bg-amber-600"
                  >
                    {sendMessageMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-8 border-0 shadow-sm h-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Visit Our Office</h2>
              <div className="aspect-video bg-slate-200 rounded-xl mb-6 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.6245789012345!2d120.88457!3d14.30698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd64c5f0a0a0a1%3A0xblock12kapatiran!2sBlock%2012%20Lot%208%20Kapatiran%20Village%20Pasong%20Buaya%202%20Imus%20Cavite%204103!5e0!3m2!1sen!2s!4v1708998456789"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Quick Tips</h3>
                  <ul className="space-y-2 text-slate-600 text-sm">
                    <li>• Response time: Within 24 hours on business days</li>
                    <li>• For urgent matters, please call us directly</li>
                    <li>• Include your booking reference for faster assistance</li>
                    <li>• Check our FAQ page for instant answers</li>
                  </ul>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Follow Us</h3>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Facebook">
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center transition-colors" title="Instagram">
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors" title="X (Twitter)">
                      <X className="w-5 h-5 text-slate-700" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center transition-colors" title="YouTube">
                      <Youtube className="w-5 h-5 text-red-600" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}