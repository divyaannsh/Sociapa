"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import "../../../styles/ClientsCreate.css";

export default function ClientsCreate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'success' or 'error'
  const [formData, setFormData] = useState({
    companyName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      setError("Company Name is required");
      setModalType("error");
      setShowModal(true);
      return false;
    }
    if (!formData.username.trim()) {
      setError("Username is required");
      setModalType("error");
      setShowModal(true);
      return false;
    }
    if (formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      setModalType("error");
      setShowModal(true);
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      setModalType("error");
      setShowModal(true);
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setModalType("error");
      setShowModal(true);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setModalType("error");
      setShowModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName.trim(),
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create client");
        setModalType("error");
        setShowModal(true);
        setLoading(false);
        return;
      }

      setSuccess("Client created successfully!");
      setModalType("success");
      setShowModal(true);
      setFormData({
        companyName: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      setLoading(false);
    } catch (err) {
      setError(err.message || "An error occurred while creating the client");
      setModalType("error");
      setShowModal(true);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setSuccess("");
  };

  return (
    <>
      <PageHeader
        title="Create New Client"
        breadcrumb={[
          { label: "Home", path: "/" },
          { label: "Clients", path: "/clients" },
          { label: "Create", path: "/clients/create" },
        ]}
      />

      <div className="main-content">
        {/* Full width white background wrapper */}
        <div
          className="clients-create-fullwidth"
          style={{
            background: "#fff",
            width: "100vw",
            minHeight: "calc(100vh - 80px)",
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <div style={{ width: "90vw", maxWidth: "1100px" }}>
            <div
              className="clients-create-card"
              style={{
                background: "#fff",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                padding: "32px",
                width: "100%",
              }}
            >
              <form onSubmit={handleSubmit} className="clients-form">
                {/* Company Name Field */}
                <div
                  className="form-group-custom"
                  style={{ marginBottom: "22px" }}
                >
                  <label
                    htmlFor="companyName"
                    className="form-label-custom"
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Company Name
                    <span className="text-danger" style={{ marginLeft: "4px" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    className="form-control-custom"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      background: "#fff",
                      color: "#222",
                      border: "1px solid #e0e0e0",
                      fontSize: "1.08rem",
                      fontWeight: "500",
                      padding: "12px",
                    }}
                  />
                </div>

                {/* Username Field */}
                <div
                  className="form-group-custom"
                  style={{ marginBottom: "22px" }}
                >
                  <label
                    htmlFor="username"
                    className="form-label-custom"
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Username
                    <span className="text-danger" style={{ marginLeft: "4px" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control-custom"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      background: "#fff",
                      color: "#222",
                      border: "1px solid #e0e0e0",
                      fontSize: "1.08rem",
                      fontWeight: "500",
                      padding: "12px",
                    }}
                  />
                </div>

                {/* Password Field */}
                <div
                  className="form-group-custom"
                  style={{ marginBottom: "22px" }}
                >
                  <label
                    htmlFor="password"
                    className="form-label-custom"
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Password
                    <span className="text-danger" style={{ marginLeft: "4px" }}>
                      *
                    </span>
                  </label>
                  <div
                    className="password-input-wrapper"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-control-custom"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        background: "#fff",
                        color: "#222",
                        border: "1px solid #e0e0e0",
                        fontSize: "1.08rem",
                        fontWeight: "500",
                        padding: "12px",
                        flex: 1,
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      style={{
                        background: "none",
                        border: "none",
                        marginLeft: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className={`feather-${
                          showPassword ? "eye-off" : "eye"
                        }`}
                        style={{ color: "#4F46E5", fontSize: "1.2em" }}
                      ></i>
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div
                  className="form-group-custom"
                  style={{ marginBottom: "22px" }}
                >
                  <label
                    htmlFor="confirmPassword"
                    className="form-label-custom"
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Confirm Password
                    <span className="text-danger" style={{ marginLeft: "4px" }}>
                      *
                    </span>
                  </label>
                  <div
                    className="password-input-wrapper"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control-custom"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      style={{
                        background: "#fff",
                        color: "#222",
                        border: "1px solid #e0e0e0",
                        fontSize: "1.08rem",
                        fontWeight: "500",
                        padding: "12px",
                        flex: 1,
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      style={{
                        background: "none",
                        border: "none",
                        marginLeft: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className={`feather-${
                          showPassword ? "eye-off" : "eye"
                        }`}
                        style={{ color: "#4F46E5", fontSize: "1.2em" }}
                      ></i>
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div
                  className="form-actions"
                  style={{
                    display: "flex",
                    gap: "32px",
                    alignItems: "center",
                    marginTop: "32px",
                  }}
                >
                  <button
                    type="submit"
                    className="btn btn-create"
                    disabled={loading}
                    style={{
                      width: "60%",
                      padding: "18px 0",
                      fontWeight: "700",
                      fontSize: "1.15rem",
                      letterSpacing: "0.04em",
                      background:
                        "linear-gradient(90deg,#667eea 0%,#764ba2 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      boxShadow: "0 4px 16px rgba(102,126,234,0.15)",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="feather-save me-2"></i>
                        CREATE CLIENT
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() => router.back()}
                    disabled={loading}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#222",
                      fontWeight: "700",
                      fontSize: "1.15rem",
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i className="feather-x me-2"></i>
                    CANCEL
                  </button>
                </div>
              </form>
              {/* Help Text */}
              <div
                className="help-text"
                style={{
                  background: "#f5f7ff",
                  color: "#222",
                  fontWeight: "600",
                  fontSize: "1.08rem",
                  borderRadius: "14px",
                  padding: "18px 24px",
                  marginTop: "36px",
                  boxShadow: "0 1px 8px rgba(102,126,234,0.07)",
                  borderLeft: "5px solid #667eea",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong className="text-danger">
                    Password Requirements:
                  </strong>{" "}
                  Minimum 6 characters. Keep it secure!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-in-out",
          }}
          onClick={closeModal}
        >
          {/* Modal Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              animation: "slideUp 0.4s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: "3.5rem",
                marginBottom: "16px",
                animation: "popIn 0.5s ease-out",
              }}
            >
              {modalType === "success" ? (
                <span style={{ color: "#10b981" }}>✓</span>
              ) : (
                <span style={{ color: "#ef4444" }}>✕</span>
              )}
            </div>

            {/* Title */}
            <h2
              style={{
                color: "#222",
                fontWeight: "700",
                fontSize: "1.5rem",
                marginBottom: "12px",
              }}
            >
              {modalType === "success" ? "Success!" : "Error"}
            </h2>

            {/* Message */}
            <p
              style={{
                color: "#444",
                fontSize: "1.08rem",
                fontWeight: "500",
                marginBottom: "28px",
                lineHeight: "1.6",
              }}
            >
              {modalType === "success" ? success : error}
            </p>

            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                background:
                  modalType === "success"
                    ? "linear-gradient(90deg,#10b981 0%,#059669 100%)"
                    : "linear-gradient(90deg,#ef4444 0%,#dc2626 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "14px 32px",
                fontWeight: "700",
                fontSize: "1.08rem",
                cursor: "pointer",
                boxShadow:
                  modalType === "success"
                    ? "0 4px 16px rgba(16,185,129,0.15)"
                    : "0 4px 16px rgba(239,68,68,0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  modalType === "success"
                    ? "0 6px 20px rgba(16,185,129,0.25)"
                    : "0 6px 20px rgba(239,68,68,0.25)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  modalType === "success"
                    ? "0 4px 16px rgba(16,185,129,0.15)"
                    : "0 4px 16px rgba(239,68,68,0.15)";
              }}
            >
              {modalType === "success" ? "Continue" : "Try Again"}
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes popIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
