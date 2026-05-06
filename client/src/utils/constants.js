// Logistic Status
export const LOGISTIC_STATUSES = {
	IN_TRANSIT: "In transit",
	IN_WAREHOUSE: "In warehouse",
	DEKRA_PENDING: "Dekra pending",
	AVAILABLE_FOR_SALE: "Available for direct sale",
};

export const LOGISTIC_STATUS_OPTIONS = [
	{ value: LOGISTIC_STATUSES.IN_TRANSIT, label: "En camino" },
	{ value: LOGISTIC_STATUSES.IN_WAREHOUSE, label: "En almacén fiscal" },
	{ value: LOGISTIC_STATUSES.DEKRA_PENDING, label: "En Bodega" },
	{
		value: LOGISTIC_STATUSES.AVAILABLE_FOR_SALE,
		label: "Disponible para venta directa",
	},
];

// Availability
export const AVAILABILITY = {
	AVAILABLE: "Available",
	RESERVED: "Reserved",
	UNDER_REPAIR: "Under repair",
	SOLD: "Sold",
};

export const AVAILABILITY_OPTIONS = [
	{ value: AVAILABILITY.AVAILABLE, label: "Disponible" },
	{ value: AVAILABILITY.RESERVED, label: "Reservado" },
	{ value: AVAILABILITY.UNDER_REPAIR, label: "En reparación" },
	{ value: AVAILABILITY.SOLD, label: "Vendido" },
];

// Fuel Types
export const FUEL_TYPES = {
	GASOLINE: "Gasoline",
	DIESEL: "Diesel",
	ELECTRIC: "Electric",
	HYBRID: "Hybrid",
	OTHER: "Other",
};

export const FUEL_TYPE_OPTIONS = [
	{ value: FUEL_TYPES.GASOLINE, label: "Gasolina" },
	{ value: FUEL_TYPES.DIESEL, label: "Diésel" },
	{ value: FUEL_TYPES.ELECTRIC, label: "Eléctrico" },
	{ value: FUEL_TYPES.HYBRID, label: "Híbrido" },
	{ value: FUEL_TYPES.OTHER, label: "Otro" },
];

// Transmission
export const TRANSMISSION = {
	MANUAL: "Manual",
	AUTOMATIC: "Automatic",
};

export const TRANSMISSION_OPTIONS = [
	{ value: TRANSMISSION.MANUAL, label: "Manual" },
	{ value: TRANSMISSION.AUTOMATIC, label: "Automático" },
];

// Drivetrain
export const DRIVETRAIN = {
	FRONT: "Front",
	REAR: "Rear",
	FOURWD: "4x4",
};

export const DRIVETRAIN_OPTIONS = [
	{ value: DRIVETRAIN.FRONT, label: "Delantera" },
	{ value: DRIVETRAIN.REAR, label: "Trasera" },
	{ value: DRIVETRAIN.FOURWD, label: "4x4" },
];

// Body Types
export const BODY_TYPES = {
	SUV: "SUV",
	SEDAN: "Sedan",
	PICKUP: "Pick-up",
	HATCHBACK: "Hatchback",
	COUPE: "Coupe",
	CONVERTIBLE: "Convertible",
	VAN: "Van",
	OTHER: "Other",
};

export const BODY_TYPE_OPTIONS = [
	{ value: BODY_TYPES.SUV, label: "SUV" },
	{ value: BODY_TYPES.SEDAN, label: "Sedán" },
	{ value: BODY_TYPES.PICKUP, label: "Pick-up" },
	{ value: BODY_TYPES.HATCHBACK, label: "Hatchback" },
	{ value: BODY_TYPES.COUPE, label: "Coupé" },
	{ value: BODY_TYPES.CONVERTIBLE, label: "Convertible" },
	{ value: BODY_TYPES.VAN, label: "Van" },
	{ value: BODY_TYPES.OTHER, label: "Otro" },
];

