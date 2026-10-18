import { onRequest as handleGame } from '../../game.js';
export function onRequest(context) { return handleGame(context); }
