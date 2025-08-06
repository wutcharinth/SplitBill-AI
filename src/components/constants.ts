export const PERSON_COLORS = [
    '#ef4444', // red-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#22c55e', // green-500
    '#6366f1', // indigo-500
    '#ec4899', // pink-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#f59e0b', // amber-500
    '#6b7280', // gray-500
];

export const ALLOWED_CURRENCIES: { [key: string]: string } = {
    'USD': 'United States Dollar',
    'EUR': 'Euro',
    'JPY': 'Japanese Yen',
    'GBP': 'British Pound Sterling',
    'AUD': 'Australian Dollar',
    'CAD': 'Canadian Dollar',
    'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan',
    'SEK': 'Swedish Krona',
    'NZD': 'New Zealand Dollar',
    'MXN': 'Mexican Peso',
    'SGD': 'Singapore Dollar',
    'HKD': 'Hong Kong Dollar',
    'NOK': 'Norwegian Krone',
    'KRW': 'South Korean Won',
    'TRY': 'Turkish Lira',
    'RUB': 'Russian Ruble',
    'INR': 'Indian Rupee',
    'BRL': 'Brazilian Real',
    'ZAR': 'South African Rand',
    'THB': 'Thai Baht',
    'IDR': 'Indonesian Rupiah',
    'VND': 'Vietnamese Dong',
    'MYR': 'Malaysian Ringgit',
    'PHP': 'Philippine Peso',
};

// For mapping a detected country to a default currency
export const COUNTRY_CURRENCY_MAP: { [key: string]: string } = {
    "United States": "USD",
    "Eurozone": "EUR",
    "Japan": "JPY",
    "United Kingdom": "GBP",
    "Australia": "AUD",
    "Canada": "CAD",
    "Switzerland": "CHF",
    "China": "CNY",
    "Sweden": "SEK",
    "New Zealand": "NZD",
    "Mexico": "MXN",
    "Singapore": "SGD",
    "Hong Kong": "HKD",
    "Norway": "NOK",
    "South Korea": "KRW",
    "Turkey": "TRY",
    "Russia": "RUB",
    "India": "INR",
    "Brazil": "BRL",
    "South Africa": "ZAR",
    "Thailand": "THB",
    "Indonesia": "IDR",
    "Vietnam": "VND",
    "Malaysia": "MYR",
    "Philippines": "PHP",
};

export const CURRENCIES: { [key: string]: string } = {
    USD: '$', // US Dollar
    EUR: '€', // Euro
    JPY: '¥', // Japanese Yen
    GBP: '£', // British Pound Sterling
    AUD: 'A$', // Australian Dollar
    CAD: 'C$', // Canadian Dollar
    CHF: 'Fr', // Swiss Franc
    CNY: '¥', // Chinese Yuan
    SEK: 'kr', // Swedish Krona
    NZD: 'NZ$', // New Zealand Dollar
    MXN: '$', // Mexican Peso
    SGD: 'S$', // Singapore Dollar
    HKD: 'HK$', // Hong Kong Dollar
    NOK: 'kr', // Norwegian Krone
    KRW: '₩', // South Korean Won
    TRY: '₺', // Turkish Lira
    RUB: '₽', // Russian Ruble
    INR: '₹', // Indian Rupee
    BRL: 'R$', // Brazilian Real
    ZAR: 'R', // South African Rand
    THB: '฿', // Thai Baht
    IDR: 'Rp', // Indonesian Rupiah
    VND: '₫', // Vietnamese Dong
    MYR: 'RM', // Malaysian Ringgit
    PHP: '₱', // Philippine Peso
};