// Ownership
export const OWNERS = {
	MBV: "MBV",
	DAVE: "Dave",
	CLIENT: "Client",
};

export const OWNER_OPTIONS = [
	{ value: OWNERS.MBV, label: "MBV" },
	{ value: OWNERS.DAVE, label: "Dave" },
	{ value: OWNERS.CLIENT, label: "Cliente" },
];

// Expense Types
export const EXPENSE_TYPES = {
	CAR_PURCHASE: "Car purchase",
	INSPECTION: "Inspection",
	TOW_TRUCK: "Tow truck",
	MILEAGE_ADJUSTMENT_USA: "Mileage adjustment in USA",
	MILEAGE_ADJUSTMENT_CR: "Mileage adjustment in CR",
	TAXES: "Taxes",
	WAREHOUSE: "Warehouse",
	VAT: "VAT",
	SELLER_COMMISSION: "Seller commission",
	CAR_REGISTRATION: "Car registration",
	FUEL: "Fuel",
	SPARE_PARTS: "Spare parts",
	REPAIRS: "Repairs",
	SHIPPING_LINE: "Shipping line",
	OTHER_JC_EXPENSES: "Other Juan Carlos expenses",
	OTHER_EXPENSES: "Other expenses",
};

export const EXPENSE_TYPE_OPTIONS = [
	{ value: EXPENSE_TYPES.CAR_PURCHASE, label: "Compra del auto", isJC: true },
	{ value: EXPENSE_TYPES.INSPECTION, label: "Revisión", isJC: true },
	{ value: EXPENSE_TYPES.TOW_TRUCK, label: "Grúa", isJC: true },
	{
		value: EXPENSE_TYPES.MILEAGE_ADJUSTMENT_USA,
		label: "Ajuste de millas en USA",
		isJC: true,
	},
	{
		value: EXPENSE_TYPES.MILEAGE_ADJUSTMENT_CR,
		label: "Ajuste de millas en CR",
		isJC: false,
	},
	{ value: EXPENSE_TYPES.TAXES, label: "Impuestos", isJC: false },
	{ value: EXPENSE_TYPES.WAREHOUSE, label: "Almacén", isJC: false },
	{ value: EXPENSE_TYPES.VAT, label: "IVA", isJC: false },
	{
		value: EXPENSE_TYPES.SELLER_COMMISSION,
		label: "Comisión del vendedor",
		isJC: false,
	},
	{
		value: EXPENSE_TYPES.CAR_REGISTRATION,
		label: "Inscripción del auto",
		isJC: false,
	},
	{ value: EXPENSE_TYPES.FUEL, label: "Combustible", isJC: false },
	{ value: EXPENSE_TYPES.SPARE_PARTS, label: "Repuestos", isJC: false },
	{ value: EXPENSE_TYPES.REPAIRS, label: "Reparaciones", isJC: false },
	{ value: EXPENSE_TYPES.SHIPPING_LINE, label: "Naviera", isJC: false },
	{
		value: EXPENSE_TYPES.OTHER_JC_EXPENSES,
		label: "Otros gastos de Juan Carlos",
		isJC: true,
	},
	{ value: EXPENSE_TYPES.OTHER_EXPENSES, label: "Otros gastos", isJC: false },
];

// Payment Methods
export const PAYMENT_METHODS = [
	{ value: "Transfer", label: "Transferencia" },
	{ value: "Cash", label: "Efectivo" },
	{ value: "Card", label: "Tarjeta" },
	{ value: "Check", label: "Cheque" },
];

// User Roles
export const ROLES = {
	SUPERADMIN: "superadmin",
	ADMIN: "admin",
	CLIENT: "client",
};

export const ROLE_OPTIONS = [
	{ value: ROLES.SUPERADMIN, label: "Superadmin" },
	{ value: ROLES.ADMIN, label: "Admin" },
	{ value: ROLES.CLIENT, label: "Cliente" },
];
