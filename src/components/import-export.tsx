"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ImportExportData() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export-data");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "blog_data.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Data exported successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/import-data", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      toast({ title: "Success", description: "Data imported successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    }
  };

  const handleExportImage = async () => {
    try {
      const response = await fetch("/api/export-images");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "blog-images.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Images exported successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export images",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Import/Export Data</h2>
      <div className="flex gap-3">
        <Button onClick={handleExport}>Export Data</Button>
        <Button onClick={handleExportImage}>Export Images</Button>
        <div className="flex items-center space-x-2 col-span-2">
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".json"
          />
          <Button onClick={handleImport} disabled={!file}>
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}
