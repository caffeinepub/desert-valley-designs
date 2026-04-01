import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: bigint;
    url: string;
    title: string;
    thumbnail: ExternalBlob;
    releasedAt: bigint;
    price: bigint;
}
export interface OrderV2 {
    id: bigint;
    status: string;
    name: string;
    submittedAt: bigint;
    email: string;
    cartItems: Array<CartItem>;
    notes: string;
    phone: string;
}
export interface LogoRequest {
    id: bigint;
    status: string;
    name: string;
    submittedAt: bigint;
    description: string;
    email: string;
    imageUrl: string;
    phone: string;
}
export interface CartItem {
    shirtColor: string;
    vinylColor: string;
    sizes: Array<[string, bigint]>;
    shirtType: string;
    category: string;
}
export interface NewOrder {
    name: string;
    email: string;
    cartItems: Array<CartItem>;
    notes: string;
    phone: string;
}
export interface NewLogoRequest {
    name: string;
    description: string;
    email: string;
    imageUrl: string;
    phone: string;
}
export interface Expense {
    id: bigint;
    date: bigint;
    category: string;
    description: string;
    amount: bigint;
    vendor: string;
    createdAt: bigint;
}
export interface NewExpense {
    date: bigint;
    category: string;
    description: string;
    amount: bigint;
    vendor: string;
}
export interface backendInterface {
    addVideo(title: string, url: string, thumbnail: ExternalBlob, price: bigint): Promise<bigint>;
    adminLogin(username: string, password: string): Promise<boolean>;
    getLogoRequests(): Promise<Array<LogoRequest>>;
    getOrders(): Promise<Array<OrderV2>>;
    getVideoLibrary(): Promise<Array<Video>>;
    submitLogoRequest(form: NewLogoRequest): Promise<bigint>;
    submitOrder(form: NewOrder): Promise<bigint>;
    updateLogoRequestStatus(id: bigint, status: string): Promise<boolean>;
    updateOrderStatus(id: bigint, status: string): Promise<boolean>;
    getAllOrderFinancials(): Promise<Array<[bigint, OrderFinancials]>>;
    updateOrderFinancials(id: bigint, financials: OrderFinancials): Promise<boolean>;
    getExpenses(): Promise<Array<Expense>>;
    addExpense(form: NewExpense): Promise<bigint>;
    deleteExpense(id: bigint): Promise<boolean>;
}
export interface OrderFinancials {
    totalPaid: bigint;
    depositPaid: bigint;
    paymentMethod: string;
    dateDelivered: bigint;
    costPerShirt: bigint;
    pricePerShirt: bigint;
    designNotes: string;
}
