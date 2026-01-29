const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

if (process.env.NODE_ENV === "development" && !rawBaseUrl) {
    console.warn(
        "NEXT_PUBLIC_API_BASE_URL is not set. API calls to relative paths will fail until it is configured."
    );
}

const baseUrl = normalizeBaseUrl(rawBaseUrl);
const isDev = process.env.NODE_ENV === "development";

export class ApiError<TData = unknown> extends Error {
    readonly status: number;
    readonly data: TData | undefined;
    readonly method: HttpMethod;
    readonly url: string;

    constructor(props: ApiErrorProps<TData>) {
        super(props.message ?? `Request to ${props.method} ${props.url} failed with ${props.status}`);
        this.name = "ApiError";
        this.status = props.status;
        this.data = props.data;
        this.method = props.method;
        this.url = props.url;
    }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QueryParamValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export interface ApiRequestOptions<TBody> {
    readonly body?: TBody;
    readonly headers?: HeadersInit;
    readonly query?: QueryParams;
    readonly signal?: AbortSignal;
    readonly log?: boolean;
}

export interface ApiErrorProps<TData> {
    readonly status: number;
    readonly data?: TData;
    readonly method: HttpMethod;
    readonly url: string;
    readonly message?: string;
}

export interface ApiClient {
    readonly request: <TResponse, TBody = unknown>(
        method: HttpMethod,
        path: string,
        options?: ApiRequestOptions<TBody>
    ) => Promise<TResponse>;
    readonly get: <TResponse>(path: string, options?: ApiRequestOptions<undefined>) => Promise<TResponse>;
    readonly post: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) => Promise<TResponse>;
    readonly put: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) => Promise<TResponse>;
    readonly patch: <TResponse, TBody = unknown>(
        path: string,
        options?: ApiRequestOptions<TBody>
    ) => Promise<TResponse>;
    readonly delete: <TResponse>(path: string, options?: ApiRequestOptions<undefined>) => Promise<TResponse>;
}

const request = requestFactory();

function createMethod(method: HttpMethod) {
    return <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) =>
        request<TResponse, TBody>(method, path, options);
}

function requestFactory(): ApiClient["request"] {
    return async <TResponse, TBody = unknown>(
        method: HttpMethod,
        path: string,
        options?: ApiRequestOptions<TBody>
    ): Promise<TResponse> => {
        const url = buildUrl(path, options?.query);
        const headers = new Headers(options?.headers);

            // Attach Authorization header from localStorage when running in browser
            try {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("auth_token");
                    if (token && !headers.has("Authorization")) {
                        headers.set("Authorization", `Bearer ${token}`);
                    }
                }
            } catch (err) {
                // ignore storage errors
            }
        const body = serializeBody(options?.body, headers);
        const shouldLog = (options?.log ?? true) && isDev;

        if (shouldLog) {
            logRequest(method, url, options?.body, headers);
        }

        const response = await fetch(url, {
            method,
            headers,
            body,
            signal: options?.signal,
        });

        const responsePayload = await parseResponsePayload<TResponse>(response);

        if (!response.ok) {
            const error = new ApiError({
                status: response.status,
                data: responsePayload,
                method,
                url,
            });

            if (shouldLog) {
                console.error(`[api] ${method} ${url} failed`, error);
            }

            throw error;
        }

        if (shouldLog) {
            console.info(`[api] ${method} ${url} succeeded`, responsePayload);
        }

        return responsePayload;
    };
}

function normalizeBaseUrl(url?: string | null): string | undefined {
    if (!url) {
        return undefined;
    }

    return url.endsWith("/") ? url.slice(0, -1) : url;
}

function buildUrl(path: string, query?: QueryParams): string {
    const hasAbsolutePath = /^https?:\/\//i.test(path);
    if (!hasAbsolutePath && !baseUrl) {
        throw new Error(
            "Cannot perform API request because NEXT_PUBLIC_API_BASE_URL is not configured and a relative path was provided."
        );
    }

    const trimmedPath = hasAbsolutePath ? path : `${baseUrl}/${path.replace(/^\/+/, "")}`;

    if (!query || Object.keys(query).length === 0) {
        return trimmedPath;
    }

    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (item === undefined || item === null) continue;
                search.append(key, String(item));
            }
            continue;
        }

        search.append(key, String(value));
    }

    const queryString = search.toString();
    return queryString ? `${trimmedPath}?${queryString}` : trimmedPath;
}

function serializeBody<TBody>(body: TBody | undefined, headers: Headers): BodyInit | undefined {
    if (body === undefined || body === null) {
        return undefined;
    }

    if (isBodyInit(body)) {
        return body;
    }

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return JSON.stringify(body);
}

function isBodyInit(value: unknown): value is BodyInit {
    if (typeof value === "string") return true;
    if (typeof Blob !== "undefined" && value instanceof Blob) return true;
    if (typeof FormData !== "undefined" && value instanceof FormData) return true;
    if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) return true;
    if (value instanceof ArrayBuffer) return true;
    if (ArrayBuffer.isView(value)) return true;
    return false;
}

async function parseResponsePayload<T>(response: Response): Promise<T> {
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return (await response.json()) as T;
    }

    const text = await response.text();
    return text ? (text as unknown as T) : (undefined as T);
}

function logRequest(method: HttpMethod, url: string, body: unknown, headers: Headers): void {
    const headerEntries = Object.fromEntries(headers.entries());
    console.info(`[api] ${method} ${url}`, { headers: headerEntries, body });
}

export const apiClient: ApiClient = {
    request,
    get: createMethod("GET"),
    post: createMethod("POST"),
    put: createMethod("PUT"),
    patch: createMethod("PATCH"),
    delete: createMethod("DELETE"),
};

export default apiClient;