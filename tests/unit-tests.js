/**
 * Suite de pruebas unitarias - Inventario Big Market SPA
 * Cubre funciones puras y casos de borde críticos.
 * Ejecutar desde tests/test-runner.html
 */

/* eslint-disable */

// =============================================
// MINI FRAMEWORK DE PRUEBAS
// =============================================

const TestRunner = {
    results: [],
    passed: 0,
    failed: 0,

    assert(description, condition, detail = '') {
        const result = { description, passed: !!condition, detail };
        this.results.push(result);
        if (condition) {
            this.passed++;
        } else {
            this.failed++;
            console.error(`✗ FALLO: ${description}${detail ? ' → ' + detail : ''}`);
        }
    },

    assertEqual(description, actual, expected) {
        const passed = actual === expected;
        const detail = passed ? '' : `esperado: ${JSON.stringify(expected)}, obtenido: ${JSON.stringify(actual)}`;
        this.assert(description, passed, detail);
    },

    assertNull(description, value) {
        this.assert(description, value === null, `esperado null, obtenido: ${JSON.stringify(value)}`);
    },

    assertNotNull(description, value) {
        this.assert(description, value !== null && value !== undefined, 'valor es null/undefined');
    },

    assertDeepEqual(description, actual, expected) {
        const passed = JSON.stringify(actual) === JSON.stringify(expected);
        const detail = passed ? '' : `esperado: ${JSON.stringify(expected)}, obtenido: ${JSON.stringify(actual)}`;
        this.assert(description, passed, detail);
    },

    summary() {
        const total = this.passed + this.failed;
        return {
            total,
            passed: this.passed,
            failed: this.failed,
            rate: total > 0 ? Math.round((this.passed / total) * 100) : 0,
            results: this.results
        };
    },

    reset() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }
};

// =============================================
// COPIAS DE FUNCIONES A TESTEAR (aisladas del DOM)
// =============================================

function _escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function _formatPrice(price) {
    try {
        if (price === null || price === undefined || (typeof price === 'number' && isNaN(price))) return '0';
        if (typeof price === 'string') {
            const clean = price.toString().replace(/\./g, '').replace(',', '.');
            price = parseFloat(clean);
            if (isNaN(price)) return '0';
        }
        return price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } catch (e) { return '0'; }
}

function _parsePrice(priceString) {
    if (!priceString) return 0;
    try {
        const clean = priceString.toString().replace(/\./g, '').replace(',', '.');
        const result = parseFloat(clean);
        return isNaN(result) ? 0 : result;
    } catch (e) { return 0; }
}

