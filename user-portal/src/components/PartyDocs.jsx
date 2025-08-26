import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export default function PartyDocs() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Folder inside user folder to store party docs
  const STORAGE_FOLDER = "party-documents";

  // Fetch user's uploaded files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      // List files inside user folder + STORAGE_FOLDER subfolder
      const pathPrefix = `${user.id}/${STORAGE_FOLDER}`;

      const { data, error } = await supabase.storage
        .from("party-logos")
        .list(pathPrefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      setFiles(data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleFileChange(e) {
    setSelectedFiles(e.target.files);
  }

  async function handleUpload() {
    setUploading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (!selectedFiles.length) {
        setError("Please select at least one file to upload.");
        setUploading(false);
        return;
      }

      for (const file of selectedFiles) {
        const filePath = `${user.id}/${STORAGE_FOLDER}/${file.name}`;

        // Upload with upsert:true to overwrite if exists
        const { error: uploadError } = await supabase.storage
          .from("party-logos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;
      }

      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await fetchFiles();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(filename) {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const filePath = `${user.id}/${STORAGE_FOLDER}/${filename}`;

      const { error } = await supabase.storage
        .from("party-logos")
        .remove([filePath]);
      if (error) throw error;

      await fetchFiles();
    } catch (err) {
      setError(err.message);
    }
  }

  // Generate signed URL for file preview (valid 60s)
  async function getSignedUrl(filename) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const filePath = `${user.id}/${STORAGE_FOLDER}/${filename}`;

      const { data, error } = await supabase.storage
        .from("party-logos")
        .createSignedUrl(filePath, 60);

      if (error) throw error;

      return data.signedUrl;
    } catch {
      return null;
    }
  }

  const [signedUrls, setSignedUrls] = useState({});

  useEffect(() => {
    async function fetchSignedUrls() {
      const urls = {};
      for (const file of files) {
        const url = await getSignedUrl(file.name);
        if (url) urls[file.name] = url;
      }
      setSignedUrls(urls);
    }
    if (files.length) fetchSignedUrls();
  }, [files]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Party Document Submission</h2>
      <p style={styles.description}>
        Upload all your party documents here (images, PDFs, Word, Excel, etc.).
        These documents will be available even after elections.
      </p>

      <div style={styles.uploadSection}>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          style={styles.fileInput}
          disabled={uploading}
        />
        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          style={styles.uploadButton}
          aria-label="Upload selected files"
        >
          {uploading ? "Uploading..." : "Upload Files"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <h3 style={styles.subHeading}>Uploaded Documents</h3>

      {files.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul style={styles.fileList}>
          {files.map(({ name, updated_at }) => {
            const dateStr = new Date(updated_at).toLocaleDateString();
            const publicUrl = signedUrls[name] || "#";

            return (
              <li key={name} style={styles.fileItem}>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.fileLink}
                >
                  {name}
                </a>
                <span style={styles.fileDate}>{dateStr}</span>
                <button
                  onClick={() => handleDelete(name)}
                  style={styles.deleteButton}
                  aria-label={`Delete file ${name}`}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 760,
    margin: "0 auto",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 24,
  },
  uploadSection: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  fileInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  uploadButton: {
    padding: "10px 18px",
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#0055A4",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    userSelect: "none",
  },
  error: {
    color: "#D72631",
    marginBottom: 16,
  },
  subHeading: {
    fontSize: 22,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 12,
  },
  fileList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderBottom: "1px solid #E5E7EB",
  },
  fileLink: {
    color: "#1D4ED8",
    textDecoration: "underline",
    maxWidth: "60%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  fileDate: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 12,
    whiteSpace: "nowrap",
  },
  deleteButton: {
    backgroundColor: "#D72631",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    fontWeight: "700",
    borderRadius: 6,
    cursor: "pointer",
    userSelect: "none",
  },
};
