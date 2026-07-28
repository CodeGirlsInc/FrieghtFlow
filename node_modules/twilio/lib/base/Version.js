"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RestException_1 = __importDefault(require("./RestException"));
const TwilioServiceException_1 = __importDefault(require("./TwilioServiceException"));
const utility_1 = require("./utility");
class Version {
    /**
     *
     * Base version object
     *
     * @param domain - twilio domain
     * @param version - api version
     */
    constructor(domain, version) {
        this._domain = domain;
        this._version = version;
    }
    get domain() {
        return this._domain;
    }
    /**
     * Throws the appropriate exception based on the response format
     *
     * @param response - the response object
     * @throws TwilioServiceException if response matches RFC-9457 format
     * @throws RestException for legacy format
     */
    throwException(response) {
        const isResponseBodyString = typeof response.body === "string";
        let body = null;
        if (isResponseBodyString) {
            try {
                body = JSON.parse(response.body);
            }
            catch (e) {
                // If parsing fails, body remains null
            }
        }
        else {
            body = response.body;
        }
        // Check if response matches RFC-9457 format
        if (TwilioServiceException_1.default.isRFC9457Response(body)) {
            throw new TwilioServiceException_1.default(response);
        }
        // Fall back to legacy RestException
        throw new RestException_1.default(response);
    }
    /**
     * Generate absolute url from a uri
     *
     * @param uri - uri to transform
     * @returns transformed url
     */
    absoluteUrl(uri) {
        return this._domain.absoluteUrl(this.relativeUrl(uri));
    }
    /**
     * Generate relative url from a uri
     *
     * @param uri - uri to transform
     * @returns transformed url
     */
    relativeUrl(uri) {
        var result = "";
        if (typeof this._version === "string") {
            const version = (0, utility_1.trim)(this._version, "/");
            result += version;
            result += "/";
        }
        if (typeof uri === "string") {
            uri = (0, utility_1.trim)(uri, "/");
            if (result === "") {
                result += "/";
            }
            result += uri;
        }
        return result;
    }
    /**
     * Make a request against the domain
     *
     * @param opts - request options
     * @returns promise that resolves to request response
     */
    request(opts) {
        return this._domain.request({
            ...opts,
            uri: this.relativeUrl(opts.uri || ""),
        });
    }
    /**
     * Create a new record
     *
     * @param opts - request options
     *
     * @throws Error If response returns non 2xx or 201 status code
     *
     * @returns promise that resolves to created record
     */
    create(opts) {
        var qResponse = this.request(opts);
        qResponse = qResponse.then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                this.throwException(response);
            }
            if (typeof response.body === "string") {
                return JSON.parse(response.body);
            }
            return response.body;
        });
        return qResponse;
    }
    /**
     * Fetch an instance of a record
     *
     * @param opts - request options
     *
     * @throws Error If response returns non 2xx or 3xx status code
     *
     * @returns promise that resolves to fetched result
     */
    fetch(opts) {
        var qResponse = this.request(opts);
        qResponse = qResponse.then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 400) {
                this.throwException(response);
            }
            if (typeof response.body === "string") {
                return JSON.parse(response.body);
            }
            return response.body;
        });
        return qResponse;
    }
    /**
     * Fetch a page of records
     *
     * @param opts - request options
     * @returns promise that resolves to page of records
     */
    page(opts) {
        return this.request(opts);
    }
    /**
     * Update a record
     *
     * @param opts - request options
     *
     * @throws Error If response returns non 2xx status code
     *
     * @returns promise that resolves to updated result
     */
    update(opts) {
        var qResponse = this.request(opts);
        qResponse = qResponse.then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                this.throwException(response);
            }
            if (typeof response.body === "string") {
                return JSON.parse(response.body);
            }
            return response.body;
        });
        return qResponse;
    }
    /**
     * Patch a record
     *
     * @param opts - request options
     *
     * @throws Error If response returns non 2xx status code
     *
     * @returns promise that resolves to patched result
     */
    async patch(opts) {
        const response = await this.request(opts);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            this.throwException(response);
        }
        return typeof response.body === "string"
            ? JSON.parse(response.body)
            : response.body;
    }
    /**
     * Delete a record
     *
     * @param opts - request options
     *
     * @throws Error If response returns a 5xx status
     *
     * @returns promise that resolves to true if record was deleted
     */
    remove(opts) {
        let qResponse = this.request(opts);
        qResponse = qResponse.then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                this.throwException(response);
            }
            return true; // if response code is 2XX, deletion was successful
        });
        return qResponse;
    }
    /**
     * Create a new record and return response metadata
     *
     * @param opts - request options
     *
     * @throws TwilioServiceException if response matches RFC-9457 format
     * @throws RestException for legacy format
     * @throws Error If response returns non 2xx or 201 status code
     *
     * @returns promise that resolves to ApiResponse with created record and metadata
     */
    createWithResponseInfo(opts) {
        return this.request(opts).then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                this.throwException(response);
            }
            let body;
            if (typeof response.body === "string") {
                body = JSON.parse(response.body);
            }
            else {
                body = response.body;
            }
            return {
                body: body,
                statusCode: response.statusCode,
                headers: response.headers,
            };
        });
    }
    /**
     * Fetch an instance of a record and return response metadata
     *
     * @param opts - request options
     *
     * @throws TwilioServiceException if response matches RFC-9457 format
     * @throws RestException for legacy format
     * @throws Error If response returns non 2xx or 3xx status code
     *
     * @returns promise that resolves to ApiResponse with fetched record and metadata
     */
    fetchWithResponseInfo(opts) {
        return this.request(opts).then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 400) {
                this.throwException(response);
            }
            let body;
            if (typeof response.body === "string") {
                body = JSON.parse(response.body);
            }
            else {
                body = response.body;
            }
            return {
                body: body,
                statusCode: response.statusCode,
                headers: response.headers,
            };
        });
    }
    /**
     * Update a record and return response metadata
     *
     * @param opts - request options
     *
     * @throws TwilioServiceException if response matches RFC-9457 format
     * @throws RestException for legacy format
     * @throws Error If response returns non 2xx status code
     *
     * @returns promise that resolves to ApiResponse with updated record and metadata
     */
    updateWithResponseInfo(opts) {
        return this.request(opts).then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                this.throwException(response);
            }
            let body;
            if (typeof response.body === "string") {
                body = JSON.parse(response.body);
            }
            else {
                body = response.body;
            }
            return {
                body: body,
                statusCode: response.statusCode,
                headers: response.headers,
            };
        });
    }
    /**
     * Patch a record and return response metadata
     *
     * @param opts - request options
     *
     * @throws TwilioServiceException if response matches RFC-9457 format
     * @throws RestException for legacy format
     * @throws Error If response returns non 2xx status code
     *
     * @returns promise that resolves to ApiResponse with patched record and metadata
     */
    async patchWithResponseInfo(opts) {
        const response = await this.request(opts);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            this.throwException(response);
        }
        let body;
        if (typeof response.body === "string") {
            body = JSON.parse(response.body);
        }
        else {
            body = response.body;
        }
        return {
            body: body,
            statusCode: response.statusCode,
            headers: response.headers,
        };
    }
    /**
     * Delete a record and return response metadata
     *
     * @param opts - request options
     *
     * @throws TwilioServiceException if response matches RFC-9457 format
     * @throws RestException for legacy format
     * @throws Error If response returns a 5xx status
     *
     * @returns promise that resolves to ApiResponse with boolean and metadata
     */
    removeWithResponseInfo(opts) {
        return this.request(opts).then((response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                this.throwException(response);
            }
            return {
                body: true, // if response code is 2XX, deletion was successful
                statusCode: response.statusCode,
                headers: response.headers,
            };
        });
    }
    /**
     * Process limits for list requests
     *
     * @param opts.limit - The maximum number of items to fetch
     * @param opts.pageSize - The maximum number of items to return with every request
     *
     */
    readLimits(opts) {
        var limit = opts.limit;
        var pageSize = opts.pageSize;
        if ((limit && !Number.isFinite(limit)) || limit <= 0) {
            throw new TypeError("Parameter limit must be a positive integer");
        }
        if (pageSize && (!Number.isFinite(pageSize) || pageSize <= 0)) {
            throw new TypeError("Parameter pageSize must be a positive integer");
        }
        if (limit && !pageSize) {
            pageSize = limit;
        }
        return {
            limit: limit,
            pageSize: pageSize,
        };
    }
    setPromiseCallback(operationPromise, callback) {
        if (typeof callback === "function") {
            operationPromise = operationPromise
                .then((value) => callback(null, value))
                .catch((error) => callback(error));
        }
        return operationPromise;
    }
    /**
     * For each record instance, executes a provided callback function with that
     * instance
     *
     * @param params - Parameters (Optional)
     * @param params.limit - Optional maximum number of record instances to
     *  fetch
     * @param params.pageSize - Optional maximum number of records to return
     *  with every request
     * @param params.callback - Callback function to call with each
     *  record instance
     * @param params.done - Optional done function to call when all
     *  records are processed, the limit is reached, or an error occurs.
     *  Receives an error argument if an error occurs.
     * @param callback - Callback function to call with each record.
     *  Receives a done function argument that will short-circuit the for-each
     *  loop that may accept an error argument.
     * @returns Returns a promise that resolves when all records
     *  processed or if the limit is reached, and rejects with an error if an
     *  error occurs and is not handled in the user provided done function.
     */
    each(params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = {};
        }
        else {
            params = params || {};
        }
        if (params.callback) {
            callback = params.callback;
        }
        if (typeof callback === "undefined") {
            throw new Error("Callback function must be provided");
        }
        let done = false;
        let doneCalled = false;
        let currentPage = 1;
        let currentResource = 0;
        let limits = {};
        let pPending = true;
        let pResolve;
        let pReject;
        if (this._version instanceof Version) {
            limits = this._version.readLimits({
                limit: params.limit,
                pageSize: params.pageSize,
            });
        }
        function onComplete(error) {
            let unhandledError = error;
            done = true;
            if (typeof params.done === "function" && !doneCalled) {
                try {
                    params.done(unhandledError);
                    unhandledError = null;
                }
                catch (e) {
                    unhandledError = e;
                }
            }
            doneCalled = true;
            if (pPending) {
                if (unhandledError) {
                    pReject(unhandledError);
                }
                else {
                    pResolve();
                }
                pPending = false;
            }
        }
        function fetchNextPage(fn) {
            let promise = fn();
            if (typeof promise === "undefined") {
                onComplete();
                return;
            }
            promise
                .then((page) => {
                try {
                    page.instances.forEach(function (instance) {
                        if (done ||
                            (typeof params.limit !== "undefined" &&
                                currentResource >= params.limit)) {
                            done = true;
                            return false;
                        }
                        currentResource++;
                        callback?.(instance, onComplete);
                    });
                }
                catch (e) {
                    return onComplete(e);
                }
                if (!done) {
                    currentPage++;
                    fetchNextPage(page.nextPage.bind(page));
                }
                else {
                    onComplete();
                }
            })
                .catch(onComplete);
        }
        return new Promise((resolve, reject) => {
            pResolve = resolve;
            pReject = reject;
            fetchNextPage(this.page.bind(this, Object.assign(params, limits)));
        });
    }
    list(params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = {};
        }
        else {
            params = params || {};
        }
        let allResources = [];
        params.callback = function (resource, done) {
            allResources.push(resource);
            if (typeof params.limit !== "undefined" &&
                allResources.length === params.limit) {
                done();
            }
        };
        let operationPromise = new Promise((resolve, reject) => {
            params.done = function (error) {
                if (typeof error === "undefined") {
                    resolve(allResources);
                }
                else {
                    reject(error);
                }
            };
        });
        if (this._version instanceof Version) {
            operationPromise = this._version.setPromiseCallback(operationPromise, callback);
        }
        this.each(params);
        return operationPromise;
    }
    /**
     * For each record instance, executes a provided callback function with that
     * instance and captures HTTP response metadata from the first page
     *
     * @param params - Parameters (Optional)
     * @param params.limit - Optional maximum number of record instances to
     *  fetch
     * @param params.pageSize - Optional maximum number of records to return
     *  with every request
     * @param params.callback - Callback function to call with each
     *  record instance
     * @param params.done - Optional done function to call when all
     *  records are processed, the limit is reached, or an error occurs.
     *  Receives an error argument if an error occurs, and ApiResponse metadata.
     * @param callback - Callback function to call with each record.
     *  Receives a done function argument that will short-circuit the for-each
     *  loop that may accept an error argument.
     * @returns Returns a promise that resolves with first page metadata when all records
     *  processed or if the limit is reached, and rejects with an error if an
     *  error occurs and is not handled in the user provided done function.
     */
    eachWithHttpInfo(params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = {};
        }
        else {
            params = params || {};
        }
        if (params.callback) {
            callback = params.callback;
        }
        if (typeof callback === "undefined") {
            throw new Error("Callback function must be provided");
        }
        let done = false;
        let doneCalled = false;
        let currentPage = 1;
        let currentResource = 0;
        let limits = {};
        let pPending = true;
        let pResolve;
        let pReject;
        let firstPageMetadata = null;
        if (this._version instanceof Version) {
            limits = this._version.readLimits({
                limit: params.limit,
                pageSize: params.pageSize,
            });
        }
        function onComplete(error) {
            let unhandledError = error;
            done = true;
            if (typeof params.done === "function" && !doneCalled) {
                try {
                    params.done(unhandledError, firstPageMetadata);
                    unhandledError = null;
                }
                catch (e) {
                    unhandledError = e;
                }
            }
            doneCalled = true;
            if (pPending) {
                if (unhandledError) {
                    pReject(unhandledError);
                }
                else {
                    // firstPageMetadata is guaranteed to be set here because:
                    // 1. If no page was fetched, we already rejected with error
                    // 2. If page was fetched, firstPageMetadata was set in the .then() handler
                    pResolve({
                        body: undefined,
                        statusCode: firstPageMetadata.statusCode,
                        headers: firstPageMetadata.headers,
                    });
                }
                pPending = false;
            }
        }
        function fetchNextPageWithInfo(fn) {
            let promise = fn();
            if (typeof promise === "undefined" || promise === null) {
                // If this is the first page and we got null/undefined, that's an error
                // If this is a subsequent page, null means "no more pages" (success)
                if (currentPage === 1) {
                    pReject(new Error("Page method did not return a Promise"));
                    pPending = false;
                }
                else {
                    onComplete();
                }
                return;
            }
            promise
                .then((response) => {
                // Handle both cases:
                // 1. Version.page() returns { statusCode, body, headers }
                // 2. Resource.page() returns Page object directly
                let pageData = response.body !== undefined ? response.body : response;
                // Capture first page metadata on first page
                if (currentPage === 1 && !firstPageMetadata) {
                    if (response.statusCode !== undefined) {
                        // Case 1: Response structure with metadata
                        firstPageMetadata = {
                            statusCode: response.statusCode,
                            headers: response.headers || {},
                        };
                    }
                    else {
                        // Case 2: Direct Page object (no metadata available)
                        firstPageMetadata = {
                            statusCode: 200,
                            headers: {},
                        };
                    }
                }
                // Parse body if it's a string
                if (typeof pageData === "string") {
                    pageData = JSON.parse(pageData);
                }
                try {
                    pageData.instances.forEach(function (instance) {
                        if (done ||
                            (typeof params.limit !== "undefined" &&
                                currentResource >= params.limit)) {
                            done = true;
                            return false;
                        }
                        currentResource++;
                        callback?.(instance, onComplete);
                    });
                }
                catch (e) {
                    return onComplete(e);
                }
                if (!done) {
                    currentPage++;
                    // Page's nextPage method should already return response structure
                    const nextPageFn = pageData.nextPage?.bind(pageData);
                    if (nextPageFn) {
                        fetchNextPageWithInfo(nextPageFn);
                    }
                    else {
                        onComplete();
                    }
                }
                else {
                    onComplete();
                }
            })
                .catch(onComplete);
        }
        return new Promise((resolve, reject) => {
            pResolve = resolve;
            pReject = reject;
            const pageParams = Object.assign({}, params, limits);
            fetchNextPageWithInfo(() => {
                // Use pageWithHttpInfo() if available to capture HTTP metadata, otherwise use page()
                // When called from resources, this.pageWithHttpInfo exists and returns { statusCode, body, headers }
                // When called from Version directly, this.page returns { statusCode, body, headers }
                if (typeof this.pageWithHttpInfo === "function") {
                    return this.pageWithHttpInfo(pageParams);
                }
                return this.page(pageParams);
            });
        });
    }
    /**
     * Fetches all records and returns them as an array with HTTP response metadata
     * from the first page
     *
     * @param params - Parameters (Optional)
     * @param params.limit - Optional maximum number of record instances to fetch
     * @param params.pageSize - Optional maximum number of records to return with every request
     * @param callback - Optional callback function
     * @returns Promise that resolves to ApiResponse with array of all records and first page metadata
     */
    listWithHttpInfo(params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = {};
        }
        else {
            params = params || {};
        }
        let allResources = [];
        let firstPageMetadata = null;
        params.callback = function (resource, done) {
            allResources.push(resource);
            if (typeof params.limit !== "undefined" &&
                allResources.length === params.limit) {
                done();
            }
        };
        let operationPromise = new Promise((resolve, reject) => {
            params.done = function (error, metadata) {
                if (metadata) {
                    firstPageMetadata = metadata;
                }
                if (typeof error === "undefined") {
                    // firstPageMetadata is guaranteed to be set here because:
                    // eachWithHttpInfo either:
                    // 1. Rejects with error (no page fetched)
                    // 2. Passes metadata to done callback (page was fetched)
                    resolve({
                        body: allResources,
                        statusCode: firstPageMetadata.statusCode,
                        headers: firstPageMetadata.headers,
                    });
                }
                else {
                    reject(error);
                }
            };
        });
        if (this._version instanceof Version) {
            operationPromise = this._version.setPromiseCallback(operationPromise, callback);
        }
        this.eachWithHttpInfo(params);
        return operationPromise;
    }
}
exports.default = Version;
