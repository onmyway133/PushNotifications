import { Arch } from "builder-util";
import { PackagerOptions, Platform } from "app-builder-lib";
import { PublishOptions } from "electron-publish";
export interface CliOptions extends PackagerOptions, PublishOptions {
    arch?: string;
    x64?: boolean;
    ia32?: boolean;
    armv7l?: boolean;
    arm64?: boolean;
    dir?: boolean;
    platform?: string;
}
/** @private */
export declare function coerceTypes(host: any): any;
export declare function createTargets(platforms: Array<Platform>, type?: string | null, arch?: string | null): Map<Platform, Map<Arch, Array<string>>>;
export declare function build(rawOptions?: CliOptions): Promise<Array<string>>;
