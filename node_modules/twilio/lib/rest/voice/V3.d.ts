import VoiceBase from "../VoiceBase";
import Version from "../../base/Version";
import { TranscriptionListInstance } from "./v3/transcription";
export default class V3 extends Version {
    /**
     * Initialize the V3 version of Voice
     *
     * @param domain - The Twilio (Twilio.Voice) domain
     */
    constructor(domain: VoiceBase);
    /** transcriptions - { Twilio.Voice.V3.TranscriptionListInstance } resource */
    protected _transcriptions?: TranscriptionListInstance;
    /** Getter for transcriptions resource */
    get transcriptions(): TranscriptionListInstance;
}
