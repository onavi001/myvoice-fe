import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { ProfileUpdateData, updateProfile } from "../store/userSlice";
import { createCoachRequest, fetchUserCoachRequest } from "../store/userManagementSlice";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Loader, { SmallLoader } from "../components/Loader";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/20/solid";

interface FormData {
  username: string;
  email: string;
  password: string;
  oldPassword: string;
  bio: string;
  goals: string;
  notes: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
  goals?: string;
  bio?: string;
  notes?: string;
  coachRequest?: string;
}

export default function EditProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading: userLoading, error: userError } = useSelector((state: RootState) => state.user);
  const { userCoachRequest, loading: managementLoading, error: managementError } = useSelector((state: RootState) => state.userManagement);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    oldPassword: "",
    bio: "",
    goals: "",
    notes: "",
  });
  const [coachRequestMessage, setCoachRequestMessage] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [submittingCoachRequest, setSubmittingCoachRequest] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        oldPassword: "",
        bio: user.bio || "",
        goals: user.goals?.join(", ") || "",
        notes: user.notes || "",
      });
      if (user.role === "user") {
        dispatch(fetchUserCoachRequest());
      }
    }
  }, [user, dispatch]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "coachRequestMessage") {
      setCoachRequestMessage(value);
      setFormErrors((prev) => ({ ...prev, coachRequest: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Nombre: 3-50 caracteres, letras, números, guiones, espacios
    if (!formData.username.trim()) {
      errors.username = "El nombre es obligatorio";
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      errors.username = "El nombre debe tener entre 3 y 50 caracteres";
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.username)) {
      errors.username = "El nombre solo puede contener letras, números, guiones o espacios";
    }

    // Correo: formato válido, máximo 100 caracteres
    if (!formData.email.trim()) {
      errors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Ingresa un correo válido";
    } else if (formData.email.length > 100) {
      errors.email = "El correo no puede exceder 100 caracteres";
    }

    // Contraseña: opcional, 8-50 caracteres, mayúscula, minúscula, número, especial
    if (formData.password) {
      if (formData.password.length < 8 || formData.password.length > 50) {
        errors.password = "La contraseña debe tener entre 8 y 50 caracteres";
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,50}$/.test(formData.password)) {
        errors.password = "La contraseña debe incluir una mayúscula, una minúscula, un número y un carácter especial (@, $, !, %, *, ?, &, ., #)";
      }
    }

    // Contraseña anterior: requerida si hay nueva contraseña
    if (formData.password && !formData.oldPassword.trim()) {
      errors.oldPassword = "La contraseña anterior es obligatoria";
    } else if (formData.oldPassword && (formData.oldPassword.length < 8 || formData.oldPassword.length > 50)) {
      errors.oldPassword = "La contraseña anterior debe tener entre 8 y 50 caracteres";
    } else if (
      formData.oldPassword &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,50}$/.test(formData.oldPassword)
    ) {
      errors.oldPassword = "La contraseña anterior debe incluir una mayúscula, una minúscula, un número y un carácter especial (@, $, !, %, *, ?, &, ., #)";
    }

    // Bio: opcional, máximo 500 caracteres
    if (formData.bio.length > 500) {
      errors.bio = "La bio no puede exceder 500 caracteres";
    }

    // Objetivos (solo user): opcional, 2-50 caracteres por objetivo, máximo 10
    if (user.role === "user" && formData.goals) {
      const goalsArray = formData.goals.split(",").map((g) => g.trim()).filter((g) => g);
      if (goalsArray.length > 10) {
        errors.goals = "No puedes tener más de 10 objetivos";
      } else if (goalsArray.some((g) => g.length < 2 || g.length > 50)) {
        errors.goals = "Cada objetivo debe tener entre 2 y 50 caracteres";
      }
    }

    // Notas (solo user): opcional, máximo 500 caracteres
    if (user.role === "user" && formData.notes.length > 500) {
      errors.notes = "Las notas no pueden exceder 500 caracteres";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCoachRequest = (): boolean => {
    const errors: FormErrors = {};
    if (!coachRequestMessage.trim()) {
      errors.coachRequest = "El mensaje es obligatorio";
    } else if (coachRequestMessage.length > 500) {
      errors.coachRequest = "El mensaje no puede exceder 500 caracteres";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload: ProfileUpdateData = {
        username: formData.username,
        email: formData.email,
      };
      if (formData.password) {
        payload.password = formData.password;
        payload.oldPassword = formData.oldPassword;
      }
      if (user.role === "user") {
        payload.bio = formData.bio;
        payload.goals = formData.goals;
        payload.notes = formData.notes;
      } else {
        payload.bio = formData.bio;
      }
      await dispatch(updateProfile(payload)).unwrap();
    } catch (error: unknown) {
      const errorMessage = typeof error === "string" ? error : "Error al guardar los cambios";
      setFormErrors({
        notes:
          errorMessage === "Contraseña anterior incorrecta"
            ? "La contraseña anterior es incorrecta"
            : errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCoachRequest = async () => {
    if (!validateCoachRequest()) return;
    setSubmittingCoachRequest(true);
    try {
      await dispatch(createCoachRequest({ message: coachRequestMessage })).unwrap();
      setCoachRequestMessage("");
    } catch (error: unknown) {
      const errorMessage = typeof error === "string" ? error : "Error al enviar la solicitud";
      setFormErrors({ coachRequest: errorMessage });
    } finally {
      setSubmittingCoachRequest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      {(userLoading || managementLoading) && <Loader />}
      <div className="p-3 sm:p-6 w-full mx-2 sm:max-w-3xl sm:mx-auto flex-1">
        <Button
          variant="secondary"
          onClick={() => navigate(user.role === "coach" ? "/coach" : "/")}
          className="mb-6 bg-[#4A4A4A] text-[#E0E0E0] active:bg-[#5A5A5A]/80 rounded-lg px-5 py-3 text-base font-semibold border border-[#4A4A4A] shadow-md transition-colors flex items-center gap-2 min-h-12"
        >
          <ArrowLeftIcon className="w-6 h-6" /> Volver
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Editar Perfil</h1>

        <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#FFD700] mb-4">Información Personal</h2>
          {(userError || formErrors.notes) && (
            <p className="text-red-500 text-sm mb-4 text-center">{userError || formErrors.notes}</p>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Nombre</label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
              />
              {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
            </div>
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Correo</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Nueva Contraseña (opcional)</label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nueva contraseña"
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
              />
              {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
            </div>
            {formData.password && (
              <div className="transition-all duration-300">
                <label className="block text-[#E0E0E0] text-base font-medium mb-1">Contraseña Anterior</label>
                <Input
                  name="oldPassword"
                  type="password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder="Contraseña anterior"
                  className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
                />
                {formErrors.oldPassword && <p className="text-red-500 text-sm mt-1">{formErrors.oldPassword}</p>}
              </div>
            )}
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Bio</label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Cuéntanos sobre ti..."
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors h-28 resize-none"
              />
              {formErrors.bio && <p className="text-red-500 text-sm mt-1">{formErrors.bio}</p>}
            </div>
            {user.role === "user" && (
              <>
                <div>
                  <label className="block text-[#E0E0E0] text-base font-medium mb-1">Objetivos</label>
                  <Input
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    placeholder="Fuerza, Resistencia, etc."
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
                  />
                  {formErrors.goals && <p className="text-red-500 text-sm mt-1">{formErrors.goals}</p>}
                </div>
                <div>
                  <label className="block text-[#E0E0E0] text-base font-medium mb-1">Notas</label>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Notas personales..."
                    className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors h-28 resize-none"
                  />
                  {formErrors.notes && <p className="text-red-500 text-sm mt-1">{formErrors.notes}</p>}
                </div>
              </>
            )}
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-[#66BB6A] text-black active:bg-[#4CAF50]/80 rounded-lg py-3 px-5 text-base font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/90 disabled:opacity-80 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-12"
            >
              {saving ? <SmallLoader /> : <><CheckIcon className="w-6 h-6" /> Guardar Cambios</>}
            </Button>
          </div>
        </Card>

        {user.role === "user" && (!userCoachRequest || userCoachRequest.status === "rejected") && (
          <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#FFD700] mb-4">Solicitar Ser Coach</h2>
            {managementError && (
              <p className="text-red-500 text-sm mb-4 text-center">{managementError}</p>
            )}
            {userCoachRequest && (
              <p className="text-[#E0E0E0] text-sm mb-4">
                Estado de la solicitud: {userCoachRequest.status === "pending" ? "Pendiente" : "Rechazada"}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-[#E0E0E0] text-base font-medium mb-1">
                  Mensaje para los Administradores
                </label>
                <Textarea
                  name="coachRequestMessage"
                  value={coachRequestMessage}
                  onChange={handleChange}
                  placeholder="Explica por qué quieres ser coach..."
                  className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors h-28 resize-none"
                />
                {formErrors.coachRequest && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.coachRequest}</p>
                )}
              </div>
              <Button
                onClick={handleCoachRequest}
                disabled={submittingCoachRequest || (userCoachRequest?.status === "pending")}
                className="w-full bg-[#66BB6A] text-black active:bg-[#4CAF50]/80 rounded-lg py-3 px-5 text-base font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/90 disabled:opacity-80 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-12"
              >
                {submittingCoachRequest ? (
                  <SmallLoader />
                ) : (
                  <><CheckIcon className="w-6 h-6" /> Enviar Solicitud de Coach</>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}