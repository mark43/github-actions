"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegexpFromStrings = (filters) => new RegExp(filters.join('|'), 'i');
