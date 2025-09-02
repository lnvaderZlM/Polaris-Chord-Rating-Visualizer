import React, { useState } from "react";

type FileInputProps = {
  onJsonLoad: Function;
  className: string;
}

export default function FileInput({ onJsonLoad, className }:FileInputProps) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFile = (file:File) => {
    setFileName(file?.name || "");
    setError("");

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e:ProgressEvent<FileReader>) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        onJsonLoad(jsonData); 
      } catch (err) {
        setError("Invalid JSON file");
        console.error("JSON parse error:", err);
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e:any) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`flex flex-col items-start space-y-2 w-full mt-2 mb-2 ${className}`}>
      <input
        type="file"
        id="file-upload"
        accept=".json"
        className="hidden"
        onChange={handleChange}
      />

      <label
        htmlFor="file-upload"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="btn w-full text-center p-6 border-2 border-dashed"
      >
        Click or drag a JSON file to upload
      </label>

      {fileName && (
        <p className="text-lg text-gray-600 dark:text-gray-400">{fileName}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
