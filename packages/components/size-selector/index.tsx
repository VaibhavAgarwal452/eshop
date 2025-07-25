import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL",]

const SizeSelector = ({ control, field }: any) => {
    return (
        <div className="mt-2">
            <label className="block font-semibold text-gray-300 mb-1">Sizes</label>
            <Controller
                name="size"
                control={control}
                render={({ field }) => (
                    <div className="flex gap-2 flex-wrap">
                        {sizes.map((size) => (
                            <div
                                key={size}
                                onClick={() => field.onChange(size)}
                                className={`w-7 h-7 p-2 cursor-pointer rounded-md my-1 flex items-center justify-center border-2 transition ${field.value === size ? "scale-110 border-white" : "border-transparent"
                                    }`}
                            >
                                {size}
                            </div>
                        ))}
                    </div>
                )}
            />

        </div>
    )
}

export default SizeSelector