import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";

import {
	GET_CAR_MODELS,
	GET_BRANDS,
} from "../graphql/queries/brandModelQueries";

import { BsCarFront, BsSearch } from "react-icons/bs";

import Select from "../components/ui/Select";
import EmptyState from "../components/ui/EmptyState";
import { LoadingOverlay } from "../components/ui/LoadingUi";

import Pagination from "../components/common/Pagination";

const ModelsPage = () => {
	const [searchParams] = useSearchParams();
	const brandFromUrl = searchParams.get("brand") || "";

	const [search, setSearch] = useState("");
	const [selectedBrand, setSelectedBrand] = useState(brandFromUrl);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12;

	const { data: brandsData } = useQuery(GET_BRANDS);
	const { data: modelsData, loading } = useQuery(GET_CAR_MODELS, {
		variables: { brandId: selectedBrand || undefined },
	});

	const brands = brandsData?.brands || [];
	const models = modelsData?.carModels || [];

	const brandOptions = [
		{ value: "", label: "Todas las marcas" },
		...brands.map((b) => ({ value: b._id, label: b.name })),
	];

	const filteredModels = models.filter((model) =>
		model.name.toLowerCase().includes(search.toLowerCase()),
	);

	const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
	const paginatedModels = filteredModels.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-3xl sm:text-4xl font-bold text-first">
						Modelos Disponibles
					</h1>
					<p className="mt-3 text-first/50 max-w-2xl mx-auto">
						Explora todos los modelos de vehículos disponibles en nuestro
						catálogo.
					</p>
				</div>

				{/* Filters */}
				<div className="max-w-2xl mx-auto mb-8 space-y-4">
					<Select
						label="Filtrar por marca"
						size="md"
						options={brandOptions}
						value={selectedBrand}
						onChange={(e) => {
							setSelectedBrand(e.target.value);
							setCurrentPage(1);
						}}
					/>

					<div className="relative">
						<BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-first/30" />
						<input
							type="text"
							placeholder="Buscar modelo..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
							className="w-full pl-10 pr-4 py-3 rounded-xl border border-first/10 bg-main text-first text-sm
                       focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second
                       placeholder:text-first/30 transition-all duration-150"
						/>
					</div>
				</div>

				{/* Loading */}
				{loading && (
					<LoadingOverlay visible={true} text="Cargando modelos..." />
				)}

				{/* Models Grid */}
				{!loading && paginatedModels.length > 0 ? (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
							{paginatedModels.map((model) => (
								<div
									key={model._id}
									className="group bg-main rounded-xl border border-first/10 p-6 text-center
                           hover:border-second/30 hover:shadow-lg hover:shadow-second/5
                           transition-all duration-300 transform hover:-translate-y-1"
								>
									<div
										className="w-12 h-12 mx-auto mb-3 rounded-full bg-second/10 flex items-center justify-center
                                group-hover:bg-second/20 transition-colors duration-300"
									>
										<BsCarFront className="w-6 h-6 text-second" />
									</div>
									<h3 className="text-sm font-semibold text-first">
										{model.name}
									</h3>
									<p className="text-xs text-first/40 mt-1">
										{model.brand?.name}
									</p>
								</div>
							))}
						</div>

						{totalPages > 1 && (
							<div className="mt-8">
								<Pagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
								/>
							</div>
						)}
					</>
				) : !loading ? (
					<EmptyState
						title="No se encontraron modelos"
						description={
							selectedBrand || search
								? "Intenta con otros filtros de búsqueda"
								: "No hay modelos disponibles aún"
						}
					/>
				) : null}
			</div>
		</div>
	);
};

export default ModelsPage;
