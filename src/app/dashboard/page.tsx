"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Newspaper, 
  Camera, 
  Users,
  Settings,
  TrendingUp,
  Activity,
  Mail,
  MessageSquare,
  Image,
  FileText,
  Globe,
  Shield,
  Bell,
  ArrowRight,
  LogOut,
  Upload,
  BarChart3
} from "lucide-react";
import Link from "next/link";

interface UserStats {
  totalAlumni: number;
  totalEvents: number;
  totalNews: number;
  totalGalleries: number;
  totalContacts: number;
  totalViews: number;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalAlumni: 0,
    totalEvents: 0,
    totalNews: 0,
    totalGalleries: 0,
    totalContacts: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Check if user is admin and redirect to admin dashboard
    if (session.user?.role === "super_admin") {
      router.push("/admin/dashboard");
      return;
    }

    // User is authenticated, load dashboard data
    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalAlumni: 156,
        totalEvents: 23,
        totalNews: 45,
        totalGalleries: 12,
        totalContacts: 89,
        totalViews: 2340
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {session.user?.name || session.user?.email}</h1>
                <p className="text-sm text-gray-600">XISS Alumni Association Bangalore</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Back to Home
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Alumni",
              value: stats.totalAlumni,
              icon: <Users className="w-8 h-8" />,
              color: "bg-blue-500",
              change: "+12%"
            },
            {
              title: "Events",
              value: stats.totalEvents,
              icon: <Calendar className="w-8 h-8" />,
              color: "bg-orange-500",
              change: "+5%"
            },
            {
              title: "News Articles",
              value: stats.totalNews,
              icon: <Newspaper className="w-8 h-8" />,
              color: "bg-green-500",
              change: "+8%"
            },
            {
              title: "Photo Galleries",
              value: stats.totalGalleries,
              icon: <Camera className="w-8 h-8" />,
              color: "bg-purple-500",
              change: "+3%"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "View Alumni", icon: <Users className="w-6 h-6" />, href: "/alumni" },
                { title: "Browse Events", icon: <Calendar className="w-6 h-6" />, href: "/events" },
                { title: "Read News", icon: <Newspaper className="w-6 h-6" />, href: "/news" },
                { title: "View Gallery", icon: <Camera className="w-6 h-6" />, href: "/gallery" }
              ].map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="text-blue-600 mb-2">{action.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{action.title}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { title: "New alumni registration: John Doe", time: "2 hours ago" },
                { title: "Event created: Annual Meet 2024", time: "4 hours ago" },
                { title: "News article published: Alumni Success Story", time: "6 hours ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Navigation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Alumni Directory",
              description: "Connect with fellow XISS alumni",
              icon: <Users className="w-8 h-8" />,
              href: "/alumni",
              color: "bg-blue-500"
            },
            {
              title: "Events",
              description: "Upcoming events and workshops",
              icon: <Calendar className="w-8 h-8" />,
              href: "/events",
              color: "bg-orange-500"
            },
            {
              title: "News & Updates",
              description: "Latest news from our community",
              icon: <Newspaper className="w-8 h-8" />,
              href: "/news",
              color: "bg-green-500"
            },
            {
              title: "Photo Gallery",
              description: "Memories from events and gatherings",
              icon: <Camera className="w-8 h-8" />,
              href: "/gallery",
              color: "bg-purple-500"
            },
            {
              title: "Contact Us",
              description: "Get in touch with the association",
              icon: <Mail className="w-8 h-8" />,
              href: "/contact",
              color: "bg-red-500"
            },
            {
              title: "About Us",
              description: "Learn more about XAAB",
              icon: <FileText className="w-8 h-8" />,
              href: "/about",
              color: "bg-gray-500"
            }
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={section.href}
                className="block bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${section.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {section.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                      Explore
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}