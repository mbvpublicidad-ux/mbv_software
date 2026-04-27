import { Link } from "react-router-dom";
import { BsExclamationTriangle, BsArrowLeft } from "react-icons/bs";
import Button from "../components/ui/Button";

const NoMatchPage = () => {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
					<BsExclamationTriangle className="w-10 h-10 text-warning" />
				</div>

				<h1 className="text-6xl font-bold text-first mb-4">404</h1>
				<h2 className="text-2xl font-semibold text-first mb-2">
					Página no encontrada
				</h2>
				<p className="text-first/50 mb-8">
					Lo sentimos, la página que buscas no existe o ha sido movida.
				</p>

				<Link to="/">
					<Button icon={<BsArrowLeft className="w-4 h-4" />} size="lg">
						Volver al inicio
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default NoMatchPage;
