import { Credentials } from './types';

// Diccionario simulado de credenciales validas
export const VALID_CREDENTIALS: Credentials = {
  "alumno": "si"
};

export const RIDDLES = {
  username: {
    question: "Soy quien sufre las tareas, quien se desvela en los proyectos y teme al parcial. ¿Qué soy?",
    hint: "Tu rol en la universidad (singular, minúsculas).",
    answer: "alumno"
  },
  password: {
    question: "El profesor grita con furia: '¿SUBISTE TU PPT?'. Tu respuesta para salvarte es:",
    hint: "Afirmación simple (minúsculas).",
    answer: "si"
  }
};

export const PROFESSOR_QUOTES = [
  "¿SUBISTE TU PPT?",
  "¿TIENES EJEMPLO PRÁCTICO?",
  "¡ME DOLERÁ PONERTE ESE 0!",
  "¿VAS A EXPONER?"
];