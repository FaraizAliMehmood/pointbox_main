import { useState, useEffect } from "react";
import { Instagram, Gift, Facebook, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { customerApi } from "@/services/api";

export const Footer = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [socialLinks, setSocialLinks] = useState<{
    instagram?: string;
    facebook?: string;
    x?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  }>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLogoLoading(true);
        const response = await customerApi.getWebSettings();
        if (response.success && response.data) {
          setLogo(response.data.logo || response.data.logoUrl || null);
          setSocialLinks({
            instagram: response.data.instagram || '',
            facebook: response.data.facebook || '',
            x: response.data.x || '',
            tiktok: response.data.tiktok || '',
            youtube: response.data.youtube || '',
            linkedin: response.data.linkedin || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setSubscribeMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsSubscribing(true);
    setSubscribeMessage(null);

    try {
      const response = await customerApi.createNewsletterEmail(email);
      if (response.success) {
        setSubscribeMessage({ type: 'success', text: 'Successfully subscribed to newsletter!' });
        setEmail("");
        setTimeout(() => {
          setSubscribeMessage(null);
        }, 3000);
      }
    } catch (error: unknown) {
      setSubscribeMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to subscribe. Please try again.'
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className='text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
      <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
        <div className='max-w-80'>
          <div className="flex items-center gap-2">
            {logoLoading ? (
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
            ) : logo ? (
              <div className="relative w-10 h-10">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <Gift className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <div className="text-xl text-gray-900">PointBox</div>
              <div className="text-xs text-gray-500 -mt-1">Loyalty Program</div>
            </div>
          </div>
          <div className='flex items-center gap-3 mt-4'>
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Instagram className='text-purple-600 w-6 h-6' />
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Facebook className='text-purple-600 w-6 h-6' />
              </a>
            )}
            {socialLinks.x && (
              <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src="/logo-x.png" width={24} height={24} className="w-6 h-6" alt="X" />
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img src="/footer-tiktok.png" width={24} height={24} className="w-6 h-6" alt="Tiktok" />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Youtube className="text-purple-600 w-6 h-6" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Linkedin className="text-purple-600 w-6 h-6" />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className='text-lg text-gray-800'>SUPPORT</p>
          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li className='text-black'><Link to="/faqs">Help Center</Link></li>
            <li className='text-black'><Link to="/contact">Contact Us</Link></li>
            <li className='text-black'><a href="#">Accessibility</a></li>
          </ul>
        </div>

        <div className='max-w-80'>
          <p className='text-lg text-black'>STAY UPDATED</p>
          <p className='mt-3 text-sm text-black'>
            Subscribe to our newsletter for inspiration and special offers.
          </p>
          <div className='flex items-center mt-4'>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubscribe();
                }
              }}
              className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none flex-1'
              placeholder='Your email'
              disabled={isSubscribing}
            />
            <button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className='flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 h-9 w-9 aspect-square rounded-r disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" /></svg>
            </button>
          </div>
          {subscribeMessage && (
            <p className={`mt-2 text-sm ${subscribeMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {subscribeMessage.text}
            </p>
          )}
        </div>
      </div>
      <hr className='border-gray-300 mt-8' />
      <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
        <p className='text-black'>© {new Date().getFullYear()} <a href="https://prebuiltui.com">PointsBox.me</a>. All rights reserved.</p>
        <ul className='flex items-center gap-4'>
          <li className='text-black'><Link to="/terms">Terms</Link></li>
        </ul>
      </div>
    </div>
  );
};
