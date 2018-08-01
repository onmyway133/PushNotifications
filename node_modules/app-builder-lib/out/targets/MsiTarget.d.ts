import { Arch } from "builder-util";
import { MsiOptions } from "../";
import { Target } from "../core";
import { WinPackager } from "../winPackager";
export default class MsiTarget extends Target {
    private readonly packager;
    readonly outDir: string;
    private readonly vm;
    readonly options: MsiOptions;
    constructor(packager: WinPackager, outDir: string);
    build(appOutDir: string, arch: Arch): Promise<void>;
    private light;
    private getCommonWixArgs;
    private writeManifest;
    private computeFileDeclaration;
}
