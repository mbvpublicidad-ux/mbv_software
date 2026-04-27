import { useState, useCallback, useEffect } from "react";

import {
	BsChevronLeft,
	BsChevronRight,
	BsX,
	BsCarFront,
	BsZoomIn,
} from "react-icons/bs";

const ImageGallery = ({ images = [] }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const goTo = useCallback(
		(index) => {
			if (isAnimating) return;
			setIsAnimating(true);
			setCurrentIndex(index);
			setTimeout(() => setIsAnimating(false), 300);
		},
		[isAnimating],
	);

	const goNext = useCallback(() => {
		if (images.length <= 1) return;
		goTo((currentIndex + 1) % images.length);
	}, [currentIndex, images.length, goTo]);

	const goPrev = useCallback(() => {
		if (images.length <= 1) return;
		goTo((currentIndex - 1 + images.length) % images.length);
	}, [currentIndex, images.length, goTo]);

	// Keyboard navigation
	useEffect(() => {
		if (!isFullscreen) return;
		const handleKey = (e) => {
			if (e.key === "Escape") setIsFullscreen(false);
			if (e.key === "ArrowRight") goNext();
			if (e.key === "ArrowLeft") goPrev();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [isFullscreen, goNext, goPrev]);

	if (!images || images.length === 0) {
		return (
			<div className="aspect-4/3 bg-first/5 rounded-2xl flex items-center justify-center">
				<div className="text-center">
					<BsCarFront className="w-20 h-20 text-first/10 mx-auto" />
					<p className="text-first/30 text-sm mt-2">Sin imágenes</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Main Image */}
			<div className="relative group">
				<div
					className="aspect-4/3 bg-first/5 rounded-2xl overflow-hidden cursor-pointer relative"
					onClick={() => setIsFullscreen(true)}
				>
					<img
						src={images[currentIndex]}
						alt={`Imagen ${currentIndex + 1}`}
						className={`w-full h-full object-cover transition-opacity duration-300 ${
							isAnimating ? "opacity-50" : "opacity-100"
						}`}
					/>

					{/* Fullscreen hint */}
					<div className="absolute top-3 right-3 bg-black/40 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
						<BsZoomIn className="w-4 h-4" />
					</div>
				</div>

				{/* Nav arrows */}
				{images.length > 1 && (
					<>
						<button
							onClick={(e) => {
								e.stopPropagation();
								goPrev();
							}}
							className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                       bg-black/30 hover:bg-black/50 text-white flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-200
                       hover:scale-110"
							aria-label="Imagen anterior"
						>
							<BsChevronLeft className="w-5 h-5" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								goNext();
							}}
							className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                       bg-black/30 hover:bg-black/50 text-white flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-200
                       hover:scale-110"
							aria-label="Imagen siguiente"
						>
							<BsChevronRight className="w-5 h-5" />
						</button>
					</>
				)}

				{/* Counter */}
				<div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
					{currentIndex + 1} / {images.length}
				</div>
			</div>

			{/* Thumbnails */}
			{images.length > 1 && (
				<div className="flex gap-2 mt-3 overflow-x-auto pb-2">
					{images.map((image, index) => (
						<button
							key={index}
							onClick={() => goTo(index)}
							className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
								index === currentIndex
									? "border-second ring-2 ring-second/20"
									: "border-transparent hover:border-first/30 opacity-60 hover:opacity-100"
							}`}
						>
							<img
								src={image}
								alt={`Miniatura ${index + 1}`}
								className="w-full h-full object-cover"
								loading="lazy"
							/>
						</button>
					))}
				</div>
			)}

			{/* Fullscreen Modal */}
			{isFullscreen && (
				<div
					className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
					onClick={() => setIsFullscreen(false)}
				>
					{/* Close button */}
					<button
						onClick={() => setIsFullscreen(false)}
						className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10
                     hover:bg-white/20 text-white flex items-center justify-center
                     transition-all duration-200"
						aria-label="Cerrar"
					>
						<BsX className="w-6 h-6" />
					</button>

					{/* Counter */}
					<div className="absolute top-4 left-4 z-50 bg-white/10 text-white text-sm px-3 py-1.5 rounded-full">
						{currentIndex + 1} / {images.length}
					</div>

					{/* Image */}
					<div
						className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={images[currentIndex]}
							alt={`Imagen ${currentIndex + 1} a pantalla completa`}
							className="max-w-full max-h-[90vh] object-contain rounded-lg"
						/>
					</div>

					{/* Fullscreen Nav */}
					{images.length > 1 && (
						<>
							<button
								onClick={(e) => {
									e.stopPropagation();
									goPrev();
								}}
								className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                         bg-white/10 hover:bg-white/20 text-white flex items-center justify-center
                         transition-all duration-200 hover:scale-110"
								aria-label="Anterior"
							>
								<BsChevronLeft className="w-6 h-6" />
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									goNext();
								}}
								className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                         bg-white/10 hover:bg-white/20 text-white flex items-center justify-center
                         transition-all duration-200 hover:scale-110"
								aria-label="Siguiente"
							>
								<BsChevronRight className="w-6 h-6" />
							</button>
						</>
					)}
				</div>
			)}
		</>
	);
};

export default ImageGallery;
