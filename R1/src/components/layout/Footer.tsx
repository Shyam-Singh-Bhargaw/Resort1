import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";

function Footer(/* props */) {
  // read global config early if provided by backend script
  const initialInfo = (typeof window !== 'undefined' && (window as any).resortInfo) ? (window as any).resortInfo : null;
  const [info, setInfo] = useState<any>(initialInfo);

  useEffect(() => {
    if (!info) {
      fetch('/api/site')
        .then((res) => res.ok ? res.json() : Promise.reject(res.status))
        .then((data) => setInfo(data))
        .catch(() => setInfo((prev:any) => prev ?? { name: 'Resort', phone: '', email: '', description: '', awards: [] }));
    }
  }, [info]);

  const title = info?.name || 'Resort';
  const phone = info?.phone || '';
  const email = info?.email || '';
  const description = info?.description || '';
  const awards = Array.isArray(info?.awards) ? info.awards : [];

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container-padding section-padding">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-medium">{title}</h3>
              <p className="text-xs tracking-[0.3em] uppercase opacity-70 mt-1">Himalayan Sanctuary</p>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">{description}</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"><Twitter className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Explore</h4>
            <ul className="space-y-3">
              {[{ name: 'Cottages', href: '/rooms' },{ name: 'Wellness Programs', href: '/programs/wellness' },{ name: 'Spa Treatments', href: '/programs/wellness' },{ name: 'Dining', href: '/dining' },{ name: 'Gallery', href: '/gallery' }].map((link) => (
                <li key={link.name}><Link to={link.href} className="text-sm opacity-80 hover:opacity-100 transition-opacity">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Wellness</h4>
            <ul className="space-y-3">
              {["Ayurveda","Yoga & Meditation","Spa Therapies","Detox Programs","Sound Healing"].map((item) => (
                <li key={item}><Link to="/wellness" className="text-sm opacity-80 hover:opacity-100 transition-opacity">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex gap-3"><MapPin className="h-5 w-5 opacity-70 flex-shrink-0 mt-0.5" /><span className="text-sm opacity-80">{info?.location || ''}</span></li>
              <li className="flex gap-3"><Phone className="h-5 w-5 opacity-70 flex-shrink-0" /><a href={`tel:${phone}`} className="text-sm opacity-80 hover:opacity-100 transition-opacity">{phone}</a></li>
              <li className="flex gap-3"><Mail className="h-5 w-5 opacity-70 flex-shrink-0" /><a href={`mailto:${email}`} className="text-sm opacity-80 hover:opacity-100 transition-opacity">{email}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-padding py-8">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-xs text-center opacity-60">
            {awards.map((award: string) => (<span key={award}>{award}</span>))}
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-padding py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60">
            <p>© {new Date().getFullYear()} {title}. All rights reserved.</p>
            <div className="flex gap-6"><Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link><Link to="/terms" className="hover:opacity-100 transition-opacity">Terms & Conditions</Link></div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
