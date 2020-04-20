import React from 'react'
import styled from 'styled-components'

const BoxContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    border: 1px solid #999999;
    border-radius: 5px;
    margin-bottom: 1rem;
    color: #999999;
    h2 {
        text-align: start;
        font-size: 1rem;
        font-weight: 300;
        width: 100%;
        border-bottom: 1px solid #999999;
    }
`

const SideBarBox = ({title, children}) => {
    return (
        <BoxContainer>
            <h2>{title}</h2>
            {children}
        </BoxContainer>
    )
}

export default SideBarBox
