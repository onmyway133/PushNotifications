import { Arch } from "builder-util";
import { Lazy } from "lazy-val";
import { FileTransformer } from "builder-util/out/fs";
import { AfterPackContext } from "./configuration";
import { Target } from "./core";
import { RequestedExecutionLevel, WindowsConfiguration } from "./options/winOptions";
import { Packager } from "./packager";
import { PlatformPackager } from "./platformPackager";
import { VmManager } from "./vm/vm";
import { CertificateFromStoreInfo, FileCodeSigningInfo } from "./windowsCodeSign";
export declare class WinPackager extends PlatformPackager<WindowsConfiguration> {
    readonly cscInfo: Lazy<FileCodeSigningInfo | CertificateFromStoreInfo | null>;
    private _iconPath;
    readonly vm: Lazy<VmManager>;
    readonly computedPublisherSubjectOnWindowsOnly: Lazy<string | null>;
    readonly computedPublisherName: Lazy<string[] | null>;
    readonly isForceCodeSigningVerification: boolean;
    constructor(info: Packager);
    readonly defaultTarget: Array<string>;
    protected doGetCscPassword(): string | undefined | null;
    createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void): void;
    getIconPath(): Promise<string | null>;
    sign(file: string, logMessagePrefix?: string): Promise<void>;
    private doSign;
    signAndEditResources(file: string, arch: Arch, outDir: string, internalName?: string | null, requestedExecutionLevel?: RequestedExecutionLevel | null): Promise<void>;
    private isSignDlls;
    protected createTransformerForExtraFiles(packContext: AfterPackContext): FileTransformer | null;
    protected signApp(packContext: AfterPackContext, isAsar: boolean): Promise<any>;
}
