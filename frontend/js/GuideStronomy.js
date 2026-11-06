/* ================================================================
   GUIDESTRONOMY — ARQUITECTURA JAVASCRIPT (ES6+ VANILLA)
   Propósito: Guía interactiva de restaurantes poco reconocidos del
   barrio La Independencia, municipio de Itagüí, Antioquia, Colombia.
   Incluye:
     - Búsqueda en vivo y filtros por categoría / rango de precio.
     - Ficha de detalles completos con menú, platos y precios en COP.
     - Botones de contacto directo (llamada y WhatsApp).
     - Sistema de favoritos en LocalStorage.
     - Mapa interactivo con Leaflet (pines, popups interactivos).
     - Formulario de inscripción para comerciantes de La Independencia.
     - Conexión con Backend/API (con respaldo offline automático).
================================================================ */

'use strict';

/* ================================================================
   1. CONFIGURACIÓN Y CONSTANTES
================================================================ */
const API_BASE_URL = window.GUIDESTRONOMY_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : '/api');

const CONFIG = {
    ITEMS_PER_PAGE: 6,
    TOAST_DURATION_MS: 4000,
    SCROLL_HEADER_THRESHOLD: 20,
    STORAGE_KEYS: {
        FAVORITES: 'guidestronomy_itagui_favorites',
        PREFERENCES: 'guidestronomy_itagui_theme'
    },
    // Centro geográfico aproximado del barrio La Independencia, Itagüí, Antioquia
    MAP_CENTER: { lat: 6.1750, lng: -75.6120 },
    MAP_ZOOM: 16,
    // Rutas del backend Node local o de las funciones Vercel.
    API_URL: `${API_BASE_URL}/restaurantes`,
    API_REGISTER_URL: `${API_BASE_URL}/registro`,
    API_NEWSLETTER_URL: `${API_BASE_URL}/newsletter`
};

