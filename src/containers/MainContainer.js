import React from 'react'
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
    return (
        <Container>
            <Main />
            <SideBar />
        </Container>
    )
}

export default MainContainer
