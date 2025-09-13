import { X } from 'lucide-react'
import React from 'react'

const DeleteDiscountModal = ({ discount, onClose, onConfirm }: any) => {
    return (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'>
            <div className='bg-gray-900 p-6 rounded-lg shadow-lg w-[450px]'>
                <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                    <h3 className='text-lg text-white'> Delete Discount Code</h3>
                    <button className="text-gray-400 hover:text-white" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>

                <p className='text-gray-300 mt-3'>
                    Are you sure you want to delete
                    <span className='font-semibold text-white'>{discount?.public_name}</span>?
                    <br />
                    This action **cannot be undone**
                </p>

                <div className='flex justify-end gap-2 mt-4'>
                    <button className='px-4 py-2 bg-gray-700 rounded-md text-white' onClick={onClose}>Cancel</button>
                    <button className='px-4 py-2 bg-red-600 rounded-md text-white' onClick={onConfirm}>Delete</button>
                </div>

            </div>
        </div>
    )
}

export default DeleteDiscountModal