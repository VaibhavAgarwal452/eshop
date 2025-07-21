"use client"

import useSeller from 'apps/seller-ui/src/hooks/useSeller'
import { useSidebar } from 'apps/seller-ui/src/hooks/useSidebar'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import { Box } from '../box'
import { Sidebar } from './sidebar.styles'
import Link from 'next/link'
import { BellPlus, BellRing, BoxIcon, CalendarPlus, Headset, HomeIcon, List, ListCheckIcon, Mail, PackageSearch, Settings, SquarePlus, TicketPercent, Wallet } from 'lucide-react'
import SidebarItem from './sidebar.item'
import SidebarMenu from './sidebar.menu'

const SidebarBarWrapper = () => {
    const { activeSidebar, setActiveSidebar } = useSidebar()
    const pathname = usePathname()
    const { seller } = useSeller()

    useEffect(() => {
        setActiveSidebar(pathname)
    }, [pathname, setActiveSidebar])

    console.log("activeSidebar", activeSidebar)
    const getIconColor = (route: string) => activeSidebar === route ? '#0085ff' : '#969696'
    return (
        <Box css={{
            height: "100vh", zIndex: 202, position: "sticky", padding: "8px", top: "0", overflowY: "scroll", scrollbarWidth: "none"
        }} className='sidebar-wrapper'>
            <Sidebar.Header>
                <Box>
                    <Link href="/" className='flex text-center gap-2 justify-center items-center'>

                        <BoxIcon />
                        <Box>
                            <h3 className='text-xl font-medium text-[#ecedee]'>{seller?.shop?.name}</h3>
                            <h5 className='font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]'>
                                {seller?.shop?.address}
                            </h5>
                        </Box>

                    </Link>
                </Box>
            </Sidebar.Header>

            <div className='block my-3 h-full'>
                <Sidebar.Body className='body sidebar'>
                    <SidebarItem title="Dashboard" icon={<HomeIcon />} isActive={activeSidebar === "/dashboard"} href="/dashboard" />
                    <div className='mt-2 block'>
                        <SidebarMenu title="Main Menu">
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/orders"}
                                title="Orders"
                                href="/dashboard/orders"
                                icon={<List />}
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/payments"}
                                title="Payments"
                                href="/dashboard/payments"
                                icon={<Wallet />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title="Products">
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/create-product"}
                                title="Create Product"
                                href="/dashboard/create-product"
                                icon={<SquarePlus />}
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/all-products"}
                                title="All Products"
                                href='/dashboard/all-products'
                                icon={<PackageSearch />}
                            />
                        </SidebarMenu>

                        <SidebarMenu title='Events'>
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/create-event"}
                                title='Create Event'
                                href='/dashboard/create-event'
                                icon={<CalendarPlus />}
                            />

                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/all-events"}
                                title='All Events'
                                href='/dashboard/all-events'
                                icon={<BellPlus />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Controllers'>
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/inbox"}
                                title='Inbox'
                                href="/dashboard/inbox"
                                icon={<Mail />}
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/settings"}
                                title='Settings'
                                href="/dashboard/settings"
                                icon={<Settings />}
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/notifications"}
                                title='Notifications'
                                href="/dashboard/notifications"
                                icon={<BellRing />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Extras'>
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/discount-codes"}
                                title="Discount Codes"
                                href="/dashboard/discount-codes"
                                icon={<TicketPercent />}
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/logout"}
                                title="Logout"
                                href="/logout"
                                icon={<TicketPercent />}
                            />
                        </SidebarMenu>
                    </div>
                </Sidebar.Body>
            </div>
        </Box>
    )
}

export default SidebarBarWrapper