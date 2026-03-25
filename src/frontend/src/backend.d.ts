import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CartItem {
    shirtType: string;
    shirtColor: string;
    vinylColor: string;
    sizes: Array<[string, bigint]>;
    category: string;
}
export interface NewOrder {
    name: string;
    email: string;
    phone: string;
    cartItems: Array<CartItem>;
    notes: string;
}
export interface OrderV2 {
    id: bigint;
    status: string;
    name: string;
    email: string;
    phone: string;
    cartItems: Array<CartItem>;
    notes: string;
    submittedAt: bigint;
}
export interface NewLogoRequest {
    name: string;
    email: string;
    phone: string;
    description: string;
    imageUrl: string;
}
export interface LogoRequest {
    id: bigint;
    name: string;
    email: string;
    phone: string;
    description: string;
    imageUrl: string;
    status: string;
    submittedAt: bigint;
}
export interface backendInterface {
    adminLogin(username: string, password: string): Promise<boolean>;
    getOrders(): Promise<Array<OrderV2>>;
    submitOrder(form: NewOrder): Promise<bigint>;
    updateOrderStatus(id: bigint, status: string): Promise<boolean>;
    submitLogoRequest(form: NewLogoRequest): Promise<bigint>;
    getLogoRequests(): Promise<Array<LogoRequest>>;
    updateLogoRequestStatus(id: bigint, status: string): Promise<boolean>;
}
