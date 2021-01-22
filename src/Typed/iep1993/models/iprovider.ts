interface RequestArguments {
    method: string;
    params?: unknown[] | object;
}

export interface IProvider {
    request<T>(request: RequestArguments): T
    on<T>(method: string, callback: ((value: T) => void)): void;
}
