"use client"

import React, { useState } from 'react'
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'
import { Search, Pencil, Trash, Eye, Plus, BarChart, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

const fetchProducts = async () => {
    const response = await axiosInstance.get('/products/api/get-shop-products')
    return response?.data?.products
}

const ProductList = () => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [analyticsData, setAnalyticsData] = useState(null)
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const queryClient = useQueryClient()

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['shop-products'],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const columns = React.useMemo(() => [
        {
            accessorKey: 'image',
            header: "Image",
            cell: ({ row }: any) => (
                <Image src={row.original.image} alt={row.original.image} className="w-12 h-12 rounded-md object-cover" />
            )
        },
        {
            accessorKey: 'name',
            header: "Product Name",
            cell: ({ row }: any) => {
                const truncatedTitle = row.original.title.length > 25 ? row.original.title.substring(0, 25) + '...' : row.original.title;
                return (
                    <Link
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        className='text-blue-600 hover:underline'
                        title={row.original.title}
                    >{truncatedTitle}</Link>
                )
            }
        },
        {
            accessorKey: 'price',
            header: "Price",
            cell: ({ row }: any) => (
                <span>${row.original.price}</span>
            )
        },
        {
            accessorKey: 'stock',
            header: "Stock",
            cell: ({ row }: any) => (
                <span className={row.original.stock < 10 ? 'text-red-500' : 'text-green-500'}>{row.original.stock} left</span>
            )
        },
        {
            accessorKey: 'category',
            header: "Category",
            cell: ({ row }: any) => (
                <span>{row.original.category}</span>
            )
        },
        {
            accessorKey: 'rating',
            header: "Rating",
            cell: ({ row }: any) => (
                <span>{row.original.rating} <Star className='inline-block mb-1 text-yellow-400' size={14} /></span>
            )
        },
        {
            accessorKey: 'actions',
            header: "Actions",
            cell: ({ row }: any) => (
                <div className='flex items-center gap-2'>
                    <Link href={`/dashboard/edit-product/${row.original.id}`} className='text-blue-600 hover:underline'><Pencil size={16} /></Link>
                    <button onClick={() => {
                        setSelectedProduct(row.original)
                        setShowDeleteModal(true)
                    }} className='text-red-600 hover:underline'><Trash size={16} /></button>
                    <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`} target='_blank' className='text-green-600 hover:underline'><Eye size={16} /></Link>
                </div>
            )
        }

    ])

    const table = useReactTable({
        data: products,
        columns,
        state: {
            globalFilter
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
    })
    return (
        <div className='w-full min-h-screen p-8'>
            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-2xl font-bold text-white'>All Products</h1>
                <Link href="/dashboard/create-product" className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded'>
                    <Plus className='inline-block mb-1 mr-1' size={16} /> Add Product
                </Link>
            </div>

            {/* BreadCrumbs */}
            <div className='flex items-center mb-4'>
                <Link href="/dashboard" className='text-blue-600 hover:underline'>Dashboard</Link>
                <span className='mx-2 text-white'>/</span>
                <Link href="/dashboard/all-products" className='text-white'>All Products</Link>
            </div>
        </div>
    )
}

export default ProductList