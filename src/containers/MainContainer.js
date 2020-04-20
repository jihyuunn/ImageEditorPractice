import React, {useState} from 'react'
import styled from 'styled-components'
import Main from '../components/Main'
import SideBar from '../components/SideBar'

const Container = styled.div`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
`

const MainContainer = () => {
    const [size, setSize] = useState({
        tall: true,
        wide: false
    })
    const sizeHandler = (e) => {
        console.log(e.target.value)
        if (e.target.value === 'tall') {
            setSize({tall: true, wide: false})
        } else {
            setSize({tall: false, wide: true})
        }
    }
    return (
        <Container>
            <Main size={size} />
            <SideBar size={size} sizeHandler={sizeHandler} />
        </Container>
    )
}

export default MainContainer
