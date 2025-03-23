import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    // Retrieve your token if needed
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Do not include the "Content-Type" header here.
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error("Upload error:", error.response.data);
      setMessage(
        "Error uploading file: " + JSON.stringify(error.response.data)
      );
    }
  };

  return (
    <div>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Transactions</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
