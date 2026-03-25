import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";

import List "mo:core/List";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  include MixinStorage();

  // old types - only kept for migration and never ever use again
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

  // New types

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

  type Video = {
    id : Nat;
    title : Text;
    url : Text;
    thumbnail : Storage.ExternalBlob;
    price : Nat;
    releasedAt : Int;
  };

  type Empty = {};

  // tooling

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

  // state

  var orders = Map.empty<Nat, OrderV1>();
  var ordersV2 = Map.empty<Nat, OrderV2>();
  var logoRequests = Map.empty<Nat, LogoRequest>();
  var videos = Map.empty<Nat, Video>();
  var nextOrderId = 1;
  var nextLogoRequestId = 1;
  var nextVideoId = 1;
  let adminPassword = "DesertValley2024!";
  let adminUsername = "admin";

  // methods

  func tryFindOrder(id : Nat) : OrderV2 {
    switch (ordersV2.get(id)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?o) { o };
    };
  };

  func tryFindLogoRequest(id : Nat) : LogoRequest {
    switch (logoRequests.get(id)) {
      case (null) { Runtime.trap("Logo request does not exist") };
      case (?lr) { lr };
    };
  };

  func tryFindVideo(id : Nat) : Video {
    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video does not exist") };
      case (?v) { v };
    };
  };

  // Queries

  public query func getOrders() : async [OrderV2] {
    ordersV2.values().toArray().sort(OrderUtil.compareBySubmittedAt);
  };

  public query func getLogoRequests() : async [LogoRequest] {
    logoRequests.values().toArray().sort(LogoUtil.compareBySubmittedAt);
  };

  public query func getVideoLibrary() : async [Video] {
    videos.values().toArray();
  };

  // Mutations

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

  public shared func updateOrderStatus(id : Nat, status : Text) : async Bool {
    let o = tryFindOrder(id);
    ordersV2.add(id, { o with status });
    true;
  };

  public shared func submitLogoRequest(form : NewLogoRequest) : async Nat {
    let request : LogoRequest = {
      id = nextLogoRequestId;
      name = form.name;
      email = form.email;
      phone = form.phone;
      description = form.description;
      imageUrl = form.imageUrl;
      status = "open";
      submittedAt = Time.now();
    };
    logoRequests.add(nextLogoRequestId, request);
    let currentId = nextLogoRequestId;
    nextLogoRequestId += 1;
    currentId;
  };

  public shared func updateLogoRequestStatus(id : Nat, status : Text) : async Bool {
    let request = tryFindLogoRequest(id);
    logoRequests.add(id, { request with status });
    true;
  };

  public shared func addVideo(title : Text, url : Text, thumbnail : Storage.ExternalBlob, price : Nat) : async Nat {
    let video : Video = {
      id = nextVideoId;
      title;
      url;
      thumbnail;
      price;
      releasedAt = Time.now();
    };
    videos.add(nextVideoId, video);
    let currentId = nextVideoId;
    nextVideoId += 1;
    currentId;
  };

  // Auth endpoint

  public query func adminLogin(username : Text, password : Text) : async Bool {
    username == adminUsername and password == adminPassword;
  };
};
