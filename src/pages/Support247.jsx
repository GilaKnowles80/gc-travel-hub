import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Phone, Mail, MessageCircle, Clock, MapPin, ArrowLeft, Headphones } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Support247() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us Anytime",
      color: "text-green-600",
      bgColor: "bg-green-50",
      items: [
        { label: "Main Line", value: "+63 915 440 1150", link: "tel:+639154401150" },
        { label: "Alternative", value: "+63 915 440 1150", link: "tel:+639154401150" }
      ]
    },
    {
      icon: Mail,
      title: "Email Support",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        { label: "General Inquiries", value: "info@gctravelandtours.com", link: "mailto:info@gctravelandtours.com" },
        { label: "Bookings", value: "gctravelandtours2021@gmail.com", link: "mailto:gctravelandtours2021@gmail.com" },
        { label: "Support", value: "support@gctravelandtours.com", link: "mailto:support@gctravelandtours.com" }
      ]
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        { label: "Website Chat", value: "Available on this page", link: "#" },
        { label: "Response Time", value: "Usually within 5 minutes", link: "#" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <Link to={createPageUrl("Home")} className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <Headphones className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">24/7 Customer Support</h1>
          <p className="text-lg text-slate-600">Round-the-clock assistance wherever you are in the world</p>
        </div>

        <div className="space-y-6">
          {contactMethods.map((method, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${method.bgColor}`}>
                    <method.icon className={`w-6 h-6 ${method.color}`} />
                  </div>
                  {method.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {method.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600">{item.label}</span>
                    <a 
                      href={item.link} 
                      className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold mb-2">Phone Support</p>
                  <p className="text-sm">24 hours a day, 7 days a week</p>
                  <p className="text-sm text-slate-600">Emergency hotline always available</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Email Support</p>
                  <p className="text-sm">Monitored 24/7</p>
                  <p className="text-sm text-slate-600">Response within 2-4 hours</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Live Chat</p>
                  <p className="text-sm">9:00 AM - 10:00 PM (PHT)</p>
                  <p className="text-sm text-slate-600">Extended hours on weekends</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Office Visits</p>
                  <p className="text-sm">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-slate-600">Sunday: By appointment only</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-red-600" />
                Visit Our Office
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-700">
                <strong>Address:</strong><br />
                Block 12, Lot 8, Kapatiran Village<br />
                Pasong Buaya 2, Imus, Cavite 4103<br />
                Philippines
              </p>
              <p className="text-sm text-slate-600">
                Walk-ins are welcome! We recommend calling ahead to ensure availability.
              </p>
              <Link to={createPageUrl("Contact")}>
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Get Directions
                </button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Emergency Travel Assistance
              </h3>
              <p className="text-slate-700 mb-3">
                For urgent matters during your trip (flight delays, cancellations, emergencies):
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-blue-900">Emergency Hotline: +63 915 440 1150</p>
                <p className="text-sm text-slate-600">Available 24/7 for all travelers with active bookings</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <p className="text-slate-600 mb-4">Need immediate assistance?</p>
            <div className="flex gap-4 justify-center">
              <a href="tel:+639154401150">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Now
                </button>
              </a>
              <a href="mailto:info@gctravelandtours.com">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Us
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}