/* ================================================================
   2. DATOS DE PRUEBA VERIFICADOS (BARRIO LA INDEPENDENCIA, ITAGÜÍ)
   Establecimientos con menús, precios en COP, horarios y contactos
================================================================ */
const SAMPLE_RESTAURANTS = [
    {
        id: 'r001',
        name: 'Fonda Tradicional Doña Rosa',
        category: 'comida-tipica',
        categoryLabel: 'Comida típica',
        specialty: 'Sancocho trifásico en leña',
        address: 'Calle 31 con Carrera 57, Barrio La Independencia, Itagüí',
        phone: '+57 311 450 1234',
        whatsapp: '573114501234',
        rating: 4.8,
        reviews: 215,
        priceRange: 2,
        hours: '11:30 a.m. – 4:30 p.m. (Martes a Domingo)',
        isOpen: true,
        distanceKm: 0.2,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
        badges: ['popular', 'verified', 'gem'],
        popularity: 95,
        createdAt: '2025-01-15',
        lat: 6.1755,
        lng: -75.6118,
        description: 'Fonda familiar con más de 24 años de tradición en La Independencia. Sus preparaciones a fuego lento conservan la sazón de las abuelas antioqueñas en platos abundantes y caseros.',
        menu: [
            { name: 'Sancocho Trifásico Tradicional', desc: 'Res, cerdo y gallina campesina con yuca, plátano, papa, arroz blanco y aguacate.', price: 24000, isSpecialty: true },
            { name: 'Bandeja Paisa de la Casa', desc: 'Frijoles con garra, arroz, chicharrón crocante de 5 patas, carne molida, huevo, tajada y arepa.', price: 26000, isSpecialty: false },
            { name: 'Cazuela de Frijoles Montañera', desc: 'Frijol cargamanto con maíz tierno, maduritos en dados, chicharrón y ripio de papa.', price: 20000, isSpecialty: false },
            { name: 'Mazamorra con Bocadillo o Panela', desc: 'Maíz tierno cocido en leche fresca con dulce tradicional.', price: 6000, isSpecialty: false }
        ]
    },
    {
        id: 'r002',
        name: 'Café & Tertulia El Encuentro',
        category: 'cafe',
        categoryLabel: 'Cafetería',
        specialty: 'Café filtrado de origen y tostada francesa',
        address: 'Carrera 58 # 31-40, Barrio La Independencia, Itagüí',
        phone: '+57 301 234 8976',
        whatsapp: '573012348976',
        rating: 4.7,
        reviews: 142,
        priceRange: 1,
        hours: '7:30 a.m. – 7:30 p.m. (Lunes a Sábado)',
        isOpen: true,
        distanceKm: 0.3,
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=80',
        badges: ['verified'],
        popularity: 88,
        createdAt: '2025-02-10',
        lat: 6.1748,
        lng: -75.6125,
        description: 'Un rincón tranquilo para disfrutar de café cosechado en el suroeste antioqueño, métodos de filtrado manual y repostería artesanal horneada cada mañana.',
        menu: [
            { name: 'Capuchino Artesanal', desc: 'Espresso doble con leche texturizada y toque de canela silvestre.', price: 7500, isSpecialty: false },
            { name: 'Café Prensa Francesa (Para dos)', desc: 'Café de origen con notas achocolatadas y florales.', price: 11000, isSpecialty: true },
            { name: 'Tostada Francesa con Miel de Flores', desc: 'Pan brioche artesanal con frutas de temporada y queso campesino.', price: 13000, isSpecialty: true },
            { name: 'Tarta de Queso y Maracuyá', desc: 'Porción individual con base de galleta y coulis natural.', price: 8500, isSpecialty: false }
        ]
    },
    {
        id: 'r003',
        name: 'Panadería y Repostería El Portal del Trigo',
        category: 'panaderia',
        categoryLabel: 'Panadería',
        specialty: 'Pandequeso caliente y buñuelos rellenos',
        address: 'Carrera 58 # 32-15, Barrio La Independencia, Itagüí',
        phone: '+57 314 567 4321',
        whatsapp: '573145674321',
        rating: 4.6,
        reviews: 189,
        priceRange: 1,
        hours: '5:30 a.m. – 8:30 p.m. (Todos los días)',
        isOpen: true,
        distanceKm: 0.1,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
        badges: ['gem'],
        popularity: 82,
        createdAt: '2024-11-20',
        lat: 6.1742,
        lng: -75.6112,
        description: 'El aroma a pan recién horneado de cada madrugada. Punto de encuentro predilecto de los vecinos de La Independencia para el desayuno y el algo.',
        menu: [
            { name: 'Pandequeso Tradicional al Horno', desc: 'Masa de maíz y queso costeño horneada en el punto exacto.', price: 3500, isSpecialty: true },
            { name: 'Buñuelo Gigante con Arequipe', desc: 'Crocante por fuera y esponjoso por dentro con relleno dulce.', price: 4000, isSpecialty: false },
            { name: 'Desayuno Calentado con Huevo y Arepa', desc: 'Arroz con frijoles del día anterior, huevos al gusto y arepa de tela con quesito.', price: 12500, isSpecialty: true },
            { name: 'Pastel de Pollo con Champiñones', desc: 'Hojaldre crocante relleno de pechuga desmechada en bechamel.', price: 5500, isSpecialty: false }
        ]
    },
    {
        id: 'r004',
        name: 'Hamburguesas Urbanas La 58',
        category: 'hamburguesas',
        categoryLabel: 'Hamburguesas',
        specialty: 'Hamburguesa La Independiente con tocineta caramelizada',
        address: 'Calle 32 # 58-10, Barrio La Independencia, Itagüí',
        phone: '+57 319 876 5432',
        whatsapp: '573198765432',
        rating: 4.9,
        reviews: 260,
        priceRange: 2,
        hours: '4:30 p.m. – 11:00 p.m. (Miércoles a Lunes)',
        isOpen: true,
        distanceKm: 0.4,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
        badges: ['popular', 'verified'],
        popularity: 96,
        createdAt: '2025-03-01',
        lat: 6.1762,
        lng: -75.6128,
        description: 'Emprendimiento local de jóvenes itagüiseños. Carne 100% de res molida a diario, pan de papa artesanal y salsas de la casa sin conservantes.',
        menu: [
            { name: 'Hamburguesa La Independiente (180g)', desc: 'Carne madurada, queso cheddar fundido, tocineta en reducción de panela y cebolla crispy.', price: 23000, isSpecialty: true },
            { name: 'Hamburguesa Criolla', desc: 'Carne de res, plátano maduro asado, queso costeño asado a la plancha y chimichurri.', price: 22000, isSpecialty: false },
            { name: 'Papas Rústicas de la Casa', desc: 'Papas en cascos con paprika, sal marina, salsa tártara y queso rallado.', price: 9500, isSpecialty: false }
        ]
    },
    {
        id: 'r005',
        name: 'Pizzería & Trattoria de Barrio',
        category: 'pizza',
        categoryLabel: 'Pizza',
        specialty: 'Pizza rústica de masa madre en horno de piedra',
        address: 'Carrera 57 # 30B-18, Barrio La Independencia, Itagüí',
        phone: '+57 302 987 1122',
        whatsapp: '573029871122',
        rating: 4.7,
        reviews: 178,
        priceRange: 2,
        hours: '3:00 p.m. – 10:30 p.m. (Martes a Domingo)',
        isOpen: true,
        distanceKm: 0.3,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
        badges: ['verified'],
        popularity: 89,
        createdAt: '2025-01-28',
        lat: 6.1735,
        lng: -75.6130,
        description: 'Pizzas elaboradas con fermentación lenta de 48 horas, salsa de tomates San Marzano y quesos de la región. Crujientes, ligeras y con ingredientes frescos.',
        menu: [
            { name: 'Pizza Serrana Especial (Mediana)', desc: 'Mozzarella, jamón serrano, rúgula fresca, parmesano y reducción balsámica.', price: 34000, isSpecialty: true },
            { name: 'Pizza Paisa Rústica', desc: 'Mozzarella, tocineta ahumada, maíz dulce tierno y dados de plátano maduro.', price: 30000, isSpecialty: false },
            { name: 'Calzone de Tres Quesos y Champiñones', desc: 'Mozzarella, provolone, queso crema y champiñones salteados.', price: 21000, isSpecialty: false }
        ]
    },
    {
        id: 'r006',
        name: 'Asados y Parrilla Donde Carlos',
        category: 'parrilla',
        categoryLabel: 'Asados y Parrilla',
        specialty: 'Churrasco a la brasa y picada familiar',
        address: 'Calle 30A # 56-20, Barrio La Independencia, Itagüí',
        phone: '+57 315 678 9012',
        whatsapp: '573156789012',
        rating: 4.8,
        reviews: 240,
        priceRange: 3,
        hours: '12:00 m. – 9:30 p.m. (Jueves a Domingo)',
        isOpen: false,
        distanceKm: 0.5,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80',
        badges: ['popular', 'gem'],
        popularity: 91,
        createdAt: '2024-10-14',
        lat: 6.1768,
        lng: -75.6105,
        description: 'El asadero tradicional de los fines de semana en La Independencia. Cortes frescos preparados al carbón vegetal con chimichurri casero y arepa redonda con mantequilla.',
        menu: [
            { name: 'Picada Mixta Familiar (Para 3-4 personas)', desc: 'Churrasco, costilla ahumada, morcilla envigadeña, chunchurria, papa criolla y arepas.', price: 58000, isSpecialty: true },
            { name: 'Churrasco Argentino (350g)', desc: 'Corte grueso a la brasa con papas francesas, ensalada fresca y chimichurri.', price: 32000, isSpecialty: true },
            { name: 'Costillitas BBQ de Cerdo', desc: 'Costilla tierna horneada y glaseada en salsa BBQ artesanal con toques de miel.', price: 28000, isSpecialty: false }
        ]
    },
    {
        id: 'r007',
        name: 'Comidas Rápidas El Punto Criollo',
        category: 'comida-rapida',
        categoryLabel: 'Comida rápida',
        specialty: 'Chuzo desgranado y perro caliente especial',
        address: 'Carrera 57 # 32-05, Barrio La Independencia, Itagüí',
        phone: '+57 312 345 6789',
        whatsapp: '573123456789',
        rating: 4.5,
        reviews: 130,
        priceRange: 1,
        hours: '5:00 p.m. – 12:00 a.m. (Todos los días)',
        isOpen: true,
        distanceKm: 0.2,
        image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=700&q=80',
        badges: ['new'],
        popularity: 76,
        createdAt: '2025-04-10',
        lat: 6.1758,
        lng: -75.6115,
        description: 'Comidas rápidas abundantes para terminar la noche. Famoso en el barrio por su chuzo desgranado gratinado y sus porciones generosas.',
        menu: [
            { name: 'Chuzo Desgranado Mixto', desc: 'Carne de res y pechuga de pollo, maíz tierno, tocineta, papa ripio y doble queso mozzarella fundido.', price: 19500, isSpecialty: true },
            { name: 'Perro Caliente Super Criollo', desc: 'Salchicha americana, tocineta, queso gratinado, cebolla caramelizada, papas fosforito y salsas.', price: 14000, isSpecialty: false },
            { name: 'Salchipapa Salvaje', desc: 'Papas a la francesa, salchicha manguera, tocineta, queso costeño rallado y huevo frito.', price: 16500, isSpecialty: false }
        ]
    },
    {
        id: 'r008',
        name: 'Arepas de Choclo y Quesito Doña Luz',
        category: 'desayunos',
        categoryLabel: 'Desayunos',
        specialty: 'Arepa de choclo con doble quesito fresco',
        address: 'Calle 31A # 58-30, Barrio La Independencia, Itagüí',
        phone: '+57 304 567 8901',
        whatsapp: '573045678901',
        rating: 4.9,
        reviews: 198,
        priceRange: 1,
        hours: '6:00 a.m. – 11:30 a.m. y 4:00 p.m. – 9:00 p.m.',
        isOpen: true,
        distanceKm: 0.1,
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80',
        badges: ['popular', 'gem', 'verified'],
        popularity: 94,
        createdAt: '2024-09-05',
        lat: 6.1746,
        lng: -75.6121,
        description: 'Puesto tradicional con mesa y asador en la acera. Maíz tierno desgranado in situ y molido cada día con la receta secreta de Doña Luz.',
        menu: [
            { name: 'Arepa de Choclo con Quesito Tradicional', desc: 'Arepa dulce de choclo recién asada con tajada gruesa de quesito fresco de Santa Rosa.', price: 6500, isSpecialty: true },
            { name: 'Arepa de Choclo Rellena de Queso y Quesito', desc: 'Doble porción de queso derretido en su interior.', price: 8500, isSpecialty: false },
            { name: 'Chocolate Caliente en Leche con Clavos y Canela', desc: 'Batido con molinillo artesanal servido espumoso en taza de peltre.', price: 3500, isSpecialty: false }
        ]
    },
    {
        id: 'r009',
        name: 'Repostería y Helados Dulce Antojo',
        category: 'postres',
        categoryLabel: 'Postres y Helados',
        specialty: 'Postre de tres leches y copas de helado artesanal',
        address: 'Carrera 58 # 31-12, Barrio La Independencia, Itagüí',
        phone: '+57 318 901 2345',
        whatsapp: '573189012345',
        rating: 4.6,
        reviews: 110,
        priceRange: 1,
        hours: '1:00 p.m. – 9:30 p.m. (Martes a Domingo)',
        isOpen: true,
        distanceKm: 0.3,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80',
        badges: ['verified'],
        popularity: 81,
        createdAt: '2025-02-18',
        lat: 6.1752,
        lng: -75.6124,
        description: 'Espacio familiar pensado para consentirse con postres caseros, helados cremosos artesanales y malteadas cargadas de sabor.',
        menu: [
            { name: 'Tres Leches Artesanal de la Abuela', desc: 'Bizcocho bañado en tres leches con canela y crema chantilly.', price: 8000, isSpecialty: true },
            { name: 'Copa de Helado Suprema', desc: 'Tres bolas de helado artesanal, barquillos, fresas frescas y salsa de chocolate.', price: 12000, isSpecialty: false },
            { name: 'Waffle con Frutas y Helado', desc: 'Waffle recién horneado con banano, fresas, helado de vainilla y arequipe.', price: 14500, isSpecialty: false }
        ]
    },
    {
        id: 'r010',
        name: 'Cocina Verde & Saludable La Independencia',
        category: 'vegetariana',
        categoryLabel: 'Saludable / Veggie',
        specialty: 'Almuerzos caseros vegetarianos y bowls nutritivos',
        address: 'Calle 32A # 57-45, Barrio La Independencia, Itagüí',
        phone: '+57 316 789 0123',
        whatsapp: '573167890123',
        rating: 4.7,
        reviews: 87,
        priceRange: 2,
        hours: '11:00 a.m. – 4:00 p.m. (Lunes a Sábado)',
        isOpen: true,
        distanceKm: 0.4,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
        badges: ['new', 'verified'],
        popularity: 79,
        createdAt: '2025-03-15',
        lat: 6.1760,
        lng: -75.6110,
        description: 'Propuesta gastronómica enfocada en comida saludable, opciones vegetarianas balanceadas y jugos naturales prensados en frío.',
        menu: [
            { name: 'Almuerzo Saludable del Día', desc: 'Sopa de verduras campesinas, hamburguesa de lentejas, ensalada arcoíris y arroz integral.', price: 17000, isSpecialty: true },
            { name: 'Bowl de Quinua, Champiñones y Aguacate', desc: 'Base de quinua tibia con vegetales salteados, semillas de girasol y aderezo tahini.', price: 19000, isSpecialty: false },
            { name: 'Jugo Prensado Verde Detox', desc: 'Manzana verde, espinaca, apio, pepino y jengibre fresco.', price: 7000, isSpecialty: false }
        ]
    }
];

