import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import Input from '../input'
import { Plus, PlusCircle, X } from 'lucide-react'

const CustomProperties = ({ control, errors }: any) => {
    const [properties, setProperties] = useState<{ label: string, values: string[] }[]>([])
    const [newLabel, setNewLabel] = useState("")
    const [newValue, setNewValue] = useState("")




    return (
        <div>

            <div className='flex flex-col gap-3'>
                <Controller
                    name={`custom_properties`}
                    control={control}
                    render={({ field }) => {
                        useEffect(() => {
                            field.onChange(properties)
                        }, [properties])

                        const addProperty = () => {
                            if (!newLabel.trim()) return;
                            setProperties([...properties, { label: newLabel, values: [] }])
                            setNewLabel("")
                        }

                        const addValue = (index: number) => {
                            if (!newValue.trim()) return;
                            const newProperties = [...properties]
                            newProperties[index].values.push(newValue)
                            setProperties(newProperties)
                            setNewValue("")
                        }

                        const removeProperty = (index: number) => {
                            setProperties(properties.filter((_, i) => i !== index))
                        }
                        return <div className='mt-2'>
                            <label className="block font-semibold text-gray-300 mb-1">
                                Custom Properties
                            </label>
                            <div className="flex flex-col gap-3">
                                {properties.map((property, index) => (
                                    <div key={index} className='border border-gray-700 p-3 rounded-lg bg-gray-900'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-white font-medium'>{property.label}</span>
                                            <button type='button' onClick={() => removeProperty(index)}><X size={20} color='red' /></button>
                                        </div>

                                        {/* Add value to property */}

                                        <div className='flex items-center mt-2 gap-2'>
                                            <input type="text" className='border outine-none border-gray-700 p-2 rounded-md bg-gray-800 w-full text-white' value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)} placeholder='Enter value' />
                                            <button type='button' className='px-3 py-1 text-blue-500 hover:text-blue-700' onClick={() => addValue(index)}>
                                                <Plus size={20} /> Add
                                            </button>
                                        </div>

                                        {/* Show values */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {property.values.map((value, index) => (
                                                <span key={index} className="px-2 py-1 bg-gray-800 text-white rounded-md">{value}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Property */}

                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        placeholder='Enter property label'
                                        value={newLabel}
                                        onChange={(e: any) => setNewLabel(e.target.value)}
                                    />

                                    <button type='button' className='px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center' onClick={addProperty}>
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                            </div>

                            {errors?.custom_properties && (
                                <p className='text-red-500 text-xs mt-2'>
                                    {errors.custom_properties.message}
                                </p>
                            )}
                        </div>
                    }}
                />
            </div>

        </div>
    )
}

export default CustomProperties