import { Arch } from "builder-util";
import { Target, DmgOptions } from "app-builder-lib";
import MacPackager from "app-builder-lib/out/macPackager";
export declare class DmgTarget extends Target {
    private readonly packager;
    readonly outDir: string;
    readonly options: DmgOptions;
    constructor(packager: MacPackager, outDir: string);
    build(appPath: string, arch: Arch): Promise<void>;
    private signDmg;
    computeVolumeName(custom?: string | null): string;
    computeDmgOptions(): Promise<DmgOptions>;
}
