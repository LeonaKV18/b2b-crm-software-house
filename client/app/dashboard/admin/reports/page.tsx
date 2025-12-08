"use client"

import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false })
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false })
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false })
import { Download } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface RevenueEntry {
  month: string;
  revenue: number;
}

interface ConversionData {
  leadsCount: number;
  proposalsCount: number;
  approvedCount: number;
}

interface ProjectStatusData {
  onTimeCount: number;
  atRiskCount: number;
  delayedCount: number;
}

interface SummaryMetrics {
  totalRevenue: number;
  activeClients: number;
  conversionRate: number;
  teamUtilization: number;
}

export default function ReportsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [currentPath] = useState("/dashboard/admin/reports")

  const [revenueData, setRevenueData] = useState<RevenueEntry[]>([])
  const [conversionStats, setConversionStats] = useState<ConversionData | null>(null)
  const [projectStatusCounts, setProjectStatusCounts] = useState<ProjectStatusData | null>(null)
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchReportsData = async () => {
      try {
        setLoading(true)
        const [revenueRes, conversionRes, projectStatusRes, summaryRes] = await Promise.all([
          fetch("/api/admin-revenue-data"),
          fetch("/api/admin-conversion-data"),
          fetch("/api/admin-project-status"),
          fetch("/api/admin-summary-metrics"),
        ])

        if (!revenueRes.ok) throw new Error(`HTTP error! Revenue data: ${revenueRes.status}`)
        if (!conversionRes.ok) throw new Error(`HTTP error! Conversion data: ${conversionRes.status}`)
        if (!projectStatusRes.ok) throw new Error(`HTTP error! Project status: ${projectStatusRes.status}`)
        if (!summaryRes.ok) throw new Error(`HTTP error! Summary metrics: ${summaryRes.status}`)

        const revenueData = await revenueRes.json()
        const conversionData = await conversionRes.json()
        const projectStatusData = await projectStatusRes.json()
        const summaryData = await summaryRes.json()

        setRevenueData(revenueData)
        setConversionStats(conversionData)
        setProjectStatusCounts(projectStatusData)
        setSummaryMetrics(summaryData)
      } catch (err) {
        console.error("Failed to fetch reports data:", err)
        setError("Failed to load reports.")
      } finally {
        setLoading(false)
      }
    }

    fetchReportsData()
  }, [isLoggedIn, user?.role, router])

  const handleDownloadPdf = async () => {
    const input = document.getElementById('admin-report-content');
    if (input) {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const addPage = async (element: HTMLElement, pageNum: number, totalPages: number) => {
          const canvas = await html2canvas(element, { scale: 2 }); // Higher scale for better quality
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; 
          const pageHeight = 297; 
          const imgHeight = canvas.height * imgWidth / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= -50) { // -50 to capture a little more from next page if needed
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
          }
      };

      // Create a temporary div to render the content for PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      tempDiv.innerHTML = input.outerHTML; // Clone the content

      await addPage(tempDiv, 1, 1); // Only one "page" for now
      pdf.save('admin_report.pdf');
      document.body.removeChild(tempDiv); // Clean up
    }
  };

  if (!isLoggedIn || user?.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-foreground">Loading reports...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  // Process data for charts
  const processedConversionData = conversionStats ? [
    { stage: "Leads", count: conversionStats.leadsCount },
    { stage: "Proposals", count: conversionStats.proposalsCount },
    { stage: "Approved", count: conversionStats.approvedCount },
  ] : [];

  const totalProjects = (projectStatusCounts?.onTimeCount || 0) + (projectStatusCounts?.atRiskCount || 0) + (projectStatusCounts?.delayedCount || 0);
  const processedProjectStatus = totalProjects > 0 && projectStatusCounts ? [
    { name: "On Time", value: Math.round(((projectStatusCounts.onTimeCount || 0) / totalProjects) * 100), color: "#22c55e" },
    { name: "At Risk", value: Math.round(((projectStatusCounts.atRiskCount || 0) / totalProjects) * 100), color: "#f59e0b" },
    { name: "Delayed", value: Math.round(((projectStatusCounts.delayedCount || 0) / totalProjects) * 100), color: "#ef4444" },
  ] : [];


  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={currentPath} />

      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
              <p className="text-sm text-muted-foreground">Business insights and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="bg-secondary border-border flex items-center gap-2"
                onClick={handleDownloadPdf}
              >
                <Download size={20} />
                Export PDF
              </Button>
              <Button variant="outline" className="bg-secondary border-border flex items-center gap-2">
                <Download size={20} />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8" id="admin-report-content">
          {/* Revenue Chart */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Revenue by Month</CardTitle>
              <CardDescription>Last 6 months revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 30, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Proposal Conversion */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Proposal Conversion</CardTitle>
                <CardDescription>Lead to approval pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedConversionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="stage" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Project Status</CardTitle>
                <CardDescription>Current project health</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedProjectStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {processedProjectStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(20, 20, 30, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-2">${(summaryMetrics?.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-chart-3 mt-2">+12% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-foreground mt-2">{summaryMetrics?.activeClients}</p>
                <p className="text-xs text-chart-3 mt-2">+2 this month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground mt-2">{summaryMetrics?.conversionRate}%</p>
                <p className="text-xs text-chart-3 mt-2">+5% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Team Utilization</p>
                <p className="text-2xl font-bold text-foreground mt-2">{summaryMetrics?.teamUtilization}%</p>
                <p className="text-xs text-primary mt-2">Optimal</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline" className="bg-secondary border-border">
                ← Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
