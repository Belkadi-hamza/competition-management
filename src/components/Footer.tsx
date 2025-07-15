import React from 'react';
import { Github, Linkedin, Mail, Phone, MapPin, Trophy, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative mt-auto">
      <div className="backdrop-blur-xl bg-white/5 border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Section À propos */}
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">TKD Competition</h3>
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                Système professionnel de gestion des compétitions de Taekwondo.
                Solution complète pour l'organisation et le suivi des tournois.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/Belkadi-hamza" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <Github className="w-5 h-5 text-white" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/belkadi-hamza-81a756292/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Section Contact */}
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Contact Professionnel</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3 group">
                  <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg group-hover:from-red-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                    <Mail className="w-4 h-4 text-red-400" />
                  </div>
                  <a 
                    href="mailto:hamzabelkadi25@gmail.com" 
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    hamzabelkadi25@gmail.com
                  </a>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg group-hover:from-red-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                    <Phone className="w-4 h-4 text-red-400" />
                  </div>
                  <a 
                    href="tel:+212679084271" 
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    +212 679 084 271
                  </a>
                </li>
                <li className="flex items-center space-x-3 group">
                  <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg group-hover:from-red-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                    <MapPin className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-white/80">Maroc</span>
                </li>
              </ul>
            </div>

            {/* Section Développeur */}
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Expertise Technique</h3>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="font-bold text-white text-lg">HB</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Belkadi Hamza</h4>
                  <p className="text-sm text-white/70">Développeur Full-Stack & IA</p>
                </div>
              </div>
              <p className="text-white/70 leading-relaxed">
                Spécialiste en développement d'applications web/mobile et solutions d'Intelligence Artificielle.
                Expertise en architectures cloud et systèmes distribués.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Shield className="w-4 h-4 text-white/60" />
                <p className="text-white/60 text-sm">
                  &copy; {new Date().getFullYear()} TKD Competition Management - Solution développée par Belkadi Hamza
                </p>
              </div>
              <div className="text-white/40 text-xs">
                Tous droits réservés
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;