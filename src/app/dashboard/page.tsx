"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Newspaper, 
  Camera, 
  BarChart3, 
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
  ArrowRight
} from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    overview: {
      pages: { total: 0, published: 0, draft: 0 },
      news: { total: 0, published: 0, draft: 0 },
      events: { total: 0, published: 0, upcoming: 0 },
      galleries: { total: 0, published: 0, featured: 0 },
      totalViews: 0
    },
    recentContent: {
      pages: [],
      news: [],
      events: [],
      galleries: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/content/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const quickActions = [
    {
      title: "Create Page",
      description: "Add a new page to the website",
      icon: <FileText className="w-6 h-6" />,
      href: "/dashboard/pages/new",
      color: "bg-blue-500"
    },
    {
      title: "Add News",
      description: "Publish a news article",
      icon: <Newspaper className="w-6 h-6" />,
      href: "/dashboard/news/new",
      color: "bg-green-500"
    },
    {
      title: "Create Event",
      description: "Add a new event",
      icon: <Calendar className="w-6 h-6" />,
      href: "/dashboard/events/new",
      color: "bg-purple-500"
    },
    {
      title: "Upload Gallery",
      description: "Add photos to gallery",
      icon: <Camera className="w-6 h-6" />,
      href: "/dashboard/gallery/new",
      color: "bg-pink-500"
    }
  ];

  const stats = [
    {
      title: "Total Pages",
      value: dashboardData.overview.pages.total,
      change: "+12%",
      icon: <FileText className="w-8 h-8" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Published News",
      value: dashboardData.overview.news.published,
      change: "+8%",
      icon: <Newspaper className="w-8 h-8" />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Upcoming Events",
      value: dashboardData.overview.events.upcoming,
      change: "+5%",
      icon: <Calendar className="w-8 h-8" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Total Views",
      value: dashboardData.overview.totalViews.toLocaleString(),
      change: "+15%",
      icon: <Eye className="w-8 h-8" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={action.title}
                    href={action.href}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Content */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Content</h2>
              <div className="space-y-4">
                {/* Recent Pages */}
                {dashboardData.recentContent.pages.slice(0, 3).map((page, index) => (
                  <div key={page._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{page.title}</p>
                        <p className="text-sm text-gray-600">
                          {page.author?.name} • {new Date(page.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Recent News */}
                {dashboardData.recentContent.news.slice(0, 3).map((news, index) => (
                  <div key={news._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Newspaper className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{news.title}</p>
                        <p className="text-sm text-gray-600">
                          {news.author?.name} • {new Date(news.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        news.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {news.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Recent Events */}
                {dashboardData.recentContent.events.slice(0, 3).map((event, index) => (
                  <div key={event._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {event.organizer?.name} • {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pages</h3>
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {dashboardData.overview.pages.total}
            </p>
            <p className="text-sm text-gray-600">
              {dashboardData.overview.pages.published} published, {dashboardData.overview.pages.draft} drafts
            </p>
            <a
              href="/dashboard/pages"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mt-3"
            >
              Manage Pages <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">News</h3>
              <Newspaper className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {dashboardData.overview.news.total}
            </p>
            <p className="text-sm text-gray-600">
              {dashboardData.overview.news.published} published, {dashboardData.overview.news.draft} drafts
            </p>
            <a
              href="/dashboard/news"
              className="inline-flex items-center text-green-600 hover:text-green-800 font-medium mt-3"
            >
              Manage News <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Events</h3>
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {dashboardData.overview.events.total}
            </p>
            <p className="text-sm text-gray-600">
              {dashboardData.overview.events.upcoming} upcoming events
            </p>
            <a
              href="/dashboard/events"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium mt-3"
            >
              Manage Events <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Gallery</h3>
              <Camera className="w-6 h-6 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {dashboardData.overview.galleries.total}
            </p>
            <p className="text-sm text-gray-600">
              {dashboardData.overview.galleries.featured} featured galleries
            </p>
            <a
              href="/dashboard/gallery"
              className="inline-flex items-center text-pink-600 hover:text-pink-800 font-medium mt-3"
            >
              Manage Gallery <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
