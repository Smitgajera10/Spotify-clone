import { useState } from "react";

const CloudinaryUpload = ({ setUrl, setName }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState("");
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            console.log("No file selected")
            return;
        }

        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert("File is too large. Max allowed is 10 MB.");
            return;
        }
        
        setFileName(file.name);
        console.log("Selected file:", file);

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET || "Smitgajera");
        data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_FOLDER);

        try {
            setUploading(true);
            console.log("Sending fetch request..."); // Debugging log
            const res = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
                method: "POST",
                body: data,
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            setUrl(result.secure_url);
            setName(result.original_filename);
            console.log("Uploaded URL:", result.secure_url); // Debugging log
        } catch (error) {
            console.error("Error uploading file:", error); // Debugging log
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center">
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
            />

            {/* Custom label for the file input */}
            <label
                htmlFor="file-upload"
                className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
                {fileName ? `Selected: ${fileName}` : "Choose a file"}
            </label>
            {uploading && <p className="text-red-500">Uploading...</p>}

        </div>
    );
};

export default CloudinaryUpload;