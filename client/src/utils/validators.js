/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
export const validateEmail = (email) => {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
};

/**
 * Validar contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
	const errors = [];

	if (password.length < 6) {
		errors.push("La contraseña debe tener al menos 6 caracteres");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};

/**
 * Validar VIN
 * @param {string} vin - VIN a validar
 * @returns {boolean} - True si es válido
 */
export const validateVIN = (vin) => {
	// VIN debe tener 17 caracteres alfanuméricos (excluyendo I, O, Q)
	const regex = /^[A-HJ-NPR-Z0-9]{17}$/;
	return regex.test(vin);
};

/**
 * Validar número de teléfono (formato Costa Rica)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - True si es válido
 */
export const validatePhone = (phone) => {
	if (!phone) return true; // Optional field
	const regex = /^[2-8]\d{3}-?\d{4}$/;
	return regex.test(phone.replace(/\s/g, ""));
};

/**
 * Validar que un número sea positivo
 * @param {number} value - Valor a validar
 * @returns {boolean} - True si es positivo
 */
export const validatePositiveNumber = (value) => {
	return !isNaN(value) && value >= 0;
};

/**
 * Validar rango de año
 * @param {number} year - Año a validar
 * @returns {boolean} - True si es válido
 */
export const validateYear = (year) => {
	const currentYear = new Date().getFullYear();
	return year >= 1900 && year <= currentYear + 1;
};

/**
 * Validar formulario completo
 * @param {Object} values - Valores del formulario
 * @param {Object} rules - Reglas de validación
 * @returns {Object} - { valid: boolean, errors: Object }
 */
export const validateForm = (values, rules) => {
	const errors = {};
	let valid = true;

	for (const [field, rule] of Object.entries(rules)) {
		const value = values[field];

		if (
			rule.required &&
			(!value || (typeof value === "string" && !value.trim()))
		) {
			errors[field] = rule.requiredMessage || `${field} es requerido`;
			valid = false;
			continue;
		}

		if (rule.min !== undefined && value < rule.min) {
			errors[field] = rule.minMessage || `Debe ser mayor o igual a ${rule.min}`;
			valid = false;
			continue;
		}

		if (rule.max !== undefined && value > rule.max) {
			errors[field] = rule.maxMessage || `Debe ser menor o igual a ${rule.max}`;
			valid = false;
			continue;
		}

		if (
			rule.minLength !== undefined &&
			value &&
			value.length < rule.minLength
		) {
			errors[field] =
				rule.minLengthMessage ||
				`Debe tener al menos ${rule.minLength} caracteres`;
			valid = false;
			continue;
		}

		if (
			rule.maxLength !== undefined &&
			value &&
			value.length > rule.maxLength
		) {
			errors[field] =
				rule.maxLengthMessage ||
				`Debe tener máximo ${rule.maxLength} caracteres`;
			valid = false;
			continue;
		}

		if (rule.pattern && value && !rule.pattern.test(value)) {
			errors[field] = rule.patternMessage || "Formato inválido";
			valid = false;
			continue;
		}

		if (rule.custom && !rule.custom(value, values)) {
			errors[field] = rule.customMessage || "Valor inválido";
			valid = false;
			continue;
		}
	}

	return { valid, errors };
};
