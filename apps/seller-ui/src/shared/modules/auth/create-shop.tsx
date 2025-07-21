import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { shopCategories } from 'apps/seller-ui/src/utils/categories';

const CreateShop = ({ sellerId, setActiveStep }: {
    sellerId: string;
    setActiveStep: (step: number) => void
}) => {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`, data)
            return response.data
        },
        onSuccess: () => {
            setActiveStep(3)
        }
    })

    const onSubmit = async (data: any) => {
        const shopData = { ...data, sellerId }
        shopCreateMutation.mutate(shopData)
    }

    function countWords(text: string) {
        const matches = text.trim().match(/\b\w+\b/g);
        return matches ? matches.length : 0;
    }
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className='text-2xl font-semibold text-center mb-4'>
                    Setup new shop
                </h3>
                <label className='block text-gray-700 mb-1'>Name *</label>
                <input
                    type="text"
                    placeholder="name"
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("name", {
                        required: "Name is required",
                    })}
                />
                {errors.name && (
                    <p className='text-red-500 text-sm'>{String(errors.name.message)}</p>
                )}

                <label className='block text-gray-700 mb-1'>Bio (Max 100 word) *</label>
                <input
                    type="text"
                    placeholder="shop bio"
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("bio", {
                        required: "Bio is required",
                        validate: (value: string) =>
                            countWords(value) <= 100 || "Bio must be less than 100 words"

                    })}
                />

                {errors.bio && (
                    <p className='text-red-500 text-sm'> {String(errors.bio.message)}</p>
                )}

                <label className='block text-gray-700 mb-1'>Address *</label>
                <input
                    type="text"
                    placeholder="shop location"
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("address", {
                        required: "Shop Address is required",
                    })}
                />
                {errors.address && (
                    <p className='text-red-500 text-sm'>{String(errors.address.message)}</p>
                )}


                <label className='block text-gray-700 mb-1'>Opening Hours *</label>
                <input
                    type="text"
                    placeholder="Opening hours"
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("opening_hours", {
                        required: "Opening hours is required",
                    })}
                />
                {errors.opening_hours && (
                    <p className='text-red-500 text-sm'>{String(errors.opening_hours.message)}</p>
                )}



                <label className='block text-gray-700 mb-1'>Website</label>
                <input
                    type="text"
                    placeholder="https://example.com"
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("website", {
                        required: "Website is required",
                    })}
                />
                {errors.website && (
                    <p className='text-red-500 text-sm'>{String(errors.website.message)}</p>
                )}

                <label className='block text-gray-700 mb-1'>Category *</label>
                <select
                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                    {...register("category", {
                        required: "Category is required",
                    })}
                >
                    <option value="">Select Category</option>
                    {shopCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}

                </select>
                {errors.category && (
                    <p className='text-red-500 text-sm'>{String(errors.category.message)}</p>
                )}

                <button
                    type="submit"
                    className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'>Create</button>
            </form>
        </div>
    )
}

export default CreateShop