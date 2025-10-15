// src/pages/OrderPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// ✅ Replace with your real Stripe key
const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX");

// --- Stripe Checkout Form ---
function CheckoutForm({ amount, customerName, customerEmail, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/create-payment-intent", {
        amount: Math.round(amount * 100),
      });
      const clientSecret = res.data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: customerName, email: customerEmail },
        },
      });

      if (result.error) {
        setMessage(`Payment failed: ${result.error.message}`);
        onError?.(result.error);
      } else if (result.paymentIntent?.status === "succeeded") {
        setMessage("Payment successful!");
        onSuccess(result.paymentIntent.id);
      } else {
        setMessage("Payment not completed. Please try again.");
        onError?.(new Error("Payment not completed"));
      }
    } catch (err) {
      console.error("Stripe error:", err);
      setMessage("Payment error. Please try again.");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-3">
      <CardElement className="border p-2 rounded mb-2" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded hover:scale-105 transition"
      >
        {loading ? "Processing..." : `Pay Rs. ${amount} & Place Order`}
      </button>
      {message && (
        <p
          className={`mt-2 ${
            message.startsWith("Payment successful")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

// --- Main Order Page ---
export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [singleDish, setSingleDish] = useState(null);
  const [loadingDish, setLoadingDish] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [mode, setMode] = useState("single");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [placing, setPlacing] = useState(false);

  // ✅ Load dish or cart items
  useEffect(() => {
   if (id === "cart") {
  setMode("cart");
  setLoadingDish(false);
  try {
    const raw = localStorage.getItem("cartItems");
    const parsed = raw ? JSON.parse(raw) : [];

    // ✅ Fix cart structure & id mismatch
    setCartItems(
      parsed.map((it) => ({
        ...it,
        dishId: it.dishId || it._id || it.id,
        quantity: Number(it.quantity) || 1,
      }))
    );
  } catch (err) {
    console.warn("Invalid cart data. Clearing.");
    localStorage.removeItem("cartItems");
    setCartItems([]);
  }
  return;
}


    // single dish mode
    const fetchDish = async () => {
      setMode("single");
      setLoadingDish(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/dishes/${id}`);
        setSingleDish(res.data);
      } catch (err) {
        console.error("Error fetching dish:", err);
      } finally {
        setLoadingDish(false);
      }
    };

    fetchDish();
  }, [id]);

  // Items & totals
  const items = useMemo(() => {
    if (mode === "single" && singleDish) {
      return [
        {
          dishId: singleDish._id,
          name: singleDish.name,
          price: singleDish.price,
          quantity: 1,
          image: singleDish.images?.[0],
        },
      ];
    }
    return cartItems;
  }, [mode, singleDish, cartItems]);

  const [quantities, setQuantities] = useState({});
  useEffect(() => {
    const map = {};
    items.forEach((it) => (map[it.dishId] = it.quantity || 1));
    setQuantities(map);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce(
      (sum, it) =>
        sum +
        (quantities[it.dishId] || it.quantity || 1) * Number(it.price || 0),
      0
    );
  }, [items, quantities]);

  // 🧮 Cart modifications
  const updateQuantity = (dishId, q) => {
    if (mode !== "cart") return;
    const newQ = Math.max(1, Number(q) || 1);
    const updated = cartItems.map((it) =>
      it.dishId === dishId ? { ...it, quantity: newQ } : it
    );
    setCartItems(updated);
    setQuantities((prev) => ({ ...prev, [dishId]: newQ }));
    localStorage.setItem("cartItems", JSON.stringify(updated));
  };

  const removeFromCart = (dishId) => {
    if (mode !== "cart") return;
    const updated = cartItems.filter((it) => it.dishId !== dishId);
    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
  };

  // 🧾 Backend order creation
  const createOrdersOnBackend = async (paymentStatus = "COD", paymentId = null) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const payloads = items.map((it) => ({
      customerName,
      customerEmail,
      deliveryAddress,
      dishId: it.dishId || it._id || it.id, // ✅ Covers all possible cases
      
      quantity: quantities[it.dishId] || it.quantity || 1,
      paymentStatus,
      paymentId: paymentId || undefined,
    }));

    const headers = { Authorization: `Bearer ${token}` };
    const creations = await Promise.all(
      payloads.map((p) =>
        axios.post("http://localhost:5000/api/orders", p, { headers }).then((r) => r.data)
      )
    );
    return creations;
  };

  // ✅ Send email receipt (backend expects specific fields)
  const sendCombinedReceipt = async (orderedItems, paymentMethodLabel) => {
  try {
    if (!customerEmail || !customerName) return;

    const dishList = orderedItems
      .map(
        (it) =>
          `${it.name || it.dishName || "Unnamed Dish"} (x${it.quantity || 1}) - Rs. ${
            (it.price || 0) * (it.quantity || 1)
          }`
      )
      .join("<br/>");

    const totalPrice = orderedItems.reduce(
      (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
      0
    );

    await axios.post("http://localhost:5000/api/order-email/send", {
      customerEmail,
      customerName,
      dishName: dishList,
      quantity: orderedItems.length,
      totalPrice,
      paymentStatus: paymentMethodLabel,
    });
  } catch (err) {
    console.error("Receipt email error:", err);
  }
};


  // ✅ Handle COD Order
  const handlePlaceCOD = async () => {
    setPlacing(true);
    setErrorMessage("");
    try {
      if (!customerName || !customerEmail || !deliveryAddress) {
        setErrorMessage("Please fill all required fields.");
        setPlacing(false);
        return;
      }

        const ordersCreated = await createOrdersOnBackend("COD");
         await sendCombinedReceipt(items, "Cash on Delivery"); // send original cart items


      if (mode === "cart") localStorage.removeItem("cartItems");

       setSuccessMessage("✅ Order placed successfully! Receipt sent to your email.");
      setTimeout(() => {
        setSuccessMessage(""); // clear after showing
       navigate("/customer-dashboard");}, 3000); // wait 3 seconds before redirect

    } catch (err) {
      console.error("Place COD error:", err);
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to place order"
      );
    } finally {
      setPlacing(false);
    }
  };

  // ✅ Handle Online Payment
  const handleOnlineSuccess = async (paymentId) => {
    setPlacing(true);
    setErrorMessage("");
    try {
            const ordersCreated = await createOrdersOnBackend("PAID", paymentId);
            await sendCombinedReceipt(items, "Paid Online");


      if (mode === "cart") localStorage.removeItem("cartItems");

      setSuccessMessage("✅ Payment successful! Receipt sent to your email.");
      setTimeout(() => navigate("/my-orders"), 1500);
    } catch (err) {
      console.error("Online payment success error:", err);
      setErrorMessage(err.response?.data?.message || err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loadingDish) return <div className="p-6 text-center">Loading...</div>;
  if (mode === "single" && !singleDish)
    return <div className="p-6 text-center">Dish not found</div>;
  if (mode === "cart" && items.length === 0)
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart is empty</h2>
        <p className="text-gray-600">
          Add dishes from the menu to proceed to checkout.
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 🥘 Items List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {mode === "cart" ? "Cart Items" : singleDish.name}
        </h2>

        {items.map((it) => (
          <div
            key={it.dishId}
            className="flex gap-4 p-4 border rounded-lg items-center mb-3"
          >
{it.image || it.images?.[0] ? (
  <img
    src={
      (it.image && it.image.startsWith("http")) ||
      (it.images?.[0] && it.images[0].startsWith("http"))
        ? it.image || it.images?.[0]
        : `http://localhost:5000${it.image || it.images?.[0]}`
    }
    alt={it.name}
    className="w-28 h-20 object-cover rounded"
  />
) : (
  <div className="w-28 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
    No Image
  </div>
)}




            <div className="flex-1">
              <h3 className="font-semibold">{it.name}</h3>
              <p className="text-gray-600">Rs. {it.price}</p>

              <div className="mt-2 flex items-center gap-2">
                <label className="text-sm text-gray-600">Qty:</label>
                <input
                  type="number"
                  min="1"
                  value={quantities[it.dishId] || it.quantity || 1}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (mode === "cart") updateQuantity(it.dishId, v);
                    else
                      setQuantities((prev) => ({
                        ...prev,
                        [it.dishId]: Math.max(1, v),
                      }));
                  }}
                  className="w-20 border px-2 py-1 rounded"
                />

                {mode === "cart" && (
                  <button
                    onClick={() => removeFromCart(it.dishId)}
                    className="ml-4 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="text-right font-semibold">
              Rs.{" "}
              {(
                (quantities[it.dishId] || it.quantity || 1) *
                Number(it.price)
              ).toFixed(2)}
            </div>
          </div>
        ))}

        <p className="text-sm text-gray-500 mt-4">
          You can update quantities here before checkout. Each item will be saved as an individual order, and you'll receive one combined email receipt.
        </p>
      </div>

      {/* 💳 Checkout Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="Delivery Address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div className="mt-4 text-lg font-semibold">
          Total: <span className="text-orange-600">Rs. {totalPrice.toFixed(2)}</span>
        </div>

        <div className="mt-4 mb-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Cash on Delivery
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="ONLINE"
              checked={paymentMethod === "ONLINE"}
              onChange={() => setPaymentMethod("ONLINE")}
            />
            Pay Online
          </label>
        </div>

        {errorMessage && <div className="mb-3 text-red-600">{errorMessage}</div>}
        {successMessage && <div className="mb-3 text-green-600">{successMessage}</div>}

        {paymentMethod === "COD" ? (
          <button
            onClick={handlePlaceCOD}
            disabled={placing}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
          >
            {placing ? "Placing order..." : `Place Order (COD) — Rs. ${totalPrice.toFixed(2)}`}
          </button>
        ) : (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={totalPrice}
              customerName={customerName}
              customerEmail={customerEmail}
              onSuccess={handleOnlineSuccess}
              onError={(err) => setErrorMessage(err?.message || "Payment failed")}
            />
          </Elements>
        )}

        <p className="text-sm text-gray-500 mt-3">
          By placing an order you agree to our terms. A receipt will be emailed to the address provided.
        </p>
      </div>
    </div>
  );
}
