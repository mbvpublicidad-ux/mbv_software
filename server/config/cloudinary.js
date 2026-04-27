import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_KEY,
	api_secret: process.env.CLOUD_SECRET,
	secure: true,
});

export const createSignature = (paramsToSign) => {
	const signature = cloudinary.utils.api_sign_request(
		paramsToSign,
		process.env.CLOUD_SECRET,
	);
	return { signature, timestamp: paramsToSign.timestamp };
};

export const deleteImage = async (publicId) => {
	try {
		const result = await cloudinary.uploader.destroy(publicId);
		return result;
	} catch (error) {
		console.error("Error deleting image from Cloudinary:", error);
		throw error;
	}
};

export const deleteImages = async (urls = []) => {
	if (!urls.length) return;

	const publicIds = urls
		.map((url) => {
			const matches = url.match(/\/v\d+\/(.+?)\./);
			if (matches && matches[1]) {
				return matches[1];
			}
			// Fallback: tomar todo después de upload/
			const parts = url.split("/upload/");
			if (parts.length > 1) {
				const filePart = parts[1].split(".")[0];
				return filePart;
			}
			return null;
		})
		.filter(Boolean);

	await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
};

export const extractPublicId = (imageUrl) => {
	const matches = imageUrl.match(/\/v\d+\/(.+?)\./);
	if (matches && matches[1]) {
		return matches[1];
	}
	const parts = imageUrl.split("/upload/");
	if (parts.length > 1) {
		return parts[1].split(".")[0];
	}
	return null;
};

export const getOptimizedUrl = (publicId, options = {}) => {
	const { width, height, quality = "auto", fetchFormat = "auto" } = options;

	let transformations = `q_${quality},f_${fetchFormat}`;
	if (width) transformations += `,w_${width}`;
	if (height) transformations += `,h_${height}`;

	return cloudinary.url(publicId, {
		transformation: transformations,
		secure: true,
	});
};

export default cloudinary;
