"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FileUpload } from "./file-upload";

export function ImportExportData() {
  const [file, setFile] = useState<File | null>(null);
  const [imageZip, setImageZip] = useState<File | null>(null);
  const [loading, setLoading] = useState({
    exportData: false,
    importData: false,
    exportImages: false,
    importImages: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [dataFileKey, setDataFileKey] = useState(Date.now().toString());
  const [imageFileKey, setImageFileKey] = useState(Date.now().toString());
  const { toast } = useToast();

  const handleLoadingState = (action: keyof typeof loading, state: boolean) => {
    setLoading((prev) => ({ ...prev, [action]: state }));
  };

  const handleExport = async () => {
    handleLoadingState("exportData", true);
    setError(null);
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
      setError("Failed to export data");
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      handleLoadingState("exportData", false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    handleLoadingState("importData", true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/import-data", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      toast({ title: "Success", description: "Data imported successfully" });
      setFile(null);
      setDataFileKey(Date.now().toString()); // Force re-render of FileUpload
    } catch (error) {
      setError("Failed to import data");
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    } finally {
      handleLoadingState("importData", false);
    }
  };

  const handleExportImage = async () => {
    handleLoadingState("exportImages", true);
    setError(null);
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
      setError("Failed to export images");
      toast({
        title: "Error",
        description: "Failed to export images",
        variant: "destructive",
      });
    } finally {
      handleLoadingState("exportImages", false);
    }
  };

  const handleImportImages = async () => {
    if (!imageZip) return;
    handleLoadingState("importImages", true);
    setError(null);
    const formData = new FormData();
    formData.append("file", imageZip);
    try {
      const response = await fetch("/api/import-images", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      toast({ title: "Success", description: "Images imported successfully" });
      setImageZip(null);
      setImageFileKey(Date.now().toString()); // Force re-render of FileUpload
    } catch (error) {
      setError("Failed to import images");
      toast({
        title: "Error",
        description: "Failed to import images",
        variant: "destructive",
      });
    } finally {
      handleLoadingState("importImages", false);
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-2xl font-bold">Import/Export Data</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="w-full"
          onClick={handleExport}
          disabled={
            loading.exportData ||
            loading.importData ||
            loading.exportImages ||
            loading.importImages
          }
        >
          {loading.exportData ? "Exporting..." : "Export Data"}
        </Button>
        <Button
          className="w-full"
          onClick={handleExportImage}
          disabled={
            loading.exportData ||
            loading.importData ||
            loading.exportImages ||
            loading.importImages
          }
        >
          {loading.exportImages ? "Exporting..." : "Export Images"}
        </Button>
      </div>
      <div className="space-y-4">
        <FileUpload
          key={dataFileKey}
          onFileSelect={setFile}
          accept=".json"
          label="JSON file"
        />
        <Button
          className="w-full"
          onClick={handleImport}
          disabled={
            !file ||
            loading.exportData ||
            loading.importData ||
            loading.exportImages ||
            loading.importImages
          }
        >
          {loading.importData ? "Importing..." : "Import Data"}
        </Button>
      </div>
      <div className="space-y-4">
        <FileUpload
          key={imageFileKey}
          onFileSelect={setImageZip}
          accept=".zip"
          label="ZIP file"
        />
        <Button
          className="w-full"
          onClick={handleImportImages}
          disabled={
            !imageZip ||
            loading.exportData ||
            loading.importData ||
            loading.exportImages ||
            loading.importImages
          }
        >
          {loading.importImages ? "Importing..." : "Import Images"}
        </Button>
      </div>
    </div>
  );
}
