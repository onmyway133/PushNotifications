/// <reference types="node" />
import { ExecFileOptions } from "child_process";
/** @private */
export declare function execWine(file: string, args: Array<string>, options?: ExecFileOptions): Promise<string>;
/** @private */
export declare function prepareWindowsExecutableArgs(args: Array<string>, exePath: string): string[];
/** @private */
export declare function checkWineVersion(checkPromise: Promise<string>): Promise<void>;
