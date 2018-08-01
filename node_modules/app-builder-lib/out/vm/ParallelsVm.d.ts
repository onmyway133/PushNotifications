export declare function macPathToParallelsWindows(file: string): string;
export interface ParallelsVm {
    id: string;
    name: string;
    os: "win-10" | "ubuntu" | "elementary";
    state: "running" | "suspended" | "stopped";
}
