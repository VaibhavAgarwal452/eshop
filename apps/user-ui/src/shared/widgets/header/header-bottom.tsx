"use client"

import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon'
import { navItems } from 'apps/user-ui/src/configs/constants'
import useUser from 'apps/user-ui/src/hooks/useUser'
import { AlignLeft, ChevronDown, Heart, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const HeaderBottom = () => {
    const [show, setShow] = useState(false)
    const [sticky, setSticky] = useState(false)
    const { user, isLoading } = useUser()
    //Track scroll position
    useEffect(() => {

        const handleScroll = () => {
            if (window.scrollY > 100) {
                setSticky(true)
            } else {
                setSticky(false)
            }

        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    })
    return (
        <div className={`w-full transition-all duration-300 ${sticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
            <div className={`w-[80%] relative m-auto flex items-center justify-between ${sticky ? "pt-3" : "py-0"}`}>
                {/* All dropdown*/}
                <div className={`w-[260px] ${sticky && 'mb-2'} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
                    onClick={() => setShow(!show)}>
                    <div className='flex items-center gap-2'>
                        <AlignLeft color="#fff" />
                        <span className='text-white font-medium '>All Departments</span>
                        <ChevronDown color="white" />
                    </div>

                </div>
                {/* Dropdown MEnu */}
                {show && (
                    <div className={`absolute left-0 w-[260px] h-[400px] bg-[#f5f5f5] ${sticky ? "top-[70px]" : "top-[50px]"}`}>

                    </div>
                )}

                {/* Navigation Links */}
                <div className='flex items-center'>
                    {navItems.map((item: NavItemTypes, index: number) => (
                        <Link className='px-5 font-medium text-lg' href={item.href} key={index}>{item.title}</Link>
                    ))}
                </div>
                <div>
                    {sticky && (<div className='flex items-center gap-8'>
                        <div className='flex items-center gap-2'>
                            {!isLoading && user ? <>
                                <Link href="/profile">
                                    <ProfileIcon />
                                </Link>
                                <Link href="/profile">
                                    <span className='block font-medium'>Hello,</span>
                                    <span className='font-semibold'>{user?.name}</span>
                                </Link>
                            </> : <>
                                <Link href="/login" className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'>
                                    <ProfileIcon />
                                </Link>
                                <Link href="/login">
                                    <span className='block font-medium'>Hello,</span>
                                    <span className='font-semibold'>{isLoading ? "..." : "Sign in"}</span>
                                </Link></>}
                        </div>
                        <div className='flex items-center gap-5'>
                            <Link href="/wishlist" className='relative'>
                                <Heart />
                                <div className='absolute w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center top-[-10px] right-[-10px]'>
                                    <span className='text-white font-medium text-sm'>
                                        0
                                    </span>
                                </div>
                            </Link>
                            <Link href="/cart" className='relative'>
                                <ShoppingCart />
                                <div className='absolute w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center top-[-10px] right-[-10px]'>
                                    <span className='text-white font-medium text-sm'>
                                        9+
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>)}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom