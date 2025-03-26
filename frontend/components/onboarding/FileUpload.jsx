import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

const FileUpload = ({ onFileSelect, label = 'Upload document' }) => {
    const [fileName, setFileName] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            if (onFileSelect) {
                onFileSelect(file);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="relative border h-[57px] bg-[var(--inputBackground)] border-gray-300 rounded-md py-2 px-3 flex items-center justify-between hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-between w-full space-x-2">
                    <span className="text-gray-500 text-sm">
                        {fileName || label}
                    </span>
                    <UploadCloud className="text-gray-500" size={26} />
                </div>
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};

export default FileUpload;
