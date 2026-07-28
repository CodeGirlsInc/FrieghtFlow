import OauthBase from "../OauthBase";
import Version from "../../base/Version";
import { AuthorizeListInstance } from "./v2/authorize";
import { TokenListInstance } from "./v2/token";
export default class V2 extends Version {
    /**
     * Initialize the V2 version of Oauth
     *
     * @param domain - The Twilio (Twilio.Oauth) domain
     */
    constructor(domain: OauthBase);
    /** authorize - { Twilio.Oauth.V2.AuthorizeListInstance } resource */
    protected _authorize?: AuthorizeListInstance;
    /** token - { Twilio.Oauth.V2.TokenListInstance } resource */
    protected _token?: TokenListInstance;
    /** Getter for authorize resource */
    get authorize(): AuthorizeListInstance;
    /** Getter for token resource */
    get token(): TokenListInstance;
}
