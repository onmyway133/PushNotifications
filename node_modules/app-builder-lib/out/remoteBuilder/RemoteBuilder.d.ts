import { Arch } from "builder-util";
import { UploadTask } from "electron-publish/out/publisher";
import { Target } from "../core";
import { PlatformPackager } from "../platformPackager";
export declare class RemoteBuilder {
    readonly packager: PlatformPackager<any>;
    private readonly toBuild;
    private buildStarted;
    constructor(packager: PlatformPackager<any>);
    scheduleBuild(target: Target, arch: Arch, unpackedDirectory: string): void;
    build(): Promise<any>;
    private _build;
    private artifactInfoToArtifactCreatedEvent;
}
interface ArtifactInfo extends UploadTask {
    target: string | null;
    readonly isWriteUpdateInfo?: boolean;
    readonly updateInfo?: any;
}
export interface RemoteBuilderResponse {
    files: Array<ArtifactInfo> | null;
    error: string | null;
}
export {};
