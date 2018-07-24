export interface AsarIntegrityOptions {
    /**
     * Allows external asar files.
     *
     * @default false
     */
    readonly externalAllowed?: boolean;
}
export interface AsarIntegrity extends AsarIntegrityOptions {
    checksums: {
        [key: string]: string;
    };
}
export declare function computeData(resourcesPath: string, options?: AsarIntegrityOptions | null): Promise<AsarIntegrity>;
