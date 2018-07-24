export declare function download(url: string, output: string, checksum?: string | null): Promise<void>;
export declare function getBinFromGithub(name: string, version: string, checksum: string): Promise<string>;
export declare function getBin(name: string, url: string, checksum: string | null): Promise<string>;
