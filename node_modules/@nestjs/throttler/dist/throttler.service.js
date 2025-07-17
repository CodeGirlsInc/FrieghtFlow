"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerStorageService = void 0;
const common_1 = require("@nestjs/common");
let ThrottlerStorageService = class ThrottlerStorageService {
    constructor() {
        this._storage = new Map();
        this.timeoutIds = new Map();
    }
    get storage() {
        return this._storage;
    }
    getExpirationTime(key) {
        return Math.ceil((this.storage.get(key).expiresAt - Date.now()) / 1000);
    }
    getBlockExpirationTime(key) {
        return Math.ceil((this.storage.get(key).blockExpiresAt - Date.now()) / 1000);
    }
    setExpirationTime(key, ttlMilliseconds, throttlerName) {
        const timeoutId = setTimeout(() => {
            const { totalHits } = this.storage.get(key);
            totalHits.set(throttlerName, totalHits.get(throttlerName) - 1);
            clearTimeout(timeoutId);
            this.timeoutIds.set(throttlerName, this.timeoutIds.get(throttlerName).filter((id) => id !== timeoutId));
        }, ttlMilliseconds);
        this.timeoutIds.get(throttlerName).push(timeoutId);
    }
    clearExpirationTimes(throttlerName) {
        this.timeoutIds.get(throttlerName).forEach(clearTimeout);
        this.timeoutIds.set(throttlerName, []);
    }
    resetBlockdRequest(key, throttlerName) {
        this.storage.get(key).isBlocked = false;
        this.storage.get(key).totalHits.set(throttlerName, 0);
        this.clearExpirationTimes(throttlerName);
    }
    fireHitCount(key, throttlerName, ttl) {
        const { totalHits } = this.storage.get(key);
        totalHits.set(throttlerName, totalHits.get(throttlerName) + 1);
        this.setExpirationTime(key, ttl, throttlerName);
    }
    async increment(key, ttl, limit, blockDuration, throttlerName) {
        const ttlMilliseconds = ttl;
        const blockDurationMilliseconds = blockDuration;
        if (!this.timeoutIds.has(throttlerName)) {
            this.timeoutIds.set(throttlerName, []);
        }
        if (!this.storage.has(key)) {
            this.storage.set(key, {
                totalHits: new Map([[throttlerName, 0]]),
                expiresAt: Date.now() + ttlMilliseconds,
                blockExpiresAt: 0,
                isBlocked: false,
            });
        }
        let timeToExpire = this.getExpirationTime(key);
        if (timeToExpire <= 0) {
            this.storage.get(key).expiresAt = Date.now() + ttlMilliseconds;
            timeToExpire = this.getExpirationTime(key);
        }
        if (!this.storage.get(key).isBlocked) {
            this.fireHitCount(key, throttlerName, ttlMilliseconds);
        }
        if (this.storage.get(key).totalHits.get(throttlerName) > limit &&
            !this.storage.get(key).isBlocked) {
            this.storage.get(key).isBlocked = true;
            this.storage.get(key).blockExpiresAt = Date.now() + blockDurationMilliseconds;
        }
        const timeToBlockExpire = this.getBlockExpirationTime(key);
        if (timeToBlockExpire <= 0 && this.storage.get(key).isBlocked) {
            this.resetBlockdRequest(key, throttlerName);
            this.fireHitCount(key, throttlerName, ttlMilliseconds);
        }
        return {
            totalHits: this.storage.get(key).totalHits.get(throttlerName),
            timeToExpire,
            isBlocked: this.storage.get(key).isBlocked,
            timeToBlockExpire: timeToBlockExpire,
        };
    }
    onApplicationShutdown() {
        this.timeoutIds.forEach((timeouts) => timeouts.forEach(clearTimeout));
    }
};
exports.ThrottlerStorageService = ThrottlerStorageService;
exports.ThrottlerStorageService = ThrottlerStorageService = __decorate([
    (0, common_1.Injectable)()
], ThrottlerStorageService);
//# sourceMappingURL=throttler.service.js.map