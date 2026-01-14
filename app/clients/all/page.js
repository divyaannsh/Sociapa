"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../../components/PageHeader";
import "../../../styles/ClientsCreate.css";

export default function ClientsAll() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'view', 'edit', 'delete'
  const [selectedClient, setSelectedClient] = useState(null);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageType, setMessageType] = useState("");

  // Fetch all clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch clients");
      } else {
        setClients(data.clients || []);
      }
    } catch (err) {
      setError("An error occurred while fetching clients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (client) => {
    setSelectedClient(client);
    setModalType("view");
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setEditFormData({
      companyName: client.companyName,
      username: client.username,
      password: "",
    });
    setShowPassword(false);
    setModalType("edit");
    setShowModal(true);
  };

  const openDeleteModal = (client) => {
    setSelectedClient(client);
    setModalType("delete");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setEditFormData({ companyName: "", username: "", password: "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editFormData.companyName.trim() || !editFormData.username.trim()) {
      setModalMessage("Company Name and Username are required");
      setMessageType("error");
      setShowMessageModal(true);
      return;
    }

    if (editFormData.password && editFormData.password.length < 6) {
      setModalMessage("Password must be at least 6 characters long");
      setMessageType("error");
      setShowMessageModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/clients/${selectedClient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalMessage(data.message || "Failed to update client");
        setMessageType("error");
        setShowMessageModal(true);
        return;
      }

      setModalMessage("Client updated successfully!");
      setMessageType("success");
      setShowMessageModal(true);
      closeModal();
      fetchClients();
    } catch (err) {
      setModalMessage("An error occurred while updating client");
      setMessageType("error");
      setShowMessageModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/clients/${selectedClient._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setModalMessage(data.message || "Failed to delete client");
        setMessageType("error");
        setShowMessageModal(true);
        return;
      }

      setModalMessage("Client deleted successfully!");
      setMessageType("success");
      setShowMessageModal(true);
      closeModal();
      fetchClients();
    } catch (err) {
      setModalMessage("An error occurred while deleting client");
      setMessageType("error");
      setShowMessageModal(true);
    }
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setModalMessage("");
    setMessageType("");
  };

  return (
    <>
      <PageHeader
        title="All Clients"
        breadcrumb={[
          { label: "Home", path: "/" },
          { label: "Clients", path: "/clients" },
          { label: "All", path: "/clients/all" },
        ]}
      />

      <div className="main-content">
        <div
          style={{
            background: "#fff",
            width: "100vw",
            minHeight: "calc(100vh - 80px)",
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
            padding: "40px 0",
          }}
        >
          <div style={{ width: "90vw", maxWidth: "1200px", margin: "0 auto" }}>
            {/* ...existing code... */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "2rem", color: "#4F46E5" }}>⟳</div>
                <p
                  style={{
                    color: "#666",
                    fontSize: "1.1rem",
                    marginTop: "16px",
                  }}
                >
                  Loading clients...
                </p>
              </div>
            ) : error ? (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  fontSize: "1.08rem",
                }}
              >
                {error}
              </div>
            ) : clients.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📋</div>
                <p style={{ color: "#666", fontSize: "1.1rem" }}>
                  No clients found. Create one to get started!
                </p>
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f9fafb",
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      <th
                        style={{
                          padding: "18px 24px",
                          textAlign: "left",
                          color: "#222",
                          fontWeight: "700",
                          fontSize: "1.08rem",
                        }}
                      >
                        Company Name
                      </th>
                      <th
                        style={{
                          padding: "18px 24px",
                          textAlign: "left",
                          color: "#222",
                          fontWeight: "700",
                          fontSize: "1.08rem",
                        }}
                      >
                        Username
                      </th>
                      <th
                        style={{
                          padding: "18px 24px",
                          textAlign: "left",
                          color: "#222",
                          fontWeight: "700",
                          fontSize: "1.08rem",
                        }}
                      >
                        Created Date
                      </th>
                      <th
                        style={{
                          padding: "18px 24px",
                          textAlign: "center",
                          color: "#222",
                          fontWeight: "700",
                          fontSize: "1.08rem",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, index) => (
                      <tr
                        key={client._id}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                          background: index % 2 === 0 ? "#fff" : "#f9fafb",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            index % 2 === 0 ? "#f3f4f6" : "#eff6ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            index % 2 === 0 ? "#fff" : "#f9fafb";
                        }}
                      >
                        <td
                          style={{
                            padding: "18px 24px",
                            color: "#222",
                            fontWeight: "600",
                            fontSize: "1.08rem",
                          }}
                        >
                          {client.companyName}
                        </td>
                        <td
                          style={{
                            padding: "18px 24px",
                            color: "#666",
                            fontSize: "1.08rem",
                          }}
                        >
                          {client.username}
                        </td>
                        <td
                          style={{
                            padding: "18px 24px",
                            color: "#666",
                            fontSize: "1.08rem",
                          }}
                        >
                          {new Date(client.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td
                          style={{
                            padding: "18px 24px",
                            textAlign: "center",
                            display: "flex",
                            gap: "12px",
                            justifyContent: "center",
                          }}
                        >
                          {/* View Icon */}
                          <button
                            onClick={() => openViewModal(client)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "1.4rem",
                              color: "#4F46E5",
                              transition: "transform 0.2s, color 0.2s",
                              padding: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.2)";
                              e.target.style.color = "#667eea";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                              e.target.style.color = "#4F46E5";
                            }}
                            title="View Details"
                          >
                            <i className="feather-eye"></i>
                          </button>

                          {/* Edit Icon */}
                          <button
                            onClick={() => openEditModal(client)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "1.4rem",
                              color: "#f59e0b",
                              transition: "transform 0.2s, color 0.2s",
                              padding: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.2)";
                              e.target.style.color = "#fbbf24";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                              e.target.style.color = "#f59e0b";
                            }}
                            title="Edit Client"
                          >
                            <i className="feather-edit-2"></i>
                          </button>

                          {/* Delete Icon */}
                          <button
                            onClick={() => openDeleteModal(client)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "1.4rem",
                              color: "#ef4444",
                              transition: "transform 0.2s, color 0.2s",
                              padding: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "scale(1.2)";
                              e.target.style.color = "#f87171";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "scale(1)";
                              e.target.style.color = "#ef4444";
                            }}
                            title="Delete Client"
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for View, Edit, Delete */}
      {showModal && selectedClient && (
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
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              animation: "slideUp 0.4s ease-out",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* View Modal */}
            {modalType === "view" && (
              <>
                <h2
                  style={{
                    color: "#222",
                    fontWeight: "700",
                    fontSize: "1.5rem",
                    marginBottom: "24px",
                  }}
                >
                  Client Details
                </h2>
                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                    }}
                  >
                    Company Name
                  </p>
                  <p
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedClient.companyName}
                  </p>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                    }}
                  >
                    Username
                  </p>
                  <p
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedClient.username}
                  </p>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                    }}
                  >
                    Created Date
                  </p>
                  <p
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {new Date(selectedClient.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background:
                      "linear-gradient(90deg,#667eea 0%,#764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "1.08rem",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </>
            )}

            {/* Edit Modal */}
            {modalType === "edit" && (
              <>
                <h2
                  style={{
                    color: "#222",
                    fontWeight: "700",
                    fontSize: "1.5rem",
                    marginBottom: "24px",
                  }}
                >
                  Edit Client
                </h2>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Company Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={editFormData.companyName}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "1.08rem",
                      color: "#222",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Username <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "1.08rem",
                      color: "#222",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      marginTop: "4px",
                      marginBottom: "0",
                    }}
                  >
                    Leave password blank to keep current password
                  </p>
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Password
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={editFormData.password}
                      onChange={handleEditChange}
                      placeholder="Leave blank to keep current password"
                      style={{
                        width: "100%",
                        padding: "12px",
                        paddingRight: "40px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "1.08rem",
                        color: "#222",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#4F46E5",
                        fontSize: "1.2rem",
                      }}
                    >
                      <i
                        className={`feather-${
                          showPassword ? "eye-off" : "eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background:
                        "linear-gradient(90deg,#10b981 0%,#059669 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "1.08rem",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={closeModal}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#e5e7eb",
                      color: "#222",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "1.08rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Delete Modal */}
            {modalType === "delete" && (
              <>
                <h2
                  style={{
                    color: "#222",
                    fontWeight: "700",
                    fontSize: "1.5rem",
                    marginBottom: "16px",
                  }}
                >
                  Delete Client?
                </h2>
                <p
                  style={{
                    color: "#666",
                    fontSize: "1.08rem",
                    marginBottom: "24px",
                    lineHeight: "1.6",
                  }}
                >
                  Are you sure you want to delete{" "}
                  <strong>{selectedClient.companyName}</strong>? This action
                  cannot be undone.
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleDeleteConfirm}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background:
                        "linear-gradient(90deg,#ef4444 0%,#dc2626 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "1.08rem",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={closeModal}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#e5e7eb",
                      color: "#222",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "1.08rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
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
            zIndex: 1001,
            animation: "fadeIn 0.3s ease-in-out",
          }}
          onClick={closeMessageModal}
        >
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
            <div
              style={{
                fontSize: "3.5rem",
                marginBottom: "16px",
                animation: "popIn 0.5s ease-out",
              }}
            >
              {messageType === "success" ? (
                <span style={{ color: "#10b981" }}>✓</span>
              ) : (
                <span style={{ color: "#ef4444" }}>✕</span>
              )}
            </div>
            <h2
              style={{
                color: "#222",
                fontWeight: "700",
                fontSize: "1.5rem",
                marginBottom: "12px",
              }}
            >
              {messageType === "success" ? "Success!" : "Error"}
            </h2>
            <p
              style={{
                color: "#444",
                fontSize: "1.08rem",
                fontWeight: "500",
                marginBottom: "28px",
              }}
            >
              {modalMessage}
            </p>
            <button
              onClick={closeMessageModal}
              style={{
                background:
                  messageType === "success"
                    ? "linear-gradient(90deg,#10b981 0%,#059669 100%)"
                    : "linear-gradient(90deg,#ef4444 0%,#dc2626 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 32px",
                fontWeight: "700",
                fontSize: "1.08rem",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

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
