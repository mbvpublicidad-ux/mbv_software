import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@apollo/client/react";
import {
	CHANGE_PASSWORD,
	UPDATE_USER,
} from "../graphql/mutations/userMutations";
import { useToast } from "../context/ToastContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import {
	BsLock,
	BsPerson,
	BsEnvelope,
	BsPhone,
	BsGeoAlt,
} from "react-icons/bs";

const MyAccountPage = () => {
	const { user } = useAuth();
	const { toast } = useToast();

	const [profileData, setProfileData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: user?.phone || "",
		address: user?.address || "",
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState({});

	const [updateUserMutation, { loading: updatingProfile }] =
		useMutation(UPDATE_USER);
	const [changePasswordMutation, { loading: changingPassword }] =
		useMutation(CHANGE_PASSWORD);

	const handleProfileUpdate = async (e) => {
		e.preventDefault();
		setErrors({});

		try {
			await updateUserMutation({
				variables: {
					id: user._id,
					input: {
						name: profileData.name,
						phone: profileData.phone,
						address: profileData.address,
					},
				},
			});
			toast.success("Perfil actualizado exitosamente");
		} catch (error) {
			toast.error(error.message || "Error al actualizar perfil");
		}
	};

	const handlePasswordChange = async (e) => {
		e.preventDefault();

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setErrors({ confirmPassword: "Las contraseñas no coinciden" });
			return;
		}

		if (passwordData.newPassword.length < 6) {
			setErrors({ newPassword: "Mínimo 6 caracteres" });
			return;
		}

		try {
			await changePasswordMutation({
				variables: {
					input: {
						currentPassword: passwordData.currentPassword,
						newPassword: passwordData.newPassword,
					},
				},
			});
			toast.success("Contraseña actualizada exitosamente");
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error) {
			toast.error(error.message || "Error al cambiar contraseña");
		}
	};

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
				<h1 className="text-3xl font-bold text-first mb-8">Mi Cuenta</h1>

				{/* Profile Section */}
				<div className="bg-main rounded-2xl border border-first/10 shadow-sm p-6 mb-8">
					<h2 className="text-lg font-semibold text-first mb-6">
						Información Personal
					</h2>

					<form onSubmit={handleProfileUpdate} className="space-y-4">
						<Input
							label="Nombre"
							value={profileData.name}
							onChange={(e) =>
								setProfileData((p) => ({ ...p, name: e.target.value }))
							}
							iconLeft={<BsPerson className="w-4 h-4" />}
							size="md"
						/>
						<Input
							label="Email"
							value={profileData.email}
							disabled
							iconLeft={<BsEnvelope className="w-4 h-4" />}
							size="md"
						/>
						<Input
							label="Teléfono"
							value={profileData.phone}
							onChange={(e) =>
								setProfileData((p) => ({ ...p, phone: e.target.value }))
							}
							iconLeft={<BsPhone className="w-4 h-4" />}
							size="md"
						/>
						<Input
							label="Dirección"
							value={profileData.address}
							onChange={(e) =>
								setProfileData((p) => ({ ...p, address: e.target.value }))
							}
							iconLeft={<BsGeoAlt className="w-4 h-4" />}
							size="md"
						/>

						<Button type="submit" loading={updatingProfile} size="md">
							Guardar cambios
						</Button>
					</form>
				</div>

				{/* Password Section */}
				<div className="bg-main rounded-2xl border border-first/10 shadow-sm p-6">
					<h2 className="text-lg font-semibold text-first mb-6">
						Cambiar Contraseña
					</h2>

					<form onSubmit={handlePasswordChange} className="space-y-4">
						<Input
							label="Contraseña actual"
							type="password"
							value={passwordData.currentPassword}
							onChange={(e) =>
								setPasswordData((p) => ({
									...p,
									currentPassword: e.target.value,
								}))
							}
							iconLeft={<BsLock className="w-4 h-4" />}
							size="md"
							required
						/>
						<Input
							label="Nueva contraseña"
							type="password"
							value={passwordData.newPassword}
							onChange={(e) => {
								setPasswordData((p) => ({ ...p, newPassword: e.target.value }));
								setErrors({});
							}}
							iconLeft={<BsLock className="w-4 h-4" />}
							error={errors.newPassword}
							size="md"
							required
						/>
						<Input
							label="Confirmar nueva contraseña"
							type="password"
							value={passwordData.confirmPassword}
							onChange={(e) => {
								setPasswordData((p) => ({
									...p,
									confirmPassword: e.target.value,
								}));
								setErrors({});
							}}
							iconLeft={<BsLock className="w-4 h-4" />}
							error={errors.confirmPassword}
							size="md"
							required
						/>

						<Button
							type="submit"
							variant="secondary"
							loading={changingPassword}
							size="md"
						>
							Cambiar contraseña
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default MyAccountPage;
