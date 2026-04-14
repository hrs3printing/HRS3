import { useEffect, useState, useCallback, memo } from "react";
import toast from "react-hot-toast";
import { getAdminOrders, patchAdminOrder } from "../api/adminApi";

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (order, field) => {
    const next =
      field === "paid" ? !order.isPaid : !order.isDelivered;
    try {
      const body =
        field === "paid"
          ? { isPaid: next, isDelivered: !!order.isDelivered }
          : { isPaid: !!order.isPaid, isDelivered: next };
      const updated = await patchAdminOrder(order._id, body);
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o)),
      );
      toast.success("Order updated");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading orders…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Orders</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {orders.length} orders (newest first)
      </p>

      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs text-zinc-500">
                    {fmtDate(order.createdAt)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-400">
                    {order._id}
                  </p>
                  <p className="mt-2 text-sm text-zinc-300">
                    {order.user?.name || "—"}{" "}
                    <span className="text-zinc-500">
                      ({order.user?.email || "—"})
                    </span>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-semibold text-white">
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {order.paymentMethod || "cod"}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
                {order.items?.map((line, i) => (
                  <li key={i}>
                    {line.product?.name || "Product"} × {line.qty}
                    {line.product?.price != null && (
                      <span className="text-zinc-600">
                        {" "}
                        @ ₹{line.product.price}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-800 pt-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!order.isPaid}
                    onChange={() => toggle(order, "paid")}
                    className="rounded border-zinc-600"
                  />
                  <span className="text-zinc-300">Paid</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!order.isDelivered}
                    onChange={() => toggle(order, "delivered")}
                    className="rounded border-zinc-600"
                  />
                  <span className="text-zinc-300">Delivered</span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default memo(Orders);
