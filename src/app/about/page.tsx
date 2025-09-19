"use client";

import { motion } from "framer-motion";
import { 
  Target, 
  Globe
} from "lucide-react";

export default function About() {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              About XAAB
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              XISS Alumni Association Bangalore - Building bridges, creating opportunities, 
              and fostering lifelong connections among XISS graduates worldwide.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-blue-50 p-8 rounded-lg">
                <Target className="w-12 h-12 text-blue-600 mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-700">
                  To strengthen the bonds between XISS alumni, facilitate professional growth, 
                  and contribute to the development of our community through meaningful connections, 
                  mentorship, and collaborative opportunities.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-green-50 p-8 rounded-lg">
                <Globe className="w-12 h-12 text-green-600 mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-lg text-gray-700">
                  To be the most vibrant and supportive alumni network that empowers XISS graduates 
                  to achieve their fullest potential while giving back to society and maintaining 
                  the highest standards of excellence.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of a vibrant community that values connection, growth, and mutual support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signin"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Become a Member
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
