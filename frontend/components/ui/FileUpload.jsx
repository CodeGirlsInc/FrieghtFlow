import { UploadCloud } from "lucide-react";
import { useState } from "react";

const FileUpload = ({ label, onChange, optional = false, error }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-[#0C1421] text-[14.72px] font-open-sans font-normal mb-2 leading-[100%] tracking-[1%] align-middle">
        {label}{" "}
        {optional && (
          <span className="text-[#0C1421] text-[14.72px] italic font-open-sans font-normal leading-[100%] tracking-[1%] align-middle">
            (Optional)
          </span>
        )}
      </label>
      <div className="relative w-[100%] h-[51.2px] border border-gray-200 rounded-[4px] bg-[#F4F6F3]">
        <input
          type="file"
          className="absolute inset-0 z-10 opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        <div className="flex items-center justify-between w-full h-full px-4 py-2">
          <span className="truncate text-[14.4px] text-[#8897AD] font-open-sans">
            {fileName || "Upload License & certification"}
          </span>
          <UploadCloud className="h-5 w-5 text-[#8897AD]" />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;
