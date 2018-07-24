import { DebugLogger } from "builder-util";
import { Lazy } from "lazy-val";
import { Configuration } from "../configuration";
export declare function getConfig(projectDir: string, configPath: string | null, configFromOptions: Configuration | null | undefined, packageMetadata?: Lazy<{
    [key: string]: any;
} | null>): Promise<Configuration>;
export declare function validateConfig(config: Configuration, debugLogger: DebugLogger): Promise<void>;
export declare function computeDefaultAppDirectory(projectDir: string, userAppDir: string | null | undefined): Promise<string>;
