import React from 'react'
import images from '../../assets/images'

export const NoData = ({ label, img, style = {} }) => {
    img = img || images.com.noData
    return (
        <div className='w100 p30 flex c' style={{ ...style }}>
            <img style={{ width: 120, height: 120 }} src={img} alt=''></img>
            {label && <div className='fz15 mt30'>{label}</div>}
        </div>
    )
}