/* ================================================================
   3. REFERENCIAS AL DOM
================================================================ */
const DOM = {
    header: document.getElementById('site-header'),
    navToggle: document.getElementById('nav-toggle'),
    mainNav: document.getElementById('main-nav'),
    navMenu: document.getElementById('nav-menu'),
    navLinks: document.querySelectorAll('[data-nav-link]'),

    themeToggle: document.getElementById('theme-toggle'),
    searchToggle: document.getElementById('search-toggle'),

    favoritesToggle: document.getElementById('favorites-toggle'),
    favoritesCounter: document.getElementById('favorites-counter'),

    mainSearchForm: document.getElementById('main-search-form'),
    searchQueryInput: document.getElementById('search-query'),
    searchPriceSelect: document.getElementById('search-price'),

    categoryFilterBar: document.getElementById('categorias'),
    resultsCountNumber: document.getElementById('results-count-number'),
    sortSelect: document.getElementById('sort-select'),
    restaurantGrid: document.getElementById('restaurant-grid'),
    topMonthGrid: document.getElementById('top-month-grid'),
    emptyState: document.getElementById('empty-state'),
    loadMoreButton: document.getElementById('load-more-button'),
    loadMoreZone: document.getElementById('load-more-zone'),
    loadingIndicator: document.getElementById('loading-indicator'),

    mapMount: document.getElementById('leaflet-map'),

    newsletterForm: document.getElementById('newsletter-form'),
    notificationContainer: document.getElementById('notification-container'),
    currentYear: document.getElementById('current-year'),

    // Modales
    modalDetail: document.getElementById('modal-restaurant-detail'),
    modalFavorites: document.getElementById('modal-favorites'),
    modalRegister: document.getElementById('modal-register-business'),
    businessRegistrationForm: document.getElementById('business-registration-form'),
    favoritesListContainer: document.getElementById('favorites-list-container')
};

