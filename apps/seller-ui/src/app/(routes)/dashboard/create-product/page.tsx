"use client"
import { useQuery } from '@tanstack/react-query'
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { ChevronRight } from 'lucide-react'
import ColorSelector from 'packages/components/color-selector'
import CustomProperties from 'packages/components/custom-properties'
import CustomSpecifications from 'packages/components/custom-specifications'
import Input from 'packages/components/input'
import dynamic from 'next/dynamic'
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SizeSelector from 'packages/components/size-selector'
// In parent or page
const RichTextEditor = dynamic(() => import('packages/components/rich-text-editor'), {
    ssr: false,
});

const CreateProduct = () => {
    const [openImageModal, setOpenImageModal] = useState(false)
    const [isChanged, setIsChanged] = useState(true)
    const [images, setImages] = useState<(File | null)[]>([null])
    const [loading, setLoading] = useState(false)
    const { register, control, watch, setValue, handleSubmit, formState: { errors }, } = useForm()

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/product/api/get-categories")
                return response.data
            } catch (error) {
                console.error(error)
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2
    })
    const categories = data?.categories || []
    const subCategoriesData = data?.subCategories || {}

    const selectedCategory = watch("category")
    const regularPrice = watch("regular_price")


    const subCategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : []
    }, [selectedCategory, subCategoriesData])

    const onSubmit = (data: any) => {
        console.log("data", data)
    }

    const handleImageChange = (file: File | null, index: number) => {
        const updatedImages = [...images]
        updatedImages[index] = file

        if (index === images.length - 1 && images.length < 8) {
            updatedImages.push(null)
        }
        setImages(updatedImages)

        setValue("images", updatedImages)
    }

    const handleRemoveImage = (index: number) => {
        setImages(prevImages => {
            let updatedImages = [...prevImages]
            if (index === -1) {
                updatedImages[0]
            } else {
                updatedImages.splice(index, 1)
            }

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null)
            }
            return updatedImages

        })
        setValue("images", images)
    }


    const handleSaveDraft = (draft: any) => { }
    console.log("images", images)
    return (
        <form className='w-full mx-auto p-8 shadow-md rounded-lg text-white' onSubmit={handleSubmit(onSubmit)}>
            <h2 className='text-2xl py-2 font-semibold font-Poppins text-white'>
                Create Product
            </h2>
            <div className='flex items-center'>
                <span className='text-[#80Deea] cursor-pointer'>Dashboard</span>
                <ChevronRight size={20} className='opacity-[.8]' />
                <span>Create Product</span>
            </div>

            <div className='py-4 w-full flex gap-6'>
                <div className='md:w-[35%]'>
                    {images.length > 0 && <ImagePlaceHolder
                        setOpenImageModal={setOpenImageModal}
                        size="765 x 850"
                        small={false}
                        index={0}
                        onImageChange={handleImageChange}
                        onRemove={handleRemoveImage}
                    />}

                    <div className='grid grid-cols-2 gap-3 mt-4'>
                        {images.slice(1).map((_, index) => (
                            <ImagePlaceHolder
                                setOpenImageModal={setOpenImageModal}
                                size="765 x 850"
                                small
                                key={index}
                                index={index + 1}
                                onImageChange={handleImageChange}
                                onRemove={handleRemoveImage}
                            />
                        ))}
                    </div>
                </div>

                <div className='md:w-[65%] ' >
                    <div className='w-full flex gap-6'>
                        <div className='w-2/4'>
                            <Input label='Product Title *' placeholder='Enter product title'
                                {...register("title", { required: "Title is required" })}
                            />
                            {errors.title && (
                                <p className='text-red-500 text-sx mt-1'>
                                    {errors.title.message as string}
                                </p>
                            )}

                            <div className='mt-2'>
                                <Input
                                    type='textarea'
                                    rows={7}
                                    cols={10}
                                    label='Short Description *'
                                    placeholder='Enter product description'
                                    {...register("description", {
                                        required: "Description is required",
                                        validate: (value: string) => {
                                            const wordCount = value.trim().split(/\s+/).length;
                                            return (
                                                wordCount <= 150 || "Description must be less than 150 words"
                                            )
                                        }
                                    })}
                                />

                                {errors.description && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.description.message as string}
                                    </p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Tags *'
                                    placeholder='apple,flagship'
                                    {...register("tags", { required: "Separate related products tag with a coma" })}
                                />
                                {errors.tags && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.tags.message as string}
                                    </p>
                                )}

                            </div>


                            <div className='mt-2'>
                                <Input
                                    label='Warranty *'
                                    placeholder='1 Year/No warranty'
                                    {...register("warranty", { required: "Warranty is required" })}
                                />
                                {errors.warranty && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.warranty.message as string}
                                    </p>
                                )}

                            </div>

                            <div className='mt-2'>
                                <Input
                                    label="Slug *"
                                    placeholder="product slug"
                                    {...register("slug", {
                                        required: "Slug is required",
                                        pattern: {
                                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
                                            message: "Slug must be lowercase and contain only letters, numbers, and hyphens"
                                        },
                                        minLength: {
                                            value: 3,
                                            message: "Slug must be at least 3 characters long"
                                        },
                                        maxLength: {
                                            value: 50,
                                            message: "Slug must be at most 50 characters long"
                                        }
                                    })}
                                />
                                {errors.slug && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.slug.message as string}
                                    </p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label="Brand"
                                    placeholder="Apple"
                                    {...register("brand")}
                                />
                                {errors.brand && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.brand.message as string}
                                    </p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <ColorSelector control={control} errors={errors} />
                            </div>

                            <div className='mt-2 '>
                                <CustomSpecifications control={control} errors={errors} />
                            </div>

                            <div className='mt-2'>
                                <CustomProperties control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <label> Cash on Delivery * </label>
                                <select {...register("cash_on_delivery", {
                                    required: "Cash on delivery is required"
                                })}
                                    defaultValue={"yes"}
                                    className='w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white'
                                >
                                    <option value="yes" className='bg-black'>Yes</option>
                                    <option value="no" className='bg-black'>No</option>
                                </select>
                                {errors.cash_on_delivery && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.cash_on_delivery.message as string}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className='w-2/4'>
                            <label className='block font-semibold text-gray-300 mb-1'>
                                Category *
                            </label>
                            {isLoading ? <p className='text-gray-400'>
                                Loading Categories...
                            </p> : (
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: "Category is required" }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                                        >
                                            <option value="" className='bg-black'>Select Category</option>
                                            {categories.map((category: string) => (
                                                <option key={category} value={category} className='bg-black'>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            )}

                            {errors.category && (
                                <p className='text-red-500 text-sx mt-1'>
                                    {errors.category.message as string}
                                </p>
                            )}

                            <div className='mt-2'>
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Sub Category *
                                </label>
                                {isLoading ? <p className='text-gray-400'>
                                    Loading Sub Categories...
                                </p> : (
                                    <Controller
                                        name="subcategory"
                                        control={control}
                                        rules={{ required: "Sub Category is required" }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                                            >
                                                <option value="" className='bg-black'>Select Category</option>
                                                {subCategories.map((category: string) => (
                                                    <option key={category} value={category} className='bg-black'>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                )}

                                {errors.subcategory && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.subcategory.message as string}
                                    </p>
                                )}

                            </div>

                            <div className='mt-2'>
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Detailed Description * (Min 100 words)
                                </label>

                                <Controller
                                    control={control}
                                    name='detailed_description'
                                    rules={{
                                        required: "Detailed Description is required",
                                        validate: (value: string) => {
                                            const wordCount = value.trim().split(/\s+/).filter((word: string) => word).length;
                                            return wordCount >= 100 || "Detailed Description must be at least 100 words";
                                        }
                                    }}
                                    render={({ field }) => (
                                        <RichTextEditor value={field.value} onChange={field.onChange} />
                                    )}
                                />
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label="Video URL"
                                    placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                    {...register("video_url", {
                                        pattern: {
                                            value: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/,
                                            message: "Invalid YouTube embed URL",
                                        }
                                    })}

                                />

                                {errors.video_url && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.video_url.message as string}
                                    </p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Regular Price' placeholder="20$"
                                    {...register("regular_price", {
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Price must be greater than 0" },
                                        validate: (value) => !isNaN(value) || "Price must be a number",
                                    })}
                                />

                                {errors.regular_price && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.regular_price.message as string}
                                    </p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Sale Price *'
                                    placeholder="15$"
                                    {...register("sale_price", {
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Sale Price must be greater than 0" },
                                        validate: (value) => {
                                            if (!isNaN(value)) return "Sale Price must be a number"
                                            if (regularPrice && value >= regularPrice) return "Sale Price must be less than regular price"
                                            return true
                                        },

                                    })}
                                />

                                {errors.sale_price && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.sale_price.message as string}
                                    </p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label='Stock *'
                                    placeholder="20"
                                    {...register("stock", {
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Stock must be greater than 0" },
                                        validate: (value) => !isNaN(value) || "Stock must be a number",
                                    })}
                                />

                                {errors.stock && (
                                    <p className='text-red-500 text-sx mt-1'>
                                        {errors.stock.message as string}
                                    </p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <SizeSelector control={control} field={register("size")} />
                            </div>

                            <div className='mt-3'>
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Select Discount Codes (optional)
                                </label>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
            <div className='mt-5 flex justify-end gap-3'>
                {isChanged && (
                    <button type='submit' className='px-4 py-2 bg-gray-700 rounded-md' onClick={handleSaveDraft}>Save Draft</button>
                )}
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
            </div>
        </form>
    )
}

export default CreateProduct