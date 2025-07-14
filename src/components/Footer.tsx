import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section À propos */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-500">TKD Competition management</h3>
            <p className="mb-4">
              Système professionnel de gestion des compétitions de Taekwondo.
              Solution complète pour l'organisation et le suivi des tournois.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Belkadi-hamza" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/belkadi-hamza-81a756292/" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Section Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Professionnel</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-red-400" />
                <a href="mailto:hamzabelkadi25@gmail.com" className="hover:text-red-400 transition-colors">
                  hamzabelkadi25@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-red-400" />
                <a href="tel:+212679084271" className="hover:text-red-400 transition-colors">
                  +212 679 084 271
                </a>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-400" />
                <span>Maroc</span>
              </li>
            </ul>
          </div>

          {/* Section Développeur */}
          <div>
            <h3 className="text-xl font-bold mb-4">Expertise Technique</h3>
            <div className="flex items-center mb-4">
              <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                <span className="font-bold text-white">HB</span>
              </div>
              <div>
                <h4 className="font-semibold">Belkadi Hamza</h4>
                <p className="text-sm text-gray-300">Développeur Full-Stack & IA</p>
              </div>
            </div>
            <p>
              Spécialiste en développement d'applications web/mobile et solutions d'Intelligence Artificielle.
              Expertise en architectures cloud et systèmes distribués.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} TKD Competition management - Solution développée par Belkadi Hamza. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;