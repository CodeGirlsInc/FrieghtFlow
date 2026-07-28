import { inspect, InspectOptions } from "util";
import V2010 from "../../V2010";
import { ApiResponse } from "../../../../base/ApiResponse";
export interface BalanceSolution {
    accountSid: string;
}
export interface BalanceListInstance {
    _version: V2010;
    _solution: BalanceSolution;
    _uri: string;
    /**
     * Fetch a BalanceInstance
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed BalanceInstance
     */
    fetch(callback?: (error: Error | null, item?: BalanceInstance) => any): Promise<BalanceInstance>;
    /**
     * Fetch a BalanceInstance and return HTTP info
     *
     * @param callback - Callback to handle processed record
     *
     * @returns Resolves to processed BalanceInstance with HTTP metadata
     */
    fetchWithHttpInfo(callback?: (error: Error | null, item?: ApiResponse<BalanceInstance>) => any): Promise<ApiResponse<BalanceInstance>>;
    /**
     * Provide a user-friendly representation
     */
    toJSON(): any;
    [inspect.custom](_depth: any, options: InspectOptions): any;
}
export declare function BalanceListInstance(version: V2010, accountSid: string): BalanceListInstance;
interface BalanceResource {
    account_sid: string;
    balance: string;
    currency: string;
}
export declare class BalanceInstance {
    protected _version: V2010;
    constructor(_version: V2010, payload: BalanceResource, accountSid: string);
    /**
     * The unique SID identifier of the Account.
     */
    accountSid: string;
    /**
     * The balance of the Account, in units specified by the unit parameter. Balance changes may not be reflected immediately. Child accounts do not contain balance information
     */
    balance: string;
    /**
     * The units of currency for the account balance
     */
    currency: string;
    /**
     * Provide a user-friendly representation
     *
     * @returns Object
     */
    toJSON(): {
        accountSid: string;
        balance: string;
        currency: string;
    };
    [inspect.custom](_depth: any, options: InspectOptions): string;
}
export {};
