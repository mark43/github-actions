"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns the value for a given marker in a string or `undefined` if nothing is found
 * @param marker
 * @param text
 */
exports.getValueForMarker = (marker, text) => {
    const start = `<!--${marker}_start-->`;
    const end = `<!--${marker}_end-->`;
    const markerRegexp = new RegExp(`${start}(.*?)${end}`, 'i');
    const result = text.match(markerRegexp);
    if (result) {
        return result[1];
    }
    return undefined;
};
