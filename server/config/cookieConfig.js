const isProd = process.env.NODE_ENV === "production";

export const refreshTokenCookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "strict",
	maxAge: 7 * 24 * 60 * 60 * 1000,
	path: "/",
};

export const clearRefreshTokenCookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "strict",
	path: "/",
};
