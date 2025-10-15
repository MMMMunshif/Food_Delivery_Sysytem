import { useEffect, useState } from "react";
import API from "../api";

export default function Dishes() {
  const [dishes, setDishes] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", image: null });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({}); // ✅ Track field validation errors

  const token = localStorage.getItem("token");

  // ✅ Fetch all dishes
  const fetchDishes = async () => {
    try {
      const res = await API.get("/dishes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDishes(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // ✅ Form Validation Function
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Dish name is required";
    if (!form.price || form.price <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!editId && !form.image) newErrors.image = "Please upload a dish image";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Add or Update Dish
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editId) {
        await API.put(`/dishes/${editId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("✅ Dish updated successfully!");
      } else {
        await API.post("/dishes", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("✅ Dish added successfully!");
      }

      setForm({ name: "", price: "", image: null });
      setEditId(null);
      setErrors({});
      fetchDishes();
    } catch (err) {
      console.log(err);
      setMessage(" Operation failed");
    }
  };

  // ✅ Delete Dish
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      await API.delete(`/dishes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDishes();
      setMessage(" Dish deleted successfully!");
    } catch (err) {
      console.log(err);
      setMessage(" Failed to delete dish");
    }
  };

  // ✅ Edit Dish
  const handleEdit = (dish) => {
    setForm({ name: dish.name, price: dish.price, image: null });
    setEditId(dish._id);
    setErrors({});
  };

  // ✅ Filter dishes by search term
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Check if form is valid before enabling button
  const isFormValid =
    form.name.trim() &&
    form.price > 0 &&
    (editId || form.image) &&
    Object.keys(errors).length === 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">
        Manage Dishes
      </h1>

      {/* ✅ Search Bar */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-1/3 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* ✅ Dish Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col md:flex-row gap-3 items-start md:items-center bg-white p-4 rounded-lg shadow-md border"
        encType="multipart/form-data"
      >
        <div className="flex flex-col flex-1">
          <input
            type="text"
            placeholder="Dish Name"
            className={`border p-2 rounded w-full ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div className="flex flex-col">
          <input
            type="number"
            placeholder="Price"
            className={`border p-2 rounded w-32 ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        <div className="flex flex-col">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            className={`border p-2 rounded ${
              errors.image ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`px-4 py-2 rounded text-white font-semibold transition ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {message && (
        <p
          className={`mb-4 text-sm font-medium ${
            message.startsWith("✅")
              ? "text-green-600"
              : message.startsWith("❌")
              ? "text-red-600"
              : "text-gray-700"
          }`}
        >
          {message}
        </p>
      )}

      {/* ✅ Dish Table */}
      <table className="w-full border-collapse border">
        <thead className="bg-orange-100">
          <tr>
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDishes.map((dish) => (
            <tr key={dish._id} className="hover:bg-gray-50">
              <td className="border p-2 text-center">
                {dish.images && dish.images[0] && (
                  <img
                    src={`http://localhost:5000${dish.images[0]}`}
                    alt="Dish"
                    className="h-16 w-16 object-cover rounded mx-auto"
                  />
                )}
              </td>
              <td className="border p-2 text-gray-700 font-medium">
                {dish.name}
              </td>
              <td className="border p-2 text-gray-700">Rs. {dish.price}</td>
              <td className="border p-2 flex gap-2 justify-center">
                <button
                  onClick={() => handleEdit(dish)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dish._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
