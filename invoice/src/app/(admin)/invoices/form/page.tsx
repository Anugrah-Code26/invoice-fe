'use client';

import { useEffect, useState } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FiTrash2 } from 'react-icons/fi';
import { Client } from '@/types/client';
import { Product } from '@/types/product';

export default function InvoiceForm() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [clientRes, productRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setClients(clientRes.data.data);
      setProducts(productRes.data.data.filter((p: Product) => !p.deleted));
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      clientId: '',
      paymentTerms: 'TODAY',
      // isRecurring: false,
      items: [{ productId: '', quantity: 1 }],
    },
    validationSchema: Yup.object({
      clientId: Yup.string().required('Client is required'),
      paymentTerms: Yup.string().oneOf(['MONTHLY', 'WEEKLY', 'TODAY']),
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
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoices`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Invoice created successfully!');
        setTimeout(() => router.push('/invoices'), 1500);
      } catch (error) {
        toast.error('Failed to create invoice');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { values, handleChange, handleSubmit } = formik;

  const calculateTotal = () => {
    return values.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.productId));
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl relative">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">Create Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium text-gray-700">Client</label>
          <select
            name="clientId"
            value={values.clientId}
            onChange={handleChange}
            className="w-full border p-2 rounded text-gray-700"
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700">Payment Terms</label>
          <select
            name="paymentTerms"
            value={values.paymentTerms}
            onChange={handleChange}
            className="w-full border p-2 rounded text-gray-700"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="TODAY">Today</option>
          </select>
        </div>

        {/* <div className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            name="isRecurring"
            checked={values.isRecurring}
            onChange={handleChange}
          />
          <label>Recurring Invoice?</label>
        </div> */}

        <FormikProvider value={formik}>
          <FieldArray
            name="items"
            render={(arrayHelpers) => (
              <div className="space-y-4">
                <label className="block font-medium text-gray-700">Items</label>
                {values.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center text-gray-700">
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
                      className="border p-2 rounded w-24 text-gray-700"
                      min={1}
                    />

                    <button
                      type="button"
                      onClick={() => arrayHelpers.remove(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove Item"
                    >
                      <FiTrash2 size={20} />
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

        <div className="text-right font-semibold text-lg text-gray-700">
          Total: ${calculateTotal().toFixed(2)}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
}
