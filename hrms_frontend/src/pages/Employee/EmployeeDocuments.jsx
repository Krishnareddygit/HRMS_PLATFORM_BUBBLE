import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout/Layout";
import axiosInstance from "../../utils/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { FaUpload, FaDownload } from "react-icons/fa";
import { API_ENDPOINTS, API_ROOT_URL } from "../../config/api";

const REQUIRED_DOCS = [
  "Aadhar",
  "BTech Degree",
  "10th Class",
  "12th Class",
  "Resume",
  "Signed Offer Letter",
];

const EmployeeDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowMessage, setRowMessage] = useState({});
  const fileInputs = useRef({});
  const employeeId = user?.employeeId;

  const [photoMessage, setPhotoMessage] = useState("");
const photoInputRef = useRef(null);

const [profilePhoto, setProfilePhoto] = useState(null);


const handlePhotoUpload = async (file) => {
  if (!file || !employeeId) return;

  const payload = new FormData();
  payload.append("file", file);

  try {
    await axiosInstance.post(
      `${API_ROOT_URL}${API_ENDPOINTS.PROFILE_IMAGES.BY_EMPLOYEE}/${employeeId}`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setPhotoMessage("Photo uploaded successfully.");
    await fetchProfilePhoto();
  } catch (err) {
    console.error("Photo upload error:", err);
    setPhotoMessage("Photo upload failed.");
  }
};

const fetchProfilePhoto = async () => {
  if (!employeeId) return;

  try {
    const res = await axiosInstance.get(
      `${API_ROOT_URL}${API_ENDPOINTS.PROFILE_IMAGES.BY_EMPLOYEE}/${employeeId}`
    );

    setProfilePhoto(res?.data || null);
  } catch (err) {
    console.error("Fetch profile photo error:", err);
    setProfilePhoto(null);
  }
};

  // ================= FETCH =================
  const fetchDocuments = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `${API_ENDPOINTS.DOCUMENTS.BY_EMPLOYEE}/${employeeId}`
      );

      setDocuments(
        Array.isArray(res.data)
          ? res.data
          : res.data?.data || []
      );
    } catch (err) {
      console.error("Fetch documents error:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchProfilePhoto();
  }, [employeeId]);

  // ================= HELPERS =================
  const findDoc = (name) =>
    documents.find(
      (d) =>
        String(d?.documentName || "")
          .toLowerCase()
          .trim() === name.toLowerCase().trim()
    );

  // ================= UPLOAD / UPDATE =================
  const handleUploadOrUpdate = async (docName, file, existingDoc) => {
    if (!file) return;

    const payload = new FormData();
    payload.append("file", file);
    payload.append("documentName", docName);
    payload.append("documentType", "PDF");

    try {
      if (existingDoc) {
        const docId = existingDoc.documentId || existingDoc.id;

        await axiosInstance.post(
          `${API_ENDPOINTS.DOCUMENTS.REUPLOAD}/${docId}/reupload`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setRowMessage((p) => ({
          ...p,
          [docName]: "Document updated successfully.",
        }));
      } else {
        await axiosInstance.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setRowMessage((p) => ({
          ...p,
          [docName]: "Document uploaded successfully.",
        }));
      }

      await fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
      setRowMessage((p) => ({
        ...p,
        [docName]: "Upload failed.",
      }));
    }
  };

  // ================= DOWNLOAD =================
  const handleDownload = async (doc) => {
    const docId = doc?.documentId || doc?.id;
    if (!docId) return;

    try {
      const res = await axiosInstance.get(
        `${API_ENDPOINTS.DOCUMENTS.DOWNLOAD}/${docId}/download`
      );

      if (res?.data) {
        window.open(res.data, "_blank", "noopener,noreferrer");
      }
    } catch {
      alert("Download failed");
    }
  };

  const handleViewPhoto = () => {
    if (!profilePhoto) return;
  
    window.open(profilePhoto, "_blank", "noopener,noreferrer");
  };

  // ================= UI =================
  return (
    <Layout>
      <div className="container-fluid page-gradient">
        <h2 className="fw-bold mb-3">Documents</h2>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Document</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {REQUIRED_DOCS.map((docName) => {
                      const doc = findDoc(docName);
                      const rawStatus = (
                        doc?.status || ""
                      ).toUpperCase();

                      return (
                        <tr key={docName}>
                          <td className="fw-semibold">{docName}</td>
                          <td>PDF</td>

                          {/* STATUS */}
                          <td>
                            {!doc ? (
                              <span className="badge bg-secondary">
                                Not Submitted
                              </span>
                            ) : rawStatus === "VERIFIED" ? (
                              <span className="badge bg-success">
                                Approved
                              </span>
                            ) : rawStatus === "REJECTED" ? (
                              <span className="badge bg-danger">
                                Rejected
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                Awaiting Approval
                              </span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              {doc && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleDownload(doc)}
                                >
                                  <FaDownload /> View
                                </button>
                              )}

                              <input
                                type="file"
                                accept="application/pdf"
                                className="d-none"
                                ref={(el) =>
                                  (fileInputs.current[docName] = el)
                                }
                                onChange={(e) => {
                                  const file =
                                    e.target.files?.[0] || null;
                                  handleUploadOrUpdate(
                                    docName,
                                    file,
                                    doc
                                  );
                                  e.target.value = "";
                                }}
                              />

                              <button
                                className="btn btn-sm btn-outline-dark"
                                onClick={() =>
                                  fileInputs.current[docName]?.click()
                                }
                              >
                                <FaUpload /> {doc ? "Update" : "Upload"}
                              </button>
                            </div>

                            {rowMessage[docName] && (
                              <div className="small text-muted mt-1">
                                {rowMessage[docName]}
                              </div>
                            )}
                          </td>
                        </tr>

                        
                      );
                    })}

<tr>
    <td className="fw-semibold">Passport Size Photo</td>
    <td>Image</td>
    <td>-</td>

    <td className="text-end">
      <input
        type="file"
        accept="image/*"
        className="d-none"
        ref={photoInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          handlePhotoUpload(file);
          e.target.value = "";
        }}
      />

<div className="d-flex justify-content-end gap-2">

{profilePhoto && (
  <button
    className="btn btn-sm btn-outline-primary"
    onClick={handleViewPhoto}
  >
    <FaDownload /> View
  </button>
)}

<button
  className="btn btn-sm btn-outline-dark"
  onClick={() => photoInputRef.current?.click()}
>
  <FaUpload /> {profilePhoto ? "Update" : "Upload"}
</button>

</div>

      {photoMessage && (
        <div className="small text-muted mt-1">
          {photoMessage}
        </div>
      )}
    </td>
  </tr>
                    
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDocuments;