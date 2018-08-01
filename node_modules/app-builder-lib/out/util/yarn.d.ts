/// <reference types="node" />
import { Lazy } from "lazy-val";
import { Configuration } from "../configuration";
import { Dependency } from "./packageDependencies";
export declare function installOrRebuild(config: Configuration, appDir: string, options: RebuildOptions, forceInstall?: boolean): Promise<void>;
export interface DesktopFrameworkInfo {
    version: string;
    useCustomDist: boolean;
}
export declare function getGypEnv(frameworkInfo: DesktopFrameworkInfo, platform: NodeJS.Platform, arch: string, buildFromSource: boolean): any;
export interface RebuildOptions {
    frameworkInfo: DesktopFrameworkInfo;
    productionDeps?: Lazy<Array<Dependency>>;
    platform?: NodeJS.Platform;
    arch?: string;
    buildFromSource?: boolean;
    additionalArgs?: Array<string> | null;
}
