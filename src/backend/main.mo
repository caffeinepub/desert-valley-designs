import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {

  /** Legacy type from v1 (kept for stable variable compatibility) **/

  type OrderV1 = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    sizes : [(Text, Nat)];
    shirtColor : Text;
    orderType : Text;
    notes : Text;
    status : Text;
    submittedAt : Int;
  };

  /** Apparel order types **/

  type CartItem = {
    shirtType : Text;
    shirtColor : Text;
    vinylColor : Text;
    sizes : [(Text, Nat)];
    category : Text;
  };

  type OrderV2 = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    cartItems : [CartItem];
    notes : Text;
    status : Text;
    submittedAt : Int;
  };

  type NewOrder = {
    name : Text;
    email : Text;
    phone : Text;
    cartItems : [CartItem];
    notes : Text;
  };

  /** Logo request types **/

  type LogoRequest = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    description : Text;
    imageUrl : Text;
    status : Text;
    submittedAt : Int;
  };

  type NewLogoRequest = {
    name : Text;
    email : Text;
    phone : Text;
    description : Text;
    imageUrl : Text;
  };

  /** Utilities **/

  module OrderUtil {
    public func compareBySubmittedAt(a : OrderV2, b : OrderV2) : Order.Order {
      Int.compare(b.submittedAt, a.submittedAt);
    };
  };

  module LogoUtil {
    public func compareBySubmittedAt(a : LogoRequest, b : LogoRequest) : Order.Order {
      Int.compare(b.submittedAt, a.submittedAt);
    };
  };

  func tryFindOrder(id : Nat) : OrderV2 {
    switch (ordersV2.get(id)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?o) { o };
    };
  };

  func tryFindLogoRequest(id : Nat) : LogoRequest {
    switch (logoRequests.get(id)) {
      case (null) { Runtime.trap("Logo request does not exist") };
      case (?r) { r };
    };
  };

  /** Stable state **/

  stable var orders : Map.Map<Nat, OrderV1> = Map.empty();
  stable var ordersV2 : Map.Map<Nat, OrderV2> = Map.empty();
  stable var logoRequests : Map.Map<Nat, LogoRequest> = Map.empty();
  stable var migrated = false;
  stable var nextOrderId = 1;
  stable var nextLogoRequestId = 1;
  let adminPassword = "DesertValley2024!";
  let adminUsername = "admin";

  /** Migration from v1 to v2 on upgrade **/

  system func postupgrade() {
    if (not migrated) {
      for (v in orders.values()) {
        let converted : OrderV2 = {
          id = v.id;
          name = v.name;
          email = v.email;
          phone = v.phone;
          notes = v.notes;
          status = v.status;
          submittedAt = v.submittedAt;
          cartItems = [{
            shirtType = v.orderType;
            shirtColor = v.shirtColor;
            vinylColor = "White";
            sizes = v.sizes;
            category = "work";
          }];
        };
        ordersV2.add(v.id, converted);
      };
      orders := Map.empty();
      migrated := true;
    };
  };

  /** Canister methods — Apparel Orders **/

  public shared func submitOrder(form : NewOrder) : async Nat {
    let o : OrderV2 = {
      id = nextOrderId;
      name = form.name;
      email = form.email;
      phone = form.phone;
      cartItems = form.cartItems;
      notes = form.notes;
      status = "Pending";
      submittedAt = Time.now();
    };
    ordersV2.add(nextOrderId, o);
    let currentId = nextOrderId;
    nextOrderId += 1;
    currentId;
  };

  public query func getOrders() : async [OrderV2] {
    ordersV2.values().toArray().sort(OrderUtil.compareBySubmittedAt);
  };

  public shared func updateOrderStatus(id : Nat, status : Text) : async Bool {
    let o = tryFindOrder(id);
    ordersV2.add(id, { o with status });
    true;
  };

  /** Canister methods — Logo Requests **/

  public shared func submitLogoRequest(form : NewLogoRequest) : async Nat {
    let r : LogoRequest = {
      id = nextLogoRequestId;
      name = form.name;
      email = form.email;
      phone = form.phone;
      description = form.description;
      imageUrl = form.imageUrl;
      status = "Pending";
      submittedAt = Time.now();
    };
    logoRequests.add(nextLogoRequestId, r);
    let currentId = nextLogoRequestId;
    nextLogoRequestId += 1;
    currentId;
  };

  public query func getLogoRequests() : async [LogoRequest] {
    logoRequests.values().toArray().sort(LogoUtil.compareBySubmittedAt);
  };

  public shared func updateLogoRequestStatus(id : Nat, status : Text) : async Bool {
    let r = tryFindLogoRequest(id);
    logoRequests.add(id, { r with status });
    true;
  };

  /** Auth **/

  public query func adminLogin(username : Text, password : Text) : async Bool {
    username == adminUsername and password == adminPassword;
  };
};