/* ================================================================
   4. ESTADO DE LA APLICACIÓN
================================================================ */
const AppState = {
    status: 'idle', // idle | loading | ready | error
    allRestaurants: [],
    filteredRestaurants: [],
    activeFilters: {
        query: '',
        category: '',
        priceRange: ''
    },
    activeSort: 'relevancia',
    currentPage: 1,
    favorites: [],
    currentDetailId: null
};

/* ================================================================
   5. UTILIDADES
================================================================ */
const Utils = {
    formatPriceRange(level) {
        const levels = {
            1: '$ Económico (< $15.000)',
            2: '$$ Moderado ($15k - $30k)',
            3: '$$$ Especial ($30k - $50k)',
            4: '$$$$ Premium (> $50k)'
        };
        return levels[level] || '$$ Moderado';
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatStars(rating) {
        const rounded = Math.round(rating);
        return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
    },

    formatDistance(km) {
        if (km == null) return 'La Independencia';
        return km < 1 ? `${Math.round(km * 1000)} m de ti` : `${km.toFixed(1)} km`;
    },

    debounce(callback, delay = 250) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback(...args), delay);
        };
    },

    escapeHtml(text = '') {
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
};

/* ================================================================
   6. SERVICIO DE DATOS (API BACKEND CON FALLBACK AUTOMÁTICO)
================================================================ */
const DataService = {
    async loadRestaurants() {
        AppState.status = 'loading';
        try {
            // Intentar conectar con el backend; conservar datos de ejemplo si está fuera de línea.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            let response;
            try {
                response = await fetch(CONFIG.API_URL, { signal: controller.signal });
            } finally {
                clearTimeout(timeoutId);
            }

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    AppState.allRestaurants = data;
                } else {
                    console.warn('La API devolvió un formato inesperado; se muestran los datos de ejemplo.');
                    AppState.allRestaurants = SAMPLE_RESTAURANTS;
                }
            } else {
                console.warn(`La API respondió ${response.status}; se muestran datos de ejemplo.`);
                AppState.allRestaurants = SAMPLE_RESTAURANTS;
            }

            AppState.status = 'ready';
            AppState.filteredRestaurants = [...AppState.allRestaurants];
        } catch (error) {
            console.warn('Guidestronomy ejecutando en modo local:', error);
            AppState.status = 'ready';
            AppState.allRestaurants = SAMPLE_RESTAURANTS;
            AppState.filteredRestaurants = [...SAMPLE_RESTAURANTS];
        }
    }
};

/* ================================================================
   7. SISTEMA DE NOTIFICACIONES (TOASTS)
================================================================ */
const NotificationSystem = {
    show(message, type = 'info') {
        if (!DOM.notificationContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.dataset.type = type;
        toast.setAttribute('role', 'status');
        toast.textContent = message;

        DOM.notificationContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('is-leaving');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, CONFIG.TOAST_DURATION_MS);
    }
};

/* ================================================================
   8. LOCALSTORAGE (FAVORITOS Y TEMA)
================================================================ */
const StorageService = {
    loadFavorites() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Error al cargar favoritos:', e);
            return [];
        }
    },

    saveFavorites(favorites) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        } catch (e) {
            console.error('Error al guardar favoritos:', e);
        }
    },

    toggleFavorite(restaurantId) {
        const index = AppState.favorites.indexOf(restaurantId);
        const restaurant = AppState.allRestaurants.find(r => r.id === restaurantId);
        const name = restaurant ? restaurant.name : 'Restaurante';

        if (index === -1) {
            AppState.favorites.push(restaurantId);
            NotificationSystem.show(`«${name}» agregado a tus favoritos.`, 'success');
        } else {
            AppState.favorites.splice(index, 1);
            NotificationSystem.show(`«${name}» eliminado de favoritos.`, 'info');
        }

        this.saveFavorites(AppState.favorites);
        UIState.updateFavoritesCounter();
        UIState.syncFavoriteButtons();
        ModalSystem.syncModalFavoriteButton();
    },

    loadTheme() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.PREFERENCES) || 'light';
        } catch (e) {
            return 'light';
        }
    },

    saveTheme(theme) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.PREFERENCES, theme);
        } catch (e) {
            console.error('Error al guardar tema:', e);
        }
    }
};

