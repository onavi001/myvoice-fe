import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  fetchUsers,
  updateUser,
  fetchCoachRequests,
  approveCoachRequest,
  rejectCoachRequest,
  selectUsers,
  selectCoachRequests,
} from "../store/userManagementSlice";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ThunkError } from "../store/userManagementSlice";

interface UserEditData {
  userName: string;
  email: string;
  role: "user" | "coach" | "admin";
}

const Admin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const users = useSelector(selectUsers);
  const requests = useSelector(selectCoachRequests);
  const loading = useSelector((state: RootState) => state.userManagement.loading);
  const { token, user } = useSelector((state: RootState) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [editData, setEditData] = useState<Record<string, UserEditData>>({});
  const [savingUser, setSavingUser] = useState<Record<string, boolean>>({});
  const [processingRequest, setProcessingRequest] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data on mount
  useEffect(() => {
    if (token && user?.role === "admin") {
      dispatch(fetchUsers());
      dispatch(fetchCoachRequests());
    } else {
      navigate("/login");
    }
  }, [token, user, dispatch, navigate]);

  const handleBack = () => navigate("/routine");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEditChange = useCallback(
    (userId: string, field: keyof UserEditData, value: string) => {
      setEditData((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], [field]: value },
      }));
    },
    []
  );

  const handleSaveUser = async (userId: string) => {
    setSavingUser((prev) => ({ ...prev, [userId]: true }));
    try {
      await dispatch(updateUser({ userId, updatedUser: editData[userId] })).unwrap();
      setToast({ message: "Usuario actualizado correctamente", variant: "success" });
      setEditData((prev) => {
        const newData = { ...prev };
        delete newData[userId];
        return newData;
      });
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: error.message || "Error al actualizar usuario", variant: "error" });
      }
    } finally {
      setSavingUser((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setProcessingRequest((prev) => ({ ...prev, [requestId]: true }));
    try {
      await dispatch(approveCoachRequest(requestId)).unwrap();
      setToast({ message: "Solicitud de coach aprobada", variant: "success" });
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: error.message || "Error al aprobar solicitud", variant: "error" });
      }
    } finally {
      setProcessingRequest((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest((prev) => ({ ...prev, [requestId]: true }));
    try {
      await dispatch(rejectCoachRequest(requestId)).unwrap();
      setToast({ message: "Solicitud de coach rechazada", variant: "success" });
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
      } else {
        setToast({ message: error.message || "Error al rechazar solicitud", variant: "error" });
      }
    } finally {
      setProcessingRequest((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const filteredUsers = useMemo(() => {
    console.log("Filtering users...");
    console.log("Search query:", searchQuery);
    console.log("Users:", users); 
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => req.status === "pending");
  }, [requests]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-3 sm:p-6 max-w-full flex-1">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBack}
              className="bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] p-1.5 sm:p-2 rounded-lg min-h-10 sm:min-h-12 transition-colors flex items-center justify-center gap-2"
              aria-label="Back to routines"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <h1 className="text-base sm:text-xl text-[#E0E0E0]">Administración</h1>
          </div>
        </div>

        <Input
          name="search"
          type="text"
          placeholder="Buscar usuario por nombre o email..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] placeholder-[#B0B0B0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all mb-4"
          aria-label="Search users"
        />

        {loading && (
          <div className="flex justify-center">
            <Loader/>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-base sm:text-lg text-[#E0E0E0]">Usuarios</h2>
          {filteredUsers.length === 0 ? (
            <p className="text-[#B0B0B0] text-xs sm:text-sm text-center">
              No se encontraron usuarios.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm text-[#E0E0E0]">
                          Nombre
                        </label>
                        <Input
                          name="name"
                          type="text"
                          value={editData[user._id]?.userName ?? user.username}
                          onChange={(e) =>
                            handleEditChange(user._id, "userName", e.target.value)
                          }
                          className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                          aria-label={`Edit name for ${user.username}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm text-[#E0E0E0]">
                          Email
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={editData[user._id]?.email ?? user.email}
                          onChange={(e) =>
                            handleEditChange(user._id, "email", e.target.value)
                          }
                          className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                          aria-label={`Edit email for ${user.username}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm text-[#E0E0E0]">
                          Rol
                        </label>
                        <Select
                          value={editData[user._id]?.role ?? user.role}
                          onChange={(e) =>
                            handleEditChange(user._id, "role", e.target.value)
                          }
                          className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto"
                          aria-label={`Edit role for ${user.username}`}
                        >
                          <option value="user">Usuario</option>
                          <option value="coach">Coach</option>
                          <option value="admin">Admin</option>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSaveUser(user._id)}
                      disabled={savingUser[user._id] || !editData[user._id]}
                      className="mt-2 w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      aria-label={`Save changes for ${user.username}`}
                    >
                      {savingUser[user._id] ? (
                        <Loader/>
                      ) : (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Guardar
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      aria-label="Items per page"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                    </select>
                    <span className="text-xs sm:text-sm text-[#B0B0B0]">
                      por página
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg disabled:opacity-50 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors flex items-center justify-center gap-2"
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Input
                      name="page"
                      type="number"
                      value={currentPage}
                      onChange={(e) => {
                        const page = Number(e.target.value);
                        if (page >= 1 && page <= totalPages)
                          setCurrentPage(page);
                      }}
                      className="w-16 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-center h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
                      aria-label="Jump to page"
                    />
                    <span className="text-xs sm:text-sm text-[#B0B0B0]">
                      de {totalPages}
                    </span>
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-1.5 sm:p-2 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg disabled:opacity-50 text-xs sm:text-sm min-h-10 sm:min-h-12 transition-colors flex items-center justify-center gap-2"
                      aria-label="Next page"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <h2 className="text-base sm:text-lg text-[#E0E0E0] mt-6">
            Solicitudes de Coach
          </h2>
          {filteredRequests.length === 0 ? (
            <p className="text-[#B0B0B0] text-xs sm:text-sm text-center">
              No hay solicitudes pendientes.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((request) => (
                <motion.div
                  key={request._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3"
                >
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs sm:text-sm text-[#E0E0E0]">
                        Usuario: {request.userId.username} ({request.userId.email})
                      </span>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-[#E0E0E0]">
                        Fecha: {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-[#E0E0E0]">
                        Mensaje
                      </label>
                      <textarea
                        value={request.message}
                        readOnly
                        className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-16 resize-none"
                        aria-label={`Coach request message from ${request.userId.username}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveRequest(request._id)}
                        disabled={processingRequest[request._id]}
                        className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        aria-label={`Approve coach request from ${request.userId.username}`}
                      >
                        {processingRequest[request._id] ? (
                          <Loader/>
                        ) : (
                          <>
                            <CheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Aprobar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request._id)}
                        disabled={processingRequest[request._id]}
                        className="flex-1 bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm min-h-10 sm:min-h-12 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        aria-label={`Reject coach request from ${request.userId.username}`}
                      >
                        {processingRequest[request._id] ? (
                          <Loader/>
                        ) : (
                          <>
                            <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Rechazar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {toast && (
            <Toast
              type={toast.variant}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;