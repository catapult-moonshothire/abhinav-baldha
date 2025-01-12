import { UploadCloud } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept: string;
  label: string;
  key?: string;
}

export function FileUpload({
  onFileSelect,
  accept,
  label,
  key,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        onFileSelect(file);
      } else {
        setFileName(null);
        onFileSelect(null);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-gray-300 hover:border-primary"
      }`}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-8 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {fileName
          ? `Selected file: ${fileName}`
          : `Drag and drop your ${label} here, or click to select`}
      </p>
    </div>
  );
}
