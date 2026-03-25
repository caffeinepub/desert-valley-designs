// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const CartItem = IDL.Record({
    'shirtType' : IDL.Text,
    'shirtColor' : IDL.Text,
    'vinylColor' : IDL.Text,
    'sizes' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
    'category' : IDL.Text,
  });
  const NewOrder = IDL.Record({
    'name' : IDL.Text,
    'email' : IDL.Text,
    'phone' : IDL.Text,
    'cartItems' : IDL.Vec(CartItem),
    'notes' : IDL.Text,
  });
  const Order = IDL.Record({
    'id' : IDL.Nat,
    'status' : IDL.Text,
    'name' : IDL.Text,
    'submittedAt' : IDL.Int,
    'email' : IDL.Text,
    'phone' : IDL.Text,
    'cartItems' : IDL.Vec(CartItem),
    'notes' : IDL.Text,
  });
  return IDL.Service({
    'adminLogin' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], ['query']),
    'getOrders' : IDL.Func([], [IDL.Vec(Order)], ['query']),
    'submitOrder' : IDL.Func([NewOrder], [IDL.Nat], []),
    'updateOrderStatus' : IDL.Func([IDL.Nat, IDL.Bool], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
