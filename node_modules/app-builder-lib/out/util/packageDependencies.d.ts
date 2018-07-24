/// <reference types="node" />
import { Stats } from "fs-extra-p";
import { Lazy } from "lazy-val";
export interface Dependency {
    name: string;
    version: string;
    path: string;
    extraneous: boolean;
    optional: boolean;
    dependencies: Map<string, Dependency> | null;
    directDependencyNames: Array<string> | null;
    peerDependencies: {
        [key: string]: any;
    } | null;
    optionalDependencies: {
        [key: string]: any;
    } | null;
    realName: string;
    link?: string;
    parent?: Dependency;
    stat?: Stats;
}
export declare function createLazyProductionDeps(projectDir: string): Lazy<Dependency[]>;
