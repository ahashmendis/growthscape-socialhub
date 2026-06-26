"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";

type Report = {
  id: string;
  title: string;
  reportType: string;
  format: string;
  status: string;
  createdAt: string;
  fileUrl: string | null;
  brand: { name: string; logoUrl: string | null } | null;
};

const statusIcons: Record<string, typeof Clock> = {
  PENDING: Clock,
  GENERATING: Clock,
  COMPLETED: CheckCircle,
  FAILED: AlertCircle,
};

const statusColors: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  GENERATING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reportType, setReportType] = useState("WEEKLY");
  const [format, setFormat] = useState("PDF");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/reports?workspaceId=");
      const data = await res.json();
      if (data.success) setReports(data.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: "",
          reportType,
          format,
          title: `${reportType} Report - ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReports([data.data, ...reports]);
        setShowCreateForm(false);
      }
    } catch {
      // Error
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download performance reports"
        actions={
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        }
      />

      {showCreateForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-1.5">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-1.5">
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
                  <option value="EXCEL">Excel</option>
                  <option value="JSON">JSON</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Generate Report</Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="py-6"><div className="h-4 bg-muted rounded w-3/4 animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No reports generated yet. Create your first report above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const StatusIcon = statusIcons[report.status] || Clock;
            return (
              <Card key={report.id} className="hover:shadow-growthscape-sm transition-normal">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{report.reportType}</span>
                          <span>•</span>
                          <span>{report.format}</span>
                          <span>•</span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[report.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {report.status}
                      </Badge>
                      {report.status === "COMPLETED" && report.fileUrl && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
