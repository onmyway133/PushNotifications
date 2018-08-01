export declare enum Arch {
    ia32 = 0,
    x64 = 1,
    armv7l = 2,
    arm64 = 3
}
export declare type ArchType = "x64" | "ia32" | "armv7l" | "arm64";
export declare function toLinuxArchString(arch: Arch): string;
export declare function getArchCliNames(): Array<string>;
export declare function getArchSuffix(arch: Arch): string;
export declare function archFromString(name: string): Arch;
