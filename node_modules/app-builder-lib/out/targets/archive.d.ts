import { CompressionLevel } from "../core";
export interface ArchiveOptions {
    compression?: CompressionLevel | null;
    /**
     * @default false
     */
    withoutDir?: boolean;
    /**
     * @default true
     */
    solid?: boolean;
    /**
     * @default true
     */
    isArchiveHeaderCompressed?: boolean;
    listFile?: string;
    dictSize?: number;
    excluded?: Array<string> | null;
    method?: "Copy" | "LZMA" | "Deflate" | "DEFAULT";
    isRegularFile?: boolean;
}
export declare function compute7zCompressArgs(format: string, options?: ArchiveOptions): string[];
