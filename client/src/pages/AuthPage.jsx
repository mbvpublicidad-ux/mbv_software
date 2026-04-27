import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BsEnvelope, BsLock, BsArrowLeft } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { LoadingOverlay } from "../components/ui/LoadingUi";

const AuthPage = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const { login, register, isAuthenticated } = useAuth();
	const { toast } = useToast();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (isAuthenticated) {
			const from = location.state?.from?.pathname || "/";
			navigate(from, { replace: true });
		}
	}, [isAuthenticated, navigate, location]);

	const validateForm = () => {
		const newErrors = {};

		if (!formData.email.trim()) {
			newErrors.email = "El email es requerido";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Email inválido";
		}

		if (!formData.password) {
			newErrors.password = "La contraseña es requerida";
		} else if (formData.password.length < 6) {
			newErrors.password = "Mínimo 6 caracteres";
		}

		if (!isLogin) {
			if (!formData.name.trim()) {
				newErrors.name = "El nombre es requerido";
			}
			if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = "Las contraseñas no coinciden";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		try {
			if (isLogin) {
				const result = await login(formData.email, formData.password);
				if (!result.success) {
					toast.error(result.error || "Error al iniciar sesión");
				} else {
					toast.success("Inicio de sesión exitoso");
				}
			} else {
				const { data } = await register({
					variables: {
						input: {
							name: formData.name,
							email: formData.email,
							password: formData.password,
						},
					},
				});
				if (data?.register) {
					toast.success("Registro exitoso");
				}
			}
		} catch (error) {
			toast.error(error.message || "Error en la autenticación");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const switchMode = () => {
		setIsLogin(!isLogin);
		setErrors({});
		setFormData({ name: "", email: "", password: "", confirmPassword: "" });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-second/5 to-main py-12 px-4">
			{loading && (
				<LoadingOverlay
					visible={true}
					text={isLogin ? "Iniciando sesión..." : "Registrando..."}
				/>
			)}

			<div className="w-full max-w-md">
				{/* Back button */}
				<button
					onClick={() => navigate("/")}
					className="flex items-center gap-2 text-first/50 hover:text-first mb-8 transition-colors"
				>
					<BsArrowLeft className="w-4 h-4" />
					<span className="text-sm">Volver al inicio</span>
				</button>

				{/* Card */}
				<div className="bg-main rounded-2xl border border-first/10 shadow-xl p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-first">
							{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
						</h1>
						<p className="text-first/50 text-sm mt-2">
							{isLogin
								? "Accede a tu cuenta para ver tus autos"
								: "Regístrate para explorar nuestro catálogo"}
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{!isLogin && (
							<Input
								label="Nombre completo"
								name="name"
								placeholder="Tu nombre"
								value={formData.name}
								onChange={handleChange}
								error={errors.name}
								required
								size="md"
							/>
						)}

						<Input
							label="Email"
							name="email"
							type="email"
							placeholder="tu@email.com"
							iconLeft={<BsEnvelope className="w-4 h-4" />}
							value={formData.email}
							onChange={handleChange}
							error={errors.email}
							required
							size="md"
						/>

						<Input
							label="Contraseña"
							name="password"
							type="password"
							placeholder="••••••"
							iconLeft={<BsLock className="w-4 h-4" />}
							value={formData.password}
							onChange={handleChange}
							error={errors.password}
							required
							size="md"
						/>

						{!isLogin && (
							<Input
								label="Confirmar contraseña"
								name="confirmPassword"
								type="password"
								placeholder="••••••"
								iconLeft={<BsLock className="w-4 h-4" />}
								value={formData.confirmPassword}
								onChange={handleChange}
								error={errors.confirmPassword}
								required
								size="md"
							/>
						)}

						<Button
							type="submit"
							variant="primary"
							size="lg"
							fullWidth
							disabled={loading}
						>
							{isLogin ? "Iniciar sesión" : "Crear cuenta"}
						</Button>
					</form>

					{/* Switch mode */}
					<div className="mt-6 text-center">
						<p className="text-first/50 text-sm">
							{isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
							<button
								type="button"
								onClick={switchMode}
								className="text-second hover:underline font-medium"
							>
								{isLogin ? "Regístrate" : "Inicia sesión"}
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
