import { TmpDir } from "builder-util";
export declare const appleCertificatePrefixes: string[];
export declare type CertType = "Developer ID Application" | "Developer ID Installer" | "3rd Party Mac Developer Application" | "3rd Party Mac Developer Installer" | "Mac Developer";
export interface CodeSigningInfo {
    keychainName?: string | null;
}
export declare function isSignAllowed(isPrintWarn?: boolean): boolean;
export declare function reportError(isMas: boolean, certificateType: CertType, qualifier: string | null | undefined, keychainName: string | null | undefined, isForceCodeSigning: boolean): Promise<void>;
/** @private */
export declare function downloadCertificate(urlOrBase64: string, tmpDir: TmpDir, currentDir: string): Promise<string>;
export interface CreateKeychainOptions {
    tmpDir: TmpDir;
    cscLink: string;
    cscKeyPassword: string;
    cscILink?: string | null;
    cscIKeyPassword?: string | null;
    currentDir: string;
}
export declare function createKeychain({ tmpDir, cscLink, cscKeyPassword, cscILink, cscIKeyPassword, currentDir }: CreateKeychainOptions): Promise<CodeSigningInfo>;
/** @private */
export declare function sign(path: string, name: string, keychain: string): Promise<any>;
export declare let findIdentityRawResult: Promise<Array<string>> | null;
export declare class Identity {
    readonly name: string;
    readonly hash: string;
    constructor(name: string, hash: string);
}
export declare function findIdentity(certType: CertType, qualifier?: string | null, keychain?: string | null): Promise<Identity | null>;
