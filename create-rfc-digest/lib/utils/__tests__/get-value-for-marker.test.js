"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_value_for_marker_1 = require("../get-value-for-marker");
describe('get-value-for-marker', () => {
    it('should return the value from a marker if it exists', () => {
        const given = `some text with <!--test_marker_start-->VALUE<!--test_marker_end-->`;
        expect(get_value_for_marker_1.getValueForMarker('test_marker', given)).toBe('VALUE');
    });
    it('should return `undefined` if marker cannot be found', () => {
        const given = `some text with`;
        expect(get_value_for_marker_1.getValueForMarker('test_marker', given)).toBe(undefined);
    });
    it('should return first instance of marker if marker is used multiple times ', () => {
        const given = `some text with <!--test_marker_start-->A<!--test_marker_end--><!--test_marker_start-->B<!--test_marker_end-->`;
        expect(get_value_for_marker_1.getValueForMarker('test_marker', given)).toBe('A');
    });
});
