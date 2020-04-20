import React, {useState} from 'react'
import styled from 'styled-components'
import SideBarBox from './SideBarBox'

const SideBarContainer = styled.div`
    width: 25%;
    display: flex;
    flex-direction: column;
`

const SideBar = ({ size, sizeHandler }) => {
    return (
        <SideBarContainer>
            <SideBarBox title='SIZES'>
                <lable>
                    <input type='radio' value='tall' checked={size.tall} onChange={e => sizeHandler(e)} />
                    Tall
                </lable>
                <lable>
                    <input type='radio' value='wide' checked={size.wide} onChange={e => sizeHandler(e)} />
                    Wide
                </lable>
            </SideBarBox>
            <SideBarBox title='TEXT'>
                <li>Font</li>
                <li>Font size</li>
            </SideBarBox>
        </SideBarContainer>
    )
}

export default SideBar
