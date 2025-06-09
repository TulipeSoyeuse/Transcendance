"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getroot = getroot;
async function getroot(request, reply) {
    return reply.sendFile('index.html');
}
