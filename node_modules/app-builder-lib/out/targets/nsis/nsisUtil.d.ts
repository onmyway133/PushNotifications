import { Arch } from "builder-util";
import { PackageFileInfo } from "builder-util-runtime";
import { Lazy } from "lazy-val";
import { NsisTarget } from "./NsisTarget";
export declare const nsisTemplatesDir: string;
export declare const NSIS_PATH: Lazy<string>;
export declare class AppPackageHelper {
    private readonly elevateHelper;
    private readonly archToFileInfo;
    private readonly infoToIsDelete;
    /** @private */
    refCount: number;
    constructor(elevateHelper: CopyElevateHelper);
    packArch(arch: Arch, target: NsisTarget): Promise<PackageFileInfo>;
    finishBuild(): Promise<any>;
}
export declare class CopyElevateHelper {
    private readonly copied;
    copy(appOutDir: string, target: NsisTarget): Promise<any>;
}
