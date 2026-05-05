/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import toast from "react-hot-toast";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
	const value = {
		toast: {
			success: (message) => toast.success(message),
			error: (message) => toast.error(message),
			warning: (message) => toast(message, { icon: "⚠️" }),
			info: (message) => toast(message, { icon: "ℹ️" }),
		},
	};

	return (
		<ToastContext.Provider value={value}>{children}</ToastContext.Provider>
	);
};

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within ToastProvider");
	return ctx;
};
