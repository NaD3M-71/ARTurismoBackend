const Ciudades = require('../models/Ciudades.js');
const Clientes = require('../models/Clientes.js');

const STOP_WORDS = new Set([
    'en', 'de', 'la', 'el', 'los', 'las', 'y', 'a', 'del', 'con',
    'por', 'para', 'un', 'una', 'al', 'mi', 'su', 'sus', 'se', 'es',
    'que', 'lo', 'le', 'me', 'te', 'nos'
]);
const LIMIT = 5;

function getTerminos(query) {
    return query
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w.toLowerCase()));
}

function buildClienteFilter(terminos) {
    return {
        $and: terminos.map(t => ({
            $or: [
                { nombre: { $regex: t, $options: 'i' } },
                { ciudad: { $regex: t, $options: 'i' } },
                { categoria: { $regex: t, $options: 'i' } },
                { descripcionCorta: { $regex: t, $options: 'i' } }
            ]
        }))
    };
}

function buildCiudadFilter(terminos) {
    return {
        $or: terminos.map(t => ({
            $or: [
                { nombre: { $regex: t, $options: 'i' } },
                { provincia: { $regex: t, $options: 'i' } }
            ]
        }))
    };
}

exports.buscar = async (req, res) => {
    try {
        const { q = '', solo } = req.query;
        const skipCiudades = parseInt(req.query.skipCiudades) || 0;
        const skipActividades = parseInt(req.query.skipActividades) || 0;

        if (!q.trim()) {
            return res.json({
                ciudades: [], actividades: [],
                totalCiudades: 0, totalActividades: 0,
                hayMasCiudades: false, hayMasActividades: false
            });
        }

        const terminos = getTerminos(q);
        if (terminos.length === 0) {
            return res.json({
                ciudades: [], actividades: [],
                totalCiudades: 0, totalActividades: 0,
                hayMasCiudades: false, hayMasActividades: false
            });
        }

        const buscarCiudades = solo !== 'actividades';
        const buscarActividades = solo !== 'ciudades';

        const [ciudades, totalCiudades, actividades, totalActividades] = await Promise.all([
            buscarCiudades
                ? Ciudades.find(buildCiudadFilter(terminos)).skip(skipCiudades).limit(LIMIT)
                : Promise.resolve([]),
            buscarCiudades
                ? Ciudades.countDocuments(buildCiudadFilter(terminos))
                : Promise.resolve(0),
            buscarActividades
                ? Clientes.find(buildClienteFilter(terminos)).skip(skipActividades).limit(LIMIT)
                : Promise.resolve([]),
            buscarActividades
                ? Clientes.countDocuments(buildClienteFilter(terminos))
                : Promise.resolve(0)
        ]);

        res.json({
            ciudades,
            actividades,
            totalCiudades,
            totalActividades,
            hayMasCiudades: skipCiudades + ciudades.length < totalCiudades,
            hayMasActividades: skipActividades + actividades.length < totalActividades
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en la búsqueda' });
    }
};
