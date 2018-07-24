import { Arch } from "builder-util";
import { PlatformSpecificBuildOptions, Platform, Target } from "../index";
import { PlatformPackager } from "../platformPackager";
export declare function computeArchToTargetNamesMap(raw: Map<Arch, Array<string>>, options: PlatformSpecificBuildOptions, platform: Platform): Map<Arch, Array<string>>;
export declare function createTargets(nameToTarget: Map<string, Target>, rawList: Array<string>, outDir: string, packager: PlatformPackager<any>): Array<Target>;
export declare function createCommonTarget(target: string, outDir: string, packager: PlatformPackager<any>): Target;
export declare class NoOpTarget extends Target {
    readonly options: null;
    constructor(name: string);
    readonly outDir: string;
    build(appOutDir: string, arch: Arch): Promise<any>;
}