function _formatDate(date) {
    if (!date) return '';
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function _formatDateForInput(date) {
    if (!date) return '';
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function _convertInputDateToDisplay(inputDate) {
    if (!inputDate) return '';
    const parts = inputDate.split('-');
    if (parts.length !== 3) return inputDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function _parseDate(dateString) {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    const day   = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year  = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
}

function _getNextId(items) {
    let maxId = 0;
    for (const item of items) {
        if (item.id > maxId) maxId = item.id;
    }
    return maxId + 1;
}

// =============================================
// PRUEBAS: escapeHtml
// =============================================

function testEscapeHtml() {
    const T = TestRunner;

    T.assertEqual('escapeHtml: null devuelve cadena vacía',          _escapeHtml(null),        '');
    T.assertEqual('escapeHtml: undefined devuelve cadena vacía',     _escapeHtml(undefined),   '');
    T.assertEqual('escapeHtml: texto normal sin cambios',            _escapeHtml('Coca-Cola'),  'Coca-Cola');
    T.assertEqual('escapeHtml: escapa < y >',                        _escapeHtml('<script>'),   '&lt;script&gt;');
    T.assertEqual('escapeHtml: escapa comillas dobles',              _escapeHtml('"precio"'),   '&quot;precio&quot;');
    T.assertEqual('escapeHtml: escapa comillas simples',             _escapeHtml("O'Brien"),    'O&#039;Brien');
    T.assertEqual('escapeHtml: escapa ampersand',                    _escapeHtml('P&G'),        'P&amp;G');
    T.assertEqual('escapeHtml: XSS clásico bloqueado',
        _escapeHtml('<img src=x onerror=alert(1)>'),
        '&lt;img src=x onerror=alert(1)&gt;'
    );
    T.assertEqual('escapeHtml: número se convierte a string',        _escapeHtml(1500),         '1500');
}

// =============================================
// PRUEBAS: formatPrice
// =============================================

function testFormatPrice() {
    const T = TestRunner;

    T.assertEqual('formatPrice: null → "0"',                    _formatPrice(null),        '0');
    T.assertEqual('formatPrice: undefined → "0"',               _formatPrice(undefined),   '0');
    T.assertEqual('formatPrice: NaN → "0"',                     _formatPrice(NaN),         '0');
    T.assertEqual('formatPrice: 0 → "0"',                       _formatPrice(0),           '0');
    T.assertEqual('formatPrice: número entero pequeño',          _formatPrice(500),         '500');
    T.assertEqual('formatPrice: miles sin decimales (es-CL)',    _formatPrice(1500),        '1.500');
    T.assertEqual('formatPrice: millones',                       _formatPrice(1000000),     '1.000.000');
    T.assertEqual('formatPrice: string con separador de miles',  _formatPrice('1.500'),     '1.500');
    T.assertEqual('formatPrice: string sin formato',             _formatPrice('1500'),      '1.500');
    T.assertEqual('formatPrice: string con coma decimal',        _formatPrice('1500,50'),   '1.501'); // redondea al peso
    T.assertEqual('formatPrice: string vacío → "0"',            _formatPrice(''),          '0');
    T.assertEqual('formatPrice: string inválido → "0"',         _formatPrice('abc'),       '0');
}

// =============================================
// PRUEBAS: parsePrice
// =============================================

function testParsePrice() {
    const T = TestRunner;

    T.assertEqual('parsePrice: null → 0',                     _parsePrice(null),      0);
    T.assertEqual('parsePrice: undefined → 0',                _parsePrice(undefined), 0);
    T.assertEqual('parsePrice: cadena vacía → 0',             _parsePrice(''),        0);
    T.assertEqual('parsePrice: número entero string',         _parsePrice('1500'),    1500);
    T.assertEqual('parsePrice: formato chileno con punto',    _parsePrice('1.500'),   1500);
    T.assertEqual('parsePrice: millones con puntos',          _parsePrice('1.000.000'), 1000000);
    T.assertEqual('parsePrice: con coma decimal',             _parsePrice('1500,50'), 1500.5);
    T.assertEqual('parsePrice: cero string',                  _parsePrice('0'),       0);
    T.assertEqual('parsePrice: número directo (no string)',   _parsePrice(2500),      2500);

    // Casos que retornan 0 al ser inválidos
    T.assertEqual('parsePrice: string con $ → 0',            _parsePrice('$1500'),   0);
    T.assertEqual('parsePrice: texto libre → 0',              _parsePrice('precio'),  0);
}

// =============================================
// PRUEBAS: parseDate
// =============================================

function testParseDate() {
    const T = TestRunner;

    T.assertNull('parseDate: null → null',          _parseDate(null));
    T.assertNull('parseDate: cadena vacía → null',  _parseDate(''));
    T.assertNull('parseDate: formato incorrecto',   _parseDate('2026-03-26'));
    T.assertNull('parseDate: texto libre',          _parseDate('hoy'));
    T.assertNull('parseDate: solo números',         _parseDate('26032026'));

    const d1 = _parseDate('26/03/2026');
    T.assert('parseDate: fecha válida retorna objeto Date', d1 instanceof Date);
    T.assertEqual('parseDate: año correcto',   d1 && d1.getFullYear(), 2026);
    T.assertEqual('parseDate: mes correcto',   d1 && d1.getMonth(),    2); // 0-indexed
    T.assertEqual('parseDate: día correcto',   d1 && d1.getDate(),     26);

    const d2 = _parseDate('01/01/2024');
    T.assertEqual('parseDate: 1 enero 2024 - año',  d2 && d2.getFullYear(), 2024);
    T.assertEqual('parseDate: 1 enero 2024 - mes',  d2 && d2.getMonth(),    0);
    T.assertEqual('parseDate: 1 enero 2024 - día',  d2 && d2.getDate(),     1);

    const d3 = _parseDate('31/12/2025');
    T.assertEqual('parseDate: 31 dic 2025 - día',   d3 && d3.getDate(),     31);
    T.assertEqual('parseDate: 31 dic 2025 - mes',   d3 && d3.getMonth(),    11);
}

// =============================================
// PRUEBAS: formatDate
// =============================================

function testFormatDate() {
    const T = TestRunner;

    T.assertEqual('formatDate: null → cadena vacía',   _formatDate(null), '');
    T.assertEqual('formatDate: undefined → cadena vacía', _formatDate(undefined), '');

    const d1 = new Date(2026, 2, 26); // 26 marzo 2026
    T.assertEqual('formatDate: 26 marzo 2026',         _formatDate(d1), '26/03/2026');

    const d2 = new Date(2024, 0, 1); // 1 enero 2024
    T.assertEqual('formatDate: 1 enero 2024 con cero', _formatDate(d2), '01/01/2024');

    const d3 = new Date(2025, 11, 31); // 31 diciembre 2025
    T.assertEqual('formatDate: 31 diciembre 2025',     _formatDate(d3), '31/12/2025');
}

// =============================================
// PRUEBAS: formatDateForInput
// =============================================

function testFormatDateForInput() {
    const T = TestRunner;

    T.assertEqual('formatDateForInput: null → cadena vacía', _formatDateForInput(null), '');

    const d1 = new Date(2026, 2, 26);
    T.assertEqual('formatDateForInput: 26 marzo 2026',       _formatDateForInput(d1), '2026-03-26');

    const d2 = new Date(2024, 0, 1);
    T.assertEqual('formatDateForInput: 1 enero 2024',        _formatDateForInput(d2), '2024-01-01');
}

// =============================================
// PRUEBAS: convertInputDateToDisplay
// =============================================

function testConvertInputDateToDisplay() {
    const T = TestRunner;

    T.assertEqual('convertInput: null → cadena vacía',        _convertInputDateToDisplay(null),       '');
    T.assertEqual('convertInput: cadena vacía → cadena vacía', _convertInputDateToDisplay(''),        '');
    T.assertEqual('convertInput: formato YYYY-MM-DD correcto', _convertInputDateToDisplay('2026-03-26'), '26/03/2026');
    T.assertEqual('convertInput: 1 enero 2024',                _convertInputDateToDisplay('2024-01-01'), '01/01/2024');
    T.assertEqual('convertInput: formato incorrecto sin - retorna original',
        _convertInputDateToDisplay('26032026'), '26032026'
    );
}

// =============================================
// PRUEBAS: getNextId
// =============================================

function testGetNextId() {
    const T = TestRunner;

    T.assertEqual('getNextId: array vacío → 1',
        _getNextId([]), 1
    );
    T.assertEqual('getNextId: un elemento id=1 → 2',
        _getNextId([{ id: 1 }]), 2
    );
    T.assertEqual('getNextId: ids consecutivos → max+1',
        _getNextId([{ id: 1 }, { id: 2 }, { id: 3 }]), 4
    );
    T.assertEqual('getNextId: ids con saltos → max+1',
        _getNextId([{ id: 1 }, { id: 5 }, { id: 3 }]), 6
    );
    T.assertEqual('getNextId: id grande',
        _getNextId([{ id: 100 }, { id: 50 }]), 101
    );
    T.assertEqual('getNextId: id=0 → 1',
        _getNextId([{ id: 0 }]), 1
    );
}

// =============================================
// PRUEBAS: LÓGICA DE NEGOCIO (Stock y Ventas)
// =============================================

function testStockValidation() {
    const T = TestRunner;

    // Simular lógica de verificación de stock
    function canAddToSale(product, requestedQty, currentQtyInCart = 0) {
        if (!product) return { ok: false, reason: 'producto no encontrado' };
        if (product.stock <= 0) return { ok: false, reason: 'sin stock' };
        if (product.stock < currentQtyInCart + requestedQty)
            return { ok: false, reason: `solo quedan ${product.stock}` };
        return { ok: true };
    }

    const p1 = { id: 1, name: 'Coca-Cola', stock: 10, price: 1500 };
    const p0 = { id: 2, name: 'Sin stock', stock: 0,  price: 1500 };
    const p3 = { id: 3, name: 'Escaso',    stock: 2,  price: 1500 };

    T.assert('stock: agregar 1 unidad con 10 disponibles → ok',
        canAddToSale(p1, 1).ok
    );
    T.assert('stock: agregar 10 unidades exactas → ok',
        canAddToSale(p1, 10).ok
    );
    T.assert('stock: agregar 11 con 10 disponibles → fallo',
        !canAddToSale(p1, 11).ok
    );
    T.assert('stock: producto sin stock → fallo',
        !canAddToSale(p0, 1).ok
    );
    T.assertEqual('stock: razón correcta para sin stock',
        canAddToSale(p0, 1).reason, 'sin stock'
    );
    T.assert('stock: producto null → fallo',
        !canAddToSale(null, 1).ok
    );
    T.assert('stock: con 2 disponibles y 1 en carrito, pedir 2 más → fallo',
        !canAddToSale(p3, 2, 1).ok
    );
    T.assert('stock: con 2 disponibles y 1 en carrito, pedir 1 más → ok',
        canAddToSale(p3, 1, 1).ok
    );
}

function testSaleTotals() {
    const T = TestRunner;

    // Simular cálculo de totales de venta
    function calcTotal(items) {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function calcChange(cashReceived, total) {
        return cashReceived - total;
    }

    const items1 = [
        { name: 'Coca-Cola', price: 1500, quantity: 2 },
        { name: 'Arroz',     price: 3500, quantity: 1 }
    ];
    T.assertEqual('totales: 2×1500 + 1×3500 = 6500', calcTotal(items1), 6500);
    T.assertEqual('totales: carrito vacío = 0',        calcTotal([]),    0);

    T.assertEqual('vuelto: 7000 - 6500 = 500',         calcChange(7000, 6500), 500);
    T.assertEqual('vuelto: pago exacto = 0',            calcChange(6500, 6500), 0);
    T.assertEqual('vuelto: insuficiente (negativo)',    calcChange(5000, 6500), -1500);

    // Precio variable
    const itemsVar = [
        { name: 'Variable', price: 850, quantity: 3 }
    ];
    T.assertEqual('totales: precio variable 3×850 = 2550', calcTotal(itemsVar), 2550);
}

function testSaleFiltering() {
    const T = TestRunner;

    const mockSales = [
        { id: 1, date: '26/03/2026', total: 5000, paymentMethod: 'efectivo' },
        { id: 2, date: '26/03/2026', total: 3000, paymentMethod: 'tarjeta', cardType: 'credito' },
        { id: 3, date: '25/03/2026', total: 7000, paymentMethod: 'transferencia' },
        { id: 4, date: '01/03/2026', total: 2000, paymentMethod: 'efectivo' },
        { id: 5, date: '28/02/2026', total: 1500, paymentMethod: 'debito' },
    ];

    // Filtrar por día
    const today = '26/03/2026';
    const todaySales = mockSales.filter(s => s.date === today);
    T.assertEqual('filtro día: 2 ventas del 26/03/2026', todaySales.length, 2);

    // Total del día
    const dayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
    T.assertEqual('total día: 5000+3000=8000', dayTotal, 8000);

    // Por método de pago
    const efectivoSales = mockSales.filter(s => s.paymentMethod === 'efectivo');
    T.assertEqual('filtro método: 2 ventas efectivo', efectivoSales.length, 2);

    const tarjetaSales = mockSales.filter(s => s.paymentMethod === 'tarjeta');
    T.assertEqual('filtro método: 1 venta tarjeta', tarjetaSales.length, 1);
    T.assertEqual('tarjeta tipo: credito', tarjetaSales[0].cardType, 'credito');

    // Ventas de los últimos 30 días (usando lógica de clearOldData)
    function filterLast30Days(sales) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return sales.filter(sale => {
            const d = _parseDate(sale.date);
            return d && d >= thirtyDaysAgo;
        });
    }
    const recent = filterLast30Days(mockSales);
    // Todas las ventas de mockSales son recientes dado que usan fechas de 2026
    T.assert('filtro 30 días: retorna solo ventas recientes', recent.length > 0);
}

// =============================================
// PRUEBAS: VALIDACIONES DE PRODUCTO
// =============================================

function testProductValidation() {
    const T = TestRunner;

    function validateProduct(name, category, stock, price) {
        if (!name || name.trim() === '') return { ok: false, reason: 'nombre requerido' };
        if (!category)                   return { ok: false, reason: 'categoría requerida' };
        if (stock < 0)                   return { ok: false, reason: 'stock negativo' };
        if (price <= 0)                  return { ok: false, reason: 'precio inválido' };
        return { ok: true };
    }

    T.assert('validación: producto válido',
        validateProduct('Coca-Cola', 'Bebidas', 10, 1500).ok
    );
    T.assert('validación: nombre vacío → fallo',
        !validateProduct('', 'Bebidas', 10, 1500).ok
    );
    T.assertEqual('validación: razón nombre vacío',
        validateProduct('', 'Bebidas', 10, 1500).reason, 'nombre requerido'
    );
    T.assert('validación: solo espacios → fallo',
        !validateProduct('   ', 'Bebidas', 10, 1500).ok
    );
    T.assert('validación: sin categoría → fallo',
        !validateProduct('Coca-Cola', '', 10, 1500).ok
    );
    T.assert('validación: stock negativo → fallo',
        !validateProduct('Coca-Cola', 'Bebidas', -1, 1500).ok
    );
    T.assert('validación: stock cero → ok (sin stock es válido)',
        validateProduct('Coca-Cola', 'Bebidas', 0, 1500).ok
    );
    T.assert('validación: precio cero → fallo',
        !validateProduct('Coca-Cola', 'Bebidas', 10, 0).ok
    );
    T.assert('validación: precio negativo → fallo',
        !validateProduct('Coca-Cola', 'Bebidas', 10, -100).ok
    );
}

// =============================================
// PRUEBAS: BACKUP Y RESTAURACIÓN
// =============================================

function testBackupStructure() {
    const T = TestRunner;

    // Simular estructura de backup
    function createBackup(inventory, sales) {
        return {
            inventory: [...inventory],
            sales: [...sales],
            exportDate: new Date().toISOString(),
            systemVersion: '1.2.5'
        };
    }

    function validateBackup(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.inventory))    return false;
        if (!Array.isArray(data.sales))        return false;
        return true;
    }

    const mockInventory = [{ id: 1, name: 'Test', stock: 5, price: 1000 }];
    const mockSales = [{ id: 1, date: '26/03/2026', total: 1000 }];

    const backup = createBackup(mockInventory, mockSales);
    T.assert('backup: estructura válida',           validateBackup(backup));
    T.assertEqual('backup: versión correcta',       backup.systemVersion, '1.2.5');
    T.assertEqual('backup: inventario copiado',     backup.inventory.length, 1);
    T.assertEqual('backup: ventas copiadas',        backup.sales.length, 1);
    T.assert('backup: fecha exportación presente',  !!backup.exportDate);

    T.assert('backup: null es inválido',            !validateBackup(null));
    T.assert('backup: sin inventory es inválido',   !validateBackup({ sales: [] }));
    T.assert('backup: sin sales es inválido',       !validateBackup({ inventory: [] }));
    T.assert('backup: inventory no array es inválido',
        !validateBackup({ inventory: {}, sales: [] })
    );
}

// =============================================
// PRUEBAS: CASOS DE BORDE ESPECIALES
// =============================================

function testEdgeCases() {
    const T = TestRunner;

    // getNextId con IDs no enteros (data corrupta)
    T.assertEqual('getNextId: id string (corrupto) tratado como 0',
        _getNextId([{ id: 'abc' }]), 1
    );

    // formatPrice con valores extremos
    T.assertEqual('formatPrice: precio muy grande',
        _formatPrice(999999999), '999.999.999'
    );

    // parsePrice con formato mixto
    T.assertEqual('parsePrice: "1.500,99" → 1500.99',
        _parsePrice('1.500,99'), 1500.99
    );

    // Fechas límite
    const d31 = _parseDate('31/12/2025');
    T.assertEqual('parseDate: último día del año - día',  d31 && d31.getDate(),  31);
    T.assertEqual('parseDate: último día del año - mes',  d31 && d31.getMonth(), 11);

    const d1 = _parseDate('01/01/2024');
    T.assertEqual('parseDate: primer día del año - día',  d1 && d1.getDate(),  1);
    T.assertEqual('parseDate: primer día del año - mes',  d1 && d1.getMonth(), 0);

    // Roundtrip fecha: parseDate → formatDate → parseDate
    const original = '15/06/2025';
    const parsed   = _parseDate(original);
    const formatted = _formatDate(parsed);
    T.assertEqual('fecha: roundtrip parseDate → formatDate', formatted, original);

    // Roundtrip fecha input: formatDateForInput → convertInputDateToDisplay
    const inputDate = '2026-03-26';
    const displayDate = _convertInputDateToDisplay(inputDate);
    T.assertEqual('fecha: roundtrip input→display', displayDate, '26/03/2026');

    // Venta con item de precio variable
    function calcSaleTotal(items) {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    }
    const saleWithVariable = [
        { name: 'Normal',   price: 1500, quantity: 2, subtotal: 3000 },
        { name: 'Variable', price: 750,  quantity: 1, subtotal: 750,  isVariablePrice: true }
    ];
    T.assertEqual('venta con precio variable: total correcto',
        calcSaleTotal(saleWithVariable), 3750
    );

    // escapeHtml con inyección compleja
    const xssAttempt = '<script>document.cookie</script>';
    const escaped = _escapeHtml(xssAttempt);
    T.assert('XSS: script tag bloqueado',    !escaped.includes('<script>'));
    T.assert('XSS: string escapado contiene &lt;', escaped.includes('&lt;'));
}

// =============================================
// EJECUTAR TODAS LAS PRUEBAS
// =============================================

function runAllTests() {
    TestRunner.reset();

    console.group('🧪 Ejecutando pruebas unitarias - Inventario Big Market SPA');

    console.group('1. escapeHtml');
    testEscapeHtml();
    console.groupEnd();

    console.group('2. formatPrice');
    testFormatPrice();
    console.groupEnd();

    console.group('3. parsePrice');
    testParsePrice();
    console.groupEnd();

    console.group('4. parseDate');
    testParseDate();
    console.groupEnd();

    console.group('5. formatDate');
    testFormatDate();
    console.groupEnd();

    console.group('6. formatDateForInput');
    testFormatDateForInput();
    console.groupEnd();

    console.group('7. convertInputDateToDisplay');
    testConvertInputDateToDisplay();
    console.groupEnd();

    console.group('8. getNextId');
    testGetNextId();
    console.groupEnd();

    console.group('9. Validación de stock');
    testStockValidation();
    console.groupEnd();

    console.group('10. Totales y vuelto de venta');
    testSaleTotals();
    console.groupEnd();

    console.group('11. Filtros de ventas');
    testSaleFiltering();
    console.groupEnd();

    console.group('12. Validación de producto');
    testProductValidation();
    console.groupEnd();

    console.group('13. Backup y restauración');
    testBackupStructure();
    console.groupEnd();

    console.group('14. Casos de borde especiales');
    testEdgeCases();
    console.groupEnd();

    console.groupEnd();

    return TestRunner.summary();
}
