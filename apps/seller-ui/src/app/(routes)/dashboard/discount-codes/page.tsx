"use client"

import { ChevronRight, Plus } from 'lucide-react'
import React, { useState } from 'react'
import Link from 'next/link'

const DiscountCodes = () => {
    const [showModal, setShowModal] = useState(false)
    return (
        <div className='w-full min-h-screen p-8'>
            <div className='flex justify-between items-center mb-1'>
                <h2 className='text-2xl text-white font-semibold'>Discount Codes</h2>
                <button className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 flex items-center gap-2 rounded-md'
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={16} /> Create Discount
                </button>
            </div>


            <div className='flex items-center text-white'>
                <Link href={"/dashboard"} className='text-[#80Deea] cursor-pointer'>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[.8]' />
                <span>Discount Codes</span>
            </div>

            <div className='mt-8 bg-gray-900 p-6 rounded-lg shadow-lg'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                    Your Discount Codes
                </h3>
            </div>
        </div>
    )
}

export default DiscountCodes