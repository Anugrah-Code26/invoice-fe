'use client';

import { useEffect, useState } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Client } from '@/types/client';
import { Product } from '@/types/product';

export default function InvoiceForm() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const [clientRes, productRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setClients(clientRes.data);
    setProducts(productRes.data.filter((p: Product) => !p.deleted));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      clientId: '',
      paymentTerms: 'MONTHLY',
      isRecurring: false,
      items: [
        { productId: '', quantity: 1 },
      ],
    },
    validationSchema: Yup.object({
      clientId: Yup.string().required('Client is required'),
      paymentTerms: Yup.string().oneOf(['MONTHLY', 'WEEKLY']),
      items: Yup.array()
        .of(
          Yup.object({
            productId: Yup.string().required('Product is required'),
            quantity: Yup.number().min(1, 'Min 1').required('Quantity required'),
          })
        )
        .min(1, 'At least one item is required'),
    }),
    onSubmit: async (values) => {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/invoices`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/invoices');
    },
  });

  const { values, handleChange, handleSubmit, setFieldValue } = formik;

  const calculateTotal = () => {
    return values.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.productId));
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Client */}
        <div>
          <label className="block font-medium">Client</label>
          <select
            name="clientId"
            value={values.clientId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block font-medium">Payment Terms</label>
          <select
            name="paymentTerms"
            value={values.paymentTerms}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>

        {/* Is Recurring */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isRecurring"
            checked={values.isRecurring}
            onChange={handleChange}
          />
          <label>Recurring Invoice?</label>
        </div>

        {/* Invoice Items */}
        <FormikProvider value={formik}>
          <FieldArray
            name="items"
            render={(arrayHelpers) => (
              <div className="space-y-4">
                <label className="block font-medium">Items</label>
                {values.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      name={`items[${index}].productId`}
                      value={item.productId}
                      onChange={handleChange}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">-- Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      name={`items[${index}].quantity`}
                      value={item.quantity}
                      onChange={handleChange}
                      className="border p-2 rounded w-24"
                      min={1}
                    />

                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => arrayHelpers.push({ productId: '', quantity: 1 })}
                  className="text-blue-600 text-sm"
                >
                  + Add Item
                </button>
              </div>
            )}
          />
        </FormikProvider>

        {/* Total */}
        <div className="text-right font-semibold text-lg">
          Total: ${calculateTotal().toFixed(2)}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Invoice
        </button>
      </form>
    </div>
  );
}
