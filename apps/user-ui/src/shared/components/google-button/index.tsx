import GoogleIcon from 'apps/user-ui/src/assets/svgs/google-icon'
import React from 'react'

const GoogleButton = () => {
    return (
        <div className='w-full flex justify-center'><div className='h-[46px] cursor-pointer border border-blue-100 flex items-center gap-2 px-3 rounded my-2 bg-[#eee]'><GoogleIcon /> Sign In with google</div></div>
    )
}

export default GoogleButton