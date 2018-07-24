import { LinuxTargetSpecificOptions } from "..";
import { LinuxPackager } from "../linuxPackager";
import { IconInfo } from "../platformPackager";
export declare const installPrefix = "/opt";
export declare class LinuxTargetHelper {
    private packager;
    private readonly iconPromise;
    maxIconPath: string | null;
    constructor(packager: LinuxPackager);
    readonly icons: Promise<Array<IconInfo>>;
    private computeDesktopIcons;
    getDescription(options: LinuxTargetSpecificOptions): string;
    writeDesktopEntry(targetSpecificOptions: LinuxTargetSpecificOptions, exec?: string, destination?: string | null, extra?: {
        [key: string]: string;
    }): Promise<string>;
    computeDesktopEntry(targetSpecificOptions: LinuxTargetSpecificOptions, exec?: string, extra?: {
        [key: string]: string;
    }): Promise<string>;
}
