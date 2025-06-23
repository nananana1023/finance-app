import React, { useState } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";

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

    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error("Upload error:", error.response.data);
      setMessage("Error uploading file. Please follow the template.");
    }
  };

  return (
    <div className="mb-3">
      <Row className="align-items-center g-3">
        <Col md="auto">
          <a href="/template.xlsx" download>
            <button
              className="btn btn-animate"
              style={{
                backgroundColor: "#D9C9B3",
                color: "black",
                border: "none",
              }}
            >
              Download Template
            </button>
          </a>
        </Col>
        <Col md="auto">
          <input
            type="file"
            className="form-control w-auto"
            id="transactionsFile"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileChange}
          />
        </Col>
        <Col md="auto">
          <button
            className="btn btn-animate"
            style={{
              backgroundColor: "#A5BB9F",
              color: "black",
              border: "none",
            }}
            onClick={handleUpload}
          >
            Upload
          </button>
        </Col>
      </Row>

      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default FileUpload;