/* ================================================================
   9. RENDERIZADO DE TARJETAS
================================================================ */
const CardRenderer = {
    buildBadgesMarkup(badges = []) {
        const labels = {
            popular: 'Popular en Itagüí',
            verified: 'Verificado',
            new: 'Nuevo',
            gem: 'Joya Oculta'
        };
        return badges.map(key => `<span class="badge badge-${key}">${labels[key] || key}</span>`).join('');
    },

    buildCard(restaurant) {
        const isFavorite = AppState.favorites.includes(restaurant.id);
        const statusClass = restaurant.isOpen ? 'status-open' : 'status-closed';
        const statusLabel = restaurant.isOpen ? 'Abierto' : 'Cerrado';
        const priceLabel = '$'.repeat(restaurant.priceRange || 2);

        return `
            <article class="restaurant-card" data-restaurant-id="${restaurant.id}">
                <div class="card-image-wrapper">
                    <img src="${restaurant.image}" alt="Plato de ${Utils.escapeHtml(restaurant.name)}" class="card-image" loading="lazy">
                    <div class="card-badges">${this.buildBadgesMarkup(restaurant.badges)}</div>
                    <button type="button" class="favorite-toggle" data-action="toggle-favorite" data-restaurant-id="${restaurant.id}" aria-label="${isFavorite ? 'Quitar de' : 'Agregar a'} favoritos" aria-pressed="${isFavorite}">
                        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2 4.5 5.6 4C8 3.6 10 5 12 7c2-2 4-3.4 6.4-3C22 4.5 23.6 8.1 22 11.7C19.5 16.4 12 21 12 21z" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="card-content">
                    <div class="card-heading-row">
                        <h3 class="card-title">${Utils.escapeHtml(restaurant.name)}</h3>
                        <span class="status-pill ${statusClass}">${statusLabel}</span>
                    </div>
                    <p class="card-meta">📍 ${Utils.escapeHtml(restaurant.address)}</p>
                    <p class="card-meta">Especialidad: <strong>${Utils.escapeHtml(restaurant.specialty)}</strong></p>

                    <div class="card-rating" aria-label="Calificación ${restaurant.rating} de 5">
                        <span class="stars" aria-hidden="true">${Utils.formatStars(restaurant.rating)}</span>
                        <span class="rating-number">${restaurant.rating}</span>
                        <span class="reviews-count">(${restaurant.reviews} opiniones)</span>
                    </div>

                    <div class="card-details-row">
                        <span class="price-range" title="${Utils.formatPriceRange(restaurant.priceRange)}">${priceLabel}</span>
                        <span>🕒 ${Utils.escapeHtml(restaurant.hours)}</span>
                        <span>🚶 ${Utils.formatDistance(restaurant.distanceKm)}</span>
                    </div>

                    <div class="card-actions">
                        <button type="button" class="button button-primary button-small" data-action="view-details" data-restaurant-id="${restaurant.id}">
                            Ver Menú y Detalles
                        </button>
                        <button type="button" class="button button-secondary button-small" data-action="toggle-favorite" data-restaurant-id="${restaurant.id}">
                            ${isFavorite ? '♥ Guardado' : '♡ Favorito'}
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    buildRankingItem(restaurant, position) {
        return `
            <li class="ranking-item">
                <span class="ranking-position" aria-hidden="true">#${position}</span>
                <img src="${restaurant.image}" alt="" class="ranking-image" loading="lazy">
                <div class="ranking-info">
                    <h3 class="ranking-name">${Utils.escapeHtml(restaurant.name)}</h3>
                    <p class="ranking-meta">${Utils.escapeHtml(restaurant.specialty)} · ${Utils.escapeHtml(restaurant.categoryLabel)}</p>
                    <button type="button" class="button button-secondary button-small" style="margin-top: 6px; padding: 2px 10px; font-size: 11px;" data-action="view-details" data-restaurant-id="${restaurant.id}">Ver detalles</button>
                </div>
                <div class="ranking-rating">
                    <span class="stars">${Utils.formatStars(restaurant.rating)}</span>
                    <strong>${restaurant.rating} / 5.0</strong>
                </div>
            </li>
        `;
    }
};

/* ================================================================
   10. SISTEMA DE BÚSQUEDA Y FILTROS
================================================================ */
const FilterEngine = {
    matches(restaurant, filters) {
        const query = filters.query.trim().toLowerCase();
        const matchesQuery = !query ||
            restaurant.name.toLowerCase().includes(query) ||
            restaurant.specialty.toLowerCase().includes(query) ||
            (restaurant.description && restaurant.description.toLowerCase().includes(query)) ||
            (restaurant.menu && restaurant.menu.some(m => m.name.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query)));

        const matchesCategory = !filters.category || restaurant.category === filters.category;
        const matchesPrice = !filters.priceRange || String(restaurant.priceRange) === String(filters.priceRange);

        return matchesQuery && matchesCategory && matchesPrice;
    },

    applyFilters() {
        AppState.filteredRestaurants = AppState.allRestaurants.filter(r => this.matches(r, AppState.activeFilters));
        SortEngine.applySort();
        AppState.currentPage = 1;
        UIState.renderResults();
        MapSystem.renderMarkers(AppState.filteredRestaurants);
    },

    setFilter(key, value) {
        AppState.activeFilters[key] = value;
        this.applyFilters();
    },

    resetFilters() {
        AppState.activeFilters = { query: '', category: '', priceRange: '' };
        if (DOM.searchQueryInput) DOM.searchQueryInput.value = '';
        if (DOM.searchPriceSelect) DOM.searchPriceSelect.value = '';
        CategorySystem.setActiveChip('');
        this.applyFilters();
        NotificationSystem.show('Filtros restablecidos.', 'info');
    }
};

/* ================================================================
   11. SISTEMA DE ORDENAMIENTO
================================================================ */
const SortEngine = {
    comparators: {
        relevancia: (a, b) => (b.popularity || 0) - (a.popularity || 0),
        calificacion: (a, b) => b.rating - a.rating,
        resenas: (a, b) => b.reviews - a.reviews,
        'precio-asc': (a, b) => a.priceRange - b.priceRange,
        'precio-desc': (a, b) => b.priceRange - a.priceRange,
        nombre: (a, b) => a.name.localeCompare(b.name)
    },

    applySort() {
        const comparator = this.comparators[AppState.activeSort] || this.comparators.relevancia;
        AppState.filteredRestaurants = [...AppState.filteredRestaurants].sort(comparator);
    },

    setSort(sortKey) {
        AppState.activeSort = sortKey;
        this.applySort();
        AppState.currentPage = 1;
        UIState.renderResults();
    }
};

/* ================================================================
   12. PAGINACIÓN Y CARGA PROGRESIVA
================================================================ */
const PaginationEngine = {
    getVisibleSlice() {
        const end = AppState.currentPage * CONFIG.ITEMS_PER_PAGE;
        return AppState.filteredRestaurants.slice(0, end);
    },

    hasMore() {
        return AppState.filteredRestaurants.length > AppState.currentPage * CONFIG.ITEMS_PER_PAGE;
    },

    loadNext() {
        if (!this.hasMore()) return;
        DOM.loadingIndicator.hidden = false;
        setTimeout(() => {
            AppState.currentPage += 1;
            UIState.renderResults();
            DOM.loadingIndicator.hidden = true;
        }, 200);
    }
};

/* ================================================================
   13. SISTEMA DE CHIPS DE CATEGORÍA
================================================================ */
const CategorySystem = {
    getChips() {
        return DOM.categoryFilterBar ? DOM.categoryFilterBar.querySelectorAll('.category-chip') : [];
    },

    setActiveChip(category) {
        this.getChips().forEach(chip => {
            chip.setAttribute('aria-pressed', String((chip.dataset.category || '') === category));
        });
    },

    handleChipClick(chip) {
        const category = chip.dataset.category || '';
        this.setActiveChip(category);
        FilterEngine.setFilter('category', category);
    },

    bindEvents() {
        if (!DOM.categoryFilterBar) return;
        DOM.categoryFilterBar.addEventListener('click', (e) => {
            const chip = e.target.closest('.category-chip');
            if (chip) this.handleChipClick(chip);
        });
    }
};

/* ================================================================
   14. MAPA INTERACTIVO (LEAFLET EN LA INDEPENDENCIA, ITAGÜÍ)
================================================================ */
const MapSystem = {
    instance: null,
    markers: [],

    init(restaurants) {
        if (typeof L === 'undefined' || !DOM.mapMount) return;

        try {
            this.instance = L.map(DOM.mapMount, {
                scrollWheelZoom: false
            }).setView([CONFIG.MAP_CENTER.lat, CONFIG.MAP_CENTER.lng], CONFIG.MAP_ZOOM);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap · Guidestronomy Itagüí',
                maxZoom: 19
            }).addTo(this.instance);

            this.instance.on('click', () => this.instance.scrollWheelZoom.enable());

            this.renderMarkers(restaurants);
            setTimeout(() => this.instance.invalidateSize(), 300);
        } catch (e) {
            console.error('Error inicializando mapa:', e);
        }
    },

    renderMarkers(restaurants) {
        if (!this.instance) return;

        this.markers.forEach(m => this.instance.removeLayer(m));
        this.markers = [];

        restaurants.forEach(r => {
            if (typeof r.lat !== 'number' || typeof r.lng !== 'number') return;

            const marker = L.marker([r.lat, r.lng]).addTo(this.instance);

            const popupHtml = `
                <div style="font-family: inherit; font-size: 13px; min-width: 190px;">
                    <strong style="color: #1B4332; font-size: 14px;">${Utils.escapeHtml(r.name)}</strong>
                    <div style="color: #B3801F; font-size: 12px; margin-block: 2px;">★ ${r.rating} · ${r.isOpen ? '<span style="color:green;">Abierto</span>' : '<span style="color:red;">Cerrado</span>'}</div>
                    <p style="margin: 3px 0; color: #555;">${Utils.escapeHtml(r.specialty)}</p>
                    <p style="font-size: 11px; color: #777;">${Utils.escapeHtml(r.address)}</p>
                    <button type="button" style="margin-top: 6px; background: #2D6A4F; color: #fff; padding: 4px 10px; border-radius: 999px; border:none; cursor:pointer; font-size: 12px; font-weight:600; width: 100%;" onclick="ModalSystem.openDetailModal('${r.id}')">
                        Ver Menú y Teléfono
                    </button>
                </div>
            `;
            marker.bindPopup(popupHtml);
            this.markers.push(marker);
        });
    }
};

/* ================================================================
   15. SISTEMA DE MODALES (DETALLES, MENÚ, FAVORITOS, REGISTRO)
================================================================ */
const ModalSystem = {
    openModal(modalElement) {
        if (!modalElement) return;
        modalElement.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    },

    closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.style.overflow = '';
        AppState.currentDetailId = null;
    },

    openDetailModal(restaurantId) {
        const restaurant = AppState.allRestaurants.find(r => r.id === restaurantId);
        if (!restaurant) return;

        AppState.currentDetailId = restaurantId;

        // Asignar textos
        document.getElementById('modal-detail-title').textContent = restaurant.name;
        document.getElementById('modal-detail-category').textContent = restaurant.categoryLabel || restaurant.category;
        document.getElementById('modal-detail-image').src = restaurant.image;
        document.getElementById('modal-detail-image').alt = restaurant.name;

        const statusEl = document.getElementById('modal-detail-status');
        statusEl.className = `status-pill ${restaurant.isOpen ? 'status-open' : 'status-closed'}`;
        statusEl.textContent = restaurant.isOpen ? 'Abierto ahora' : 'Cerrado actualmente';

        document.getElementById('modal-detail-rating').textContent = `★ ${restaurant.rating} (${restaurant.reviews} reseñas de clientes)`;
        document.getElementById('modal-detail-price').textContent = Utils.formatPriceRange(restaurant.priceRange);
        document.getElementById('modal-detail-specialty').textContent = restaurant.specialty;
        document.getElementById('modal-detail-description').textContent = restaurant.description;
        document.getElementById('modal-detail-address').textContent = restaurant.address;
        document.getElementById('modal-detail-hours').textContent = restaurant.hours;
        document.getElementById('modal-detail-phone').textContent = restaurant.phone;

        // Botones de llamada y WhatsApp
        const btnCall = document.getElementById('modal-btn-call');
        btnCall.href = `tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`;

        const btnWhatsapp = document.getElementById('modal-btn-whatsapp');
        const defaultMsg = encodeURIComponent(`Hola ${restaurant.name}, los encontré a través de Guidestronomy La Independencia y quisiera consultar sobre su menú.`);
        btnWhatsapp.href = `https://wa.me/${restaurant.whatsapp || '573000000000'}?text=${defaultMsg}`;

        // Menú con platos y precios
        const menuContainer = document.getElementById('modal-detail-menu-grid');
        if (restaurant.menu && restaurant.menu.length > 0) {
            menuContainer.innerHTML = restaurant.menu.map(item => `
                <div class="menu-item-card">
                    <div class="menu-item-header">
                        <span class="menu-item-title">${Utils.escapeHtml(item.name)}</span>
                        <span class="menu-item-price">${Utils.formatCurrency(item.price)}</span>
                    </div>
                    <p class="menu-item-desc">${Utils.escapeHtml(item.desc)}</p>
                    ${item.isSpecialty ? '<span class="menu-item-tag">★ Recomendación de la Casa</span>' : ''}
                </div>
            `).join('');
        } else {
            menuContainer.innerHTML = '<p style="font-size: 13px; color: #888;">El menú completo está disponible directamente por WhatsApp o llamada telefónica.</p>';
        }

        this.syncModalFavoriteButton();
        this.openModal(DOM.modalDetail);
    },

    syncModalFavoriteButton() {
        const favBtn = document.getElementById('modal-detail-fav-btn');
        if (!favBtn || !AppState.currentDetailId) return;

        const isFav = AppState.favorites.includes(AppState.currentDetailId);
        favBtn.textContent = isFav ? '♥ Quitar de Favoritos' : '♡ Guardar en Favoritos';
        favBtn.className = isFav ? 'button button-primary' : 'button button-secondary';
    },

    openFavoritesModal() {
        if (!DOM.favoritesListContainer) return;

        const favRestaurants = AppState.allRestaurants.filter(r => AppState.favorites.includes(r.id));

        if (favRestaurants.length === 0) {
            DOM.favoritesListContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem 1rem;">
                    <p style="font-size: 2rem;">♡</p>
                    <p style="font-weight: 600; margin-top: 6px;">Aún no tienes favoritos guardados</p>
                    <p style="font-size: 13px; color: #888; margin-top: 4px;">Guarda los restaurantes de La Independencia que más te gusten haciendo clic en el corazón de cada tarjeta.</p>
                </div>
            `;
        } else {
            DOM.favoritesListContainer.innerHTML = favRestaurants.map(r => `
                <div class="fav-item">
                    <div class="fav-item-info">
                        <h4>${Utils.escapeHtml(r.name)}</h4>
                        <p style="color: #666;">${Utils.escapeHtml(r.specialty)} · ${Utils.escapeHtml(r.address)}</p>
                    </div>
                    <div class="fav-item-actions">
                        <button type="button" class="button button-primary button-small" onclick="ModalSystem.openDetailModal('${r.id}')">Ver Menú</button>
                        <button type="button" class="button button-secondary button-small" onclick="StorageService.toggleFavorite('${r.id}'); ModalSystem.openFavoritesModal();" title="Eliminar de favoritos">✕</button>
                    </div>
                </div>
            `).join('');
        }

        this.openModal(DOM.modalFavorites);
    },

    openBusinessRegisterModal() {
        this.openModal(DOM.modalRegister);
    }
};

/* ================================================================
   16. VALIDACIÓN Y ENVÍO DE FORMULARIOS
================================================================ */
const FormValidator = {
    validateField(field) {
        const value = field.value.trim();
        const errorEl = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let message = '';

        if (field.required && !value) {
            isValid = false;
            message = 'Este campo es obligatorio.';
        } else if (field.type === 'email' && !Utils.isValidEmail(value)) {
            isValid = false;
            message = 'Ingresa un correo electrónico válido.';
        } else if (field.minLength && value.length < field.minLength) {
            isValid = false;
            message = `Debe tener al menos ${field.minLength} caracteres.`;
        }

        field.dataset.invalid = String(!isValid);
        if (errorEl) errorEl.textContent = message;
        return isValid;
    },

    validateForm(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let allValid = true;
        fields.forEach(f => {
            if (!this.validateField(f)) allValid = false;
        });
        return allValid;
    },

    attachEvents(form) {
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => {
                if (field.dataset.invalid === 'true') this.validateField(field);
            });
        });
    }
};

const FormHandlers = {
    async handleNewsletterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        if (!FormValidator.validateForm(form)) {
            NotificationSystem.show('Revisa los datos antes de enviar.', 'error');
            return;
        }

        const formData = new FormData(form);
        try {
            const response = await fetch(CONFIG.API_NEWSLETTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.error || 'No se pudo registrar la suscripción.');
            }

            NotificationSystem.show('¡Gracias por suscribirte al boletín de La Independencia!', 'success');
            form.reset();
        } catch (error) {
            console.error('Error al registrar suscripción:', error);
            NotificationSystem.show(error.message || 'No se pudo registrar la suscripción.', 'error');
        }
    },

    async handleBusinessRegistration(e) {
        e.preventDefault();
        const form = e.target;
        if (!FormValidator.validateForm(form)) {
            NotificationSystem.show('Por favor llena todos los campos obligatorios.', 'error');
            return;
        }

        const formData = new FormData(form);
        const submitBtn = document.getElementById('btn-submit-registration');
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch(CONFIG.API_REGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result.error || 'No se pudo guardar el restaurante.');
            }

            NotificationSystem.show(result.message || '¡Restaurante guardado con éxito!', 'success');
            form.reset();
            ModalSystem.closeAllModals();
        } catch (error) {
            console.error('Error al registrar restaurante:', error);
            NotificationSystem.show(error.message || 'No se pudo guardar el restaurante.', 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    }
};

/* ================================================================
   17. GESTIÓN DE INTERFAZ (UI STATE)
================================================================ */
const UIState = {
    renderResults() {
        const visible = PaginationEngine.getVisibleSlice();
        const hasResults = AppState.filteredRestaurants.length > 0;

        DOM.emptyState.hidden = hasResults;
        DOM.restaurantGrid.hidden = !hasResults;
        DOM.loadMoreZone.hidden = !hasResults;

        if (hasResults) {
            DOM.restaurantGrid.innerHTML = visible.map(r => CardRenderer.buildCard(r)).join('');
            DOM.resultsCountNumber.textContent = AppState.filteredRestaurants.length;
            DOM.loadMoreButton.hidden = !PaginationEngine.hasMore();
        } else {
            DOM.restaurantGrid.innerHTML = '';
            DOM.resultsCountNumber.textContent = '0';
        }
    },

    renderTopMonth() {
        if (!DOM.topMonthGrid) return;
        const top = [...AppState.allRestaurants].sort((a, b) => b.rating - a.rating).slice(0, 3);
        DOM.topMonthGrid.innerHTML = top.map((r, i) => CardRenderer.buildRankingItem(r, i + 1)).join('');
    },

    updateFavoritesCounter() {
        if (!DOM.favoritesCounter) return;
        const count = AppState.favorites.length;
        DOM.favoritesCounter.textContent = count;
        DOM.favoritesCounter.dataset.count = count;
    },

    syncFavoriteButtons() {
        document.querySelectorAll('[data-action="toggle-favorite"]').forEach(btn => {
            const id = btn.dataset.restaurantId;
            const isFav = AppState.favorites.includes(id);

            if (btn.classList.contains('favorite-toggle')) {
                btn.setAttribute('aria-pressed', String(isFav));
                const path = btn.querySelector('path');
                if (path) path.setAttribute('fill', isFav ? 'currentColor' : 'none');
            } else {
                btn.textContent = isFav ? '♥ Guardado' : '♡ Favorito';
            }
        });
    },

    toggleTheme() {
        const current = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = next;
        DOM.themeToggle?.setAttribute('aria-pressed', String(next === 'dark'));
        StorageService.saveTheme(next);
    },

    applyStoredTheme() {
        const theme = StorageService.loadTheme();
        if (theme === 'dark') {
            document.body.dataset.theme = 'dark';
            DOM.themeToggle?.setAttribute('aria-pressed', 'true');
        }
    },

    toggleMobileNav(force) {
        const isOpen = DOM.navMenu?.dataset.state === 'open';
        const next = force !== undefined ? force : !isOpen;
        if (DOM.navMenu) DOM.navMenu.dataset.state = next ? 'open' : 'closed';
        if (DOM.mainNav) DOM.mainNav.dataset.open = String(next);
        if (DOM.navToggle) DOM.navToggle.setAttribute('aria-expanded', String(next));
    },

    focusMainSearch() {
        DOM.mainSearchForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        DOM.searchQueryInput?.focus();
    }
};

/* ================================================================
   18. CONTROLADOR DE EVENTOS
================================================================ */
const EventController = {
    bindStaticEvents() {
        // Navegación y Header
        DOM.navToggle?.addEventListener('click', () => UIState.toggleMobileNav());
        DOM.navLinks?.forEach(l => l.addEventListener('click', () => UIState.toggleMobileNav(false)));

        DOM.themeToggle?.addEventListener('click', () => UIState.toggleTheme());
        DOM.searchToggle?.addEventListener('click', () => UIState.focusMainSearch());

        // Búsqueda en vivo con debounce al teclear
        DOM.searchQueryInput?.addEventListener('input', Utils.debounce((e) => {
            FilterEngine.setFilter('query', e.target.value);
        }, 200));

        DOM.searchPriceSelect?.addEventListener('change', (e) => {
            FilterEngine.setFilter('priceRange', e.target.value);
        });

        DOM.mainSearchForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            FilterEngine.applyFilters();
            document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Ordenamiento y Paginación
        DOM.sortSelect?.addEventListener('change', (e) => SortEngine.setSort(e.target.value));
        DOM.loadMoreButton?.addEventListener('click', () => PaginationEngine.loadNext());

        // Formularios
        if (DOM.newsletterForm) {
            FormValidator.attachEvents(DOM.newsletterForm);
            DOM.newsletterForm.addEventListener('submit', FormHandlers.handleNewsletterSubmit);
        }

        if (DOM.businessRegistrationForm) {
            FormValidator.attachEvents(DOM.businessRegistrationForm);
            DOM.businessRegistrationForm.addEventListener('submit', FormHandlers.handleBusinessRegistration);
        }

        // Header scroll
        window.addEventListener('scroll', Utils.debounce(() => {
            DOM.header.dataset.scrolled = String(window.scrollY > CONFIG.SCROLL_HEADER_THRESHOLD);
        }, 50));

        // Cerrar modales con tecla ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') ModalSystem.closeAllModals();
        });

        // Cerrar haciendo clic en el fondo del modal
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) ModalSystem.closeAllModals();
            });
        });

        CategorySystem.bindEvents();
    },

    bindDelegatedEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const restaurantId = target.dataset.restaurantId;

            switch (action) {
                case 'toggle-favorite':
                    if (restaurantId) StorageService.toggleFavorite(restaurantId);
                    break;
                case 'toggle-modal-favorite':
                    if (AppState.currentDetailId) StorageService.toggleFavorite(AppState.currentDetailId);
                    break;
                case 'view-details':
                    if (restaurantId) ModalSystem.openDetailModal(restaurantId);
                    break;
                case 'open-favorites':
                    ModalSystem.openFavoritesModal();
                    break;
                case 'open-business-signup':
                    ModalSystem.openBusinessRegisterModal();
                    break;
                case 'close-modal':
                    ModalSystem.closeAllModals();
                    break;
                case 'reset-filters':
                    FilterEngine.resetFilters();
                    break;
                case 'view-event':
                    NotificationSystem.show(`Evento «${target.dataset.eventTitle || 'Gastronómico'}»: Entrada libre en La Independencia, Itagüí.`, 'info');
                    break;
                default:
                    break;
            }
        });
    }
};

/* ================================================================
   19. INICIALIZACIÓN DE LA APLICACIÓN
================================================================ */
async function initializeApp() {
    try {
        AppState.favorites = StorageService.loadFavorites();
        UIState.applyStoredTheme();

        await DataService.loadRestaurants();

        FilterEngine.applyFilters();
        UIState.renderTopMonth();
        UIState.updateFavoritesCounter();
        UIState.syncFavoriteButtons();

        MapSystem.init(AppState.allRestaurants);

        if (DOM.currentYear) {
            DOM.currentYear.textContent = new Date().getFullYear();
        }

        EventController.bindStaticEvents();
        EventController.bindDelegatedEvents();

        // Hacer disponible globalmente para llamadas inline en HTML/Leaflet
        window.ModalSystem = ModalSystem;
        window.StorageService = StorageService;
    } catch (error) {
        console.error('Error al inicializar Guidestronomy:', error);
        NotificationSystem.show('No se pudieron cargar todos los componentes. Refresca la página.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
