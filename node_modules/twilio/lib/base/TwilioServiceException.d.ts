interface ValidationError {
    detail: string;
    pointer: string;
}
interface TwilioServiceErrorResponse {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    code: number;
    errors?: ValidationError[];
}
export default class TwilioServiceException extends Error implements TwilioServiceErrorResponse {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    code: number;
    errors?: ValidationError[];
    constructor(response: any);
    /**
     * Check if a response body matches the RFC-9457 structure
     * @param body - The response body to check
     * @returns true if the body has the required RFC-9457 fields
     */
    static isRFC9457Response(body: any): boolean;
}
export {};
