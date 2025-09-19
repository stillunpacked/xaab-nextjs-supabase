"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Newspaper, 
  Camera, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
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

interface AdminStats {
  totalAlumni: number;
  totalEvents: number;
  totalNews: number;
  totalGalleries: number;
  totalContacts: number;
  totalViews: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalAlumni: 0,
    totalEvents: 0,
    totalNews: 0,
    totalGalleries: 0,
    totalContacts: 0,
    totalViews: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check admin session
    const session = localStorage.getItem("adminSession");
    if (!session) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedSession = JSON.parse(session);
      setAdminSession(parsedSession);
      
      // Load dashboard data
      loadDashboardData();
    } catch (error) {
      router.push("/admin/login");
    }
  }, [router]);

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

      setRecentActivity([
        {
          id: "1",
          type: "alumni",
          title: "New alumni registration: John Doe",
          timestamp: "2 hours ago",
          user: "System"
        },
        {
          id: "2",
          type: "event",
          title: "Event created: Annual Meet 2024",
          timestamp: "4 hours ago",
          user: "Admin"
        },
        {
          id: "3",
          type: "news",
          title: "News article published: Alumni Success Story",
          timestamp: "6 hours ago",
          user: "Admin"
        }
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">XISS Alumni Association Bangalore</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {adminSession?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
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
                { title: "Add Alumni", icon: <Users className="w-6 h-6" />, href: "/admin/alumni/new" },
                { title: "Create Event", icon: <Calendar className="w-6 h-6" />, href: "/admin/events/new" },
                { title: "Write News", icon: <Newspaper className="w-6 h-6" />, href: "/admin/news/new" },
                { title: "Upload Gallery", icon: <Camera className="w-6 h-6" />, href: "/admin/gallery/new" }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="text-blue-600 mb-2">{action.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{action.title}</span>
                </button>
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Alumni Management",
              description: "Manage alumni profiles, registrations, and directory",
              icon: <Users className="w-8 h-8" />,
              href: "/admin/alumni",
              color: "bg-blue-500"
            },
            {
              title: "Events Management",
              description: "Create and manage events, workshops, and meetings",
              icon: <Calendar className="w-8 h-8" />,
              href: "/admin/events",
              color: "bg-orange-500"
            },
            {
              title: "News Management",
              description: "Write and publish news articles and updates",
              icon: <Newspaper className="w-8 h-8" />,
              href: "/admin/news",
              color: "bg-green-500"
            },
            {
              title: "Gallery Management",
              description: "Upload and organize photo galleries",
              icon: <Camera className="w-8 h-8" />,
              href: "/admin/gallery",
              color: "bg-purple-500"
            },
            {
              title: "Contact Management",
              description: "View and respond to contact form submissions",
              icon: <Mail className="w-8 h-8" />,
              href: "/admin/contacts",
              color: "bg-red-500"
            },
            {
              title: "System Settings",
              description: "Configure system settings and preferences",
              icon: <Settings className="w-8 h-8" />,
              href: "/admin/settings",
              color: "bg-gray-500"
            }
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => router.push(section.href)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
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
                    Manage
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
