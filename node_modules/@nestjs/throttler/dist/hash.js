"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
const crypto = require("node:crypto");
function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}
//# sourceMappingURL=hash.js.map