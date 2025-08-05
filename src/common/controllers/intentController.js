const axios = require("axios");

const SAPTIVA_API_KEY = process.env.SAPTIVA_API_KEY;
const SAPTIVA_URL = "https://api.saptiva.com/v1/chat/completions";
const MODEL = "Saptiva Turbo";

// Prompt simplificado: solo clasificación de intención
function Promt_member() {
  return `
Eres el asistente virtual de CANACO SERVYTUR León.

Tu tarea es analizar el mensaje del usuario y responder SOLO con un JSON válido que contenga:

- "mensaje": texto fijo y específico para cada acción.
- "action": una acción válida.

Acciones válidas y sus mensajes asociados:

- crear_credenciales
  {
    "mensaje": "Estoy generando tu credencial, un momento...",
    "action": "crear_credenciales"
  }

- solicitud_eventos
  {
    "mensaje": "Un momento, estoy generando solicitud_eventos.",
    "action": "solicitud_eventos"
  }

- informacion_perfil
  {
    "mensaje": "Aquí tienes la información de tu perfil...",
    "action": "informacion_perfil"
  }

- informacion_membresia / Pago_membresias
  {
    "mensaje": "Aquí tienes la información de tu Membresía...",
    "action": "informacion_membresia"
  }

- informacion_beneficios
  {
    "mensaje": "Aquí tienes la información de los beneficios...",
    "action": "informacion_beneficios"
  }

- informacion_comunidad
  {
    "mensaje": "Aquí tienes la información de las comunidades...",
    "action": "informacion_comunidad"
  }

- informacion_noticias
  {
    "mensaje": "Aquí tienes la información de las noticias...",
    "action": "informacion_comunidad"
  }

- informacion_informes
  {
    "mensaje": "Aquí tienes la información de los informes...",
    "action": "informacion_comunidad"
  }

- constancia_miembro
  {
    "mensaje": "Aquí tienes la información de la constancia...",
    "action": "constancia_miembro"
  }

- pregunta_general
  {
    "mensaje": "¿En qué puedo ayudarte?",
    "action": "pregunta_general"
  }

Ejemplos de frases personales (activan acción):

- "dame mi credencial"
- "quiero mis eventos"
- "dame mi perfil"
- "qué beneficios tengo"
- "dame mi constancia"
- "quiero saber de mi comunidad"

Ejemplos generales (responder con pregunta_general):

- "cómo consigo una credencial"
- "qué eventos hay en CANACO"
- "cómo puedo afiliarme"
- "perdí mi credencial"
- "noticias generales"

Si no estás seguro de la intención, responde con:

{
  "mensaje": "¿En qué puedo ayudarte?",
  "action": "pregunta_general"
}

Responde SOLO con el JSON válido, sin texto adicional ni explicaciones.
`;
}

async function detectIntent(req, res) {
  try {
    const { from, query } = req.body;

    if (!from || !query) {
      return res.status(400).json({ error: "Faltan campos requeridos: from, query" });
    }

    const prompt = Promt_member();

    const payload = {
      model: MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: query }
      ],
      temperature: 0.4,
      max_tokens: 512
    };

    const response = await axios.post(SAPTIVA_URL, payload, {
      headers: {
        Authorization: `Bearer ${SAPTIVA_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const raw = response.data?.choices?.[0]?.message?.content?.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    const output = parsed && parsed.mensaje && parsed.action
      ? { from, mensaje: parsed.mensaje, action: parsed.action }
      : { from, mensaje: "¿En qué puedo ayudarte?", action: "pregunta_general" };

    return res.json(output);

  } catch (error) {
    console.error("❌ Error detectando intención:", error.response?.data || error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { detectIntent };
