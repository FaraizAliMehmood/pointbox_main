import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageCircle, Clock, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { customerApi } from "@/services/api";

interface WebSettings {
  logo?: string;
  logoUrl?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  location?: string;
  instagram?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  [key: string]: unknown;
}

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<WebSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await customerApi.getWebSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await customerApi.submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
      });
      setShowSuccess(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: unknown) {
      console.error('Error submitting contact form:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail, title: "Email Us", content: settings?.email || "support@pointsbox.com", link: `mailto:${settings?.email || "support@pointsbox.com"}`, description: "Send us an email anytime!" },
    { icon: Phone, title: "Call Us", content: settings?.phone || "+1 (555) 123-4567", link: settings?.phone ? `tel:${(settings.phone as string).replace(/\s/g, '')}` : "tel:+15551234567", description: "Mon-Fri from 8am to 6pm" },
    { icon: MapPin, title: "Visit Us", content: settings?.address || "123 Business Street", link: (settings?.location as string) || "https://maps.app.goo.gl/ivhjc5XfG74Qxgwv8", description: settings?.address ? "" : "City, State 12345" },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 min-h-screen">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="text-center mb-16 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-sm text-white">Get in Touch</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Have a question or need help? We're here to assist you. Reach out to us and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{info.title}</h3>
                      <a href={info.link} className="text-purple-100 hover:text-white transition-colors block mb-1">
                        {info.content}
                      </a>
                      <p className="text-purple-200 text-sm">{info.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-yellow-300/30 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-400/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Response Time</h3>
                  <p className="text-purple-100 text-sm">We typically respond within 24 hours during business days.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
            >
              <h3 className="text-white font-semibold mb-4">Follow Us</h3>
              <div className="flex items-center gap-3">
                {settings?.instagram && (
                  <a href={settings.instagram as string} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
                    <Instagram className="text-white w-6 h-6" />
                  </a>
                )}
                {settings?.facebook && (
                  <a href={settings.facebook as string} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Facebook">
                    <Facebook className="text-white w-6 h-6" />
                  </a>
                )}
                {settings?.x && (
                  <a href={settings.x as string} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="X (Twitter)">
                    <img src="/logo-x.png" width={24} height={24} className="w-6 h-6" alt="X" />
                  </a>
                )}
                {settings?.tiktok && (
                  <a href={settings.tiktok as string} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="TikTok">
                    <img src="/footer-tiktok.png" width={24} height={24} className="w-6 h-6" alt="Tiktok" />
                  </a>
                )}
                {settings?.youtube && (
                  <a href={settings.youtube as string} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="YouTube">
                    <Youtube className="text-white w-6 h-6" />
                  </a>
                )}
                {settings?.linkedin && (
                  <a href={settings.linkedin as string} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="LinkedIn">
                    <Linkedin className="text-white w-6 h-6" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl">
                <Send className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Send us a Message</h2>
            </div>

            {showSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-green-500/20 border border-green-400/30 text-green-100 px-4 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Message sent successfully! We'll get back to you soon.</span>
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">Full Name <span className="text-red-300">*</span></label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email Address <span className="text-red-300">*</span></label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">Phone Number</label>
                  <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">Subject <span className="text-red-300">*</span></label>
                  <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent">
                    <option value="" className="bg-purple-800">Select a subject</option>
                    <option value="general" className="bg-purple-800">General Inquiry</option>
                    <option value="support" className="bg-purple-800">Technical Support</option>
                    <option value="billing" className="bg-purple-800">Billing Question</option>
                    <option value="partnership" className="bg-purple-800">Partnership Opportunity</option>
                    <option value="feedback" className="bg-purple-800">Feedback</option>
                    <option value="other" className="bg-purple-800">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">Message <span className="text-red-300">*</span></label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={6} placeholder="Tell us how we can help you..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold py-6 text-lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
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
