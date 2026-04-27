import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Button from "../ui/Button";

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	className = "",
}) => {
	if (totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages = [];
		const maxVisible = 5;

		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		if (start > 1) {
			pages.push(1);
			if (start > 2) pages.push("...");
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) pages.push("...");
			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className={`flex items-center justify-center gap-1 ${className}`}>
			{/* Previous Button */}
			<Button
				variant="ghost"
				size="sm"
				iconOnly
				disabled={currentPage === 1}
				onClick={() => onPageChange(currentPage - 1)}
				icon={<BsChevronLeft className="w-4 h-4" />}
				aria-label="Página anterior"
			/>

			{/* Page Numbers */}
			<div className="flex items-center gap-1">
				{getPageNumbers().map((page, index) =>
					page === "..." ? (
						<span key={`dots-${index}`} className="px-2 text-first/30 text-sm">
							...
						</span>
					) : (
						<Button
							key={page}
							variant={page === currentPage ? "primary" : "ghost"}
							size="sm"
							onClick={() => onPageChange(page)}
							className={`min-w-8 ${
								page === currentPage ? "" : "text-first/60 hover:text-first"
							}`}
						>
							{page}
						</Button>
					),
				)}
			</div>

			{/* Next Button */}
			<Button
				variant="ghost"
				size="sm"
				iconOnly
				disabled={currentPage === totalPages}
				onClick={() => onPageChange(currentPage + 1)}
				icon={<BsChevronRight className="w-4 h-4" />}
				aria-label="Página siguiente"
			/>
		</div>
	);
};

export default Pagination;